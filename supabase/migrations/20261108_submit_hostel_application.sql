-- ==============================================================================
-- UniFlow AI: Complete Database & Storage Security Hardened Migration
-- File: supabase/migrations/20261108_submit_hostel_application.sql
--
-- Security & Integrity Hardening:
-- 1. Removed broad EXCEPTION WHEN OTHERS THEN (no silent error suppression).
-- 2. Handles only explicitly expected conflicts on primary key / identity.
-- 3. Student profile creation/update strictly succeeds BEFORE application insertion.
-- 4. student_id verified to reference authenticated student's confirmed profile.
-- 5. Full compatibility with existing triggers (sync_student_from_application).
-- 6. Atomic transaction: all steps succeed or entire transaction rolls back.
-- 7. Returns clear, actionable SQLSTATE errors with diagnostic hints.
-- 8. Preserves strict RLS, Storage access isolation, and server-side service_role.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Configure Storage Bucket 'documents' (Private)
-- ------------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  false,
  5242880, -- 5 MB limit
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']::text[];

-- ------------------------------------------------------------------------------
-- 2. Access Control Helper Functions (SECURITY DEFINER)
-- ------------------------------------------------------------------------------

-- Helper 1: Verify if the current session belongs to an active administrator
CREATE OR REPLACE FUNCTION public.is_active_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, auth
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE lower(email) = lower(trim(coalesce(auth.jwt() ->> 'email', '')))
      AND is_active = true
  );
$$;

-- Helper 2: Verify if caller is authorized to access document in 'documents'
-- Strictly: Active administrators OR the student who owns the application
CREATE OR REPLACE FUNCTION public.can_access_document(object_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public, auth
AS $$
DECLARE
  v_app_id text;
  v_uid uuid := auth.uid();
  v_email text := lower(trim(coalesce(auth.jwt() ->> 'email', '')));
BEGIN
  IF v_uid IS NULL THEN
    RETURN false;
  END IF;

  -- 1. Authorized active administrators have full access
  IF public.is_active_admin() THEN
    RETURN true;
  END IF;

  -- 2. Extract application_id from storage path: hostel-applications/<application_id>/<file>
  v_app_id := split_part(object_name, '/', 2);

  -- 3. Owning student verification against applications table
  IF v_app_id IS NOT NULL AND v_app_id <> '' THEN
    IF EXISTS (
      SELECT 1 FROM public.applications
      WHERE application_id = v_app_id
        AND (
          student_id = v_uid 
          OR lower(trim(email)) = v_email
        )
    ) THEN
      RETURN true;
    END IF;
  END IF;

  RETURN false;
END;
$$;

-- ------------------------------------------------------------------------------
-- 3. Storage Policies on storage.objects for Bucket 'documents'
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Allow authenticated reads on documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads to documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates on documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow owning student and admins to read documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow student upload to own application documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow owning student and admins to update documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow owning student and admins to delete documents" ON storage.objects;

-- Policy A: SELECT (Read/Download) - Owning student and active admins only
CREATE POLICY "Allow owning student and admins to read documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents'
  AND (
    (owner IS NOT NULL AND owner::text = auth.uid()::text)
    OR public.can_access_document(name)
  )
);

-- Policy B: INSERT (Upload) - Authenticated student uploading to hostel-applications/
CREATE POLICY "Allow student upload to own application documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents'
  AND name LIKE 'hostel-applications/%'
  AND (
    owner IS NULL
    OR owner::text = auth.uid()::text
  )
);

-- Policy C: UPDATE - Owning student or active admin only
CREATE POLICY "Allow owning student and admins to update documents"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'documents'
  AND (
    (owner IS NOT NULL AND owner::text = auth.uid()::text)
    OR public.can_access_document(name)
  )
);

-- Policy D: DELETE - Owning student or active admin only
CREATE POLICY "Allow owning student and admins to delete documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents'
  AND (
    (owner IS NOT NULL AND owner::text = auth.uid()::text)
    OR public.can_access_document(name)
  )
);

-- ------------------------------------------------------------------------------
-- 4. Core RPC Function: submit_hostel_application (Named Arguments)
-- ------------------------------------------------------------------------------
-- Drop previous signature with text year parameter to prevent collision
DROP FUNCTION IF EXISTS public.submit_hostel_application(text, text, text, text, text, text, text, text, text, text, jsonb, jsonb, text);

CREATE OR REPLACE FUNCTION public.submit_hostel_application(
  p_application_id text,
  p_enrollment_number text,
  p_student_name text,
  p_email text,
  p_phone text,
  p_department text,
  p_year integer,
  p_hostel_preference text,
  p_address text,
  p_application_cycle text,
  p_documents_payload jsonb DEFAULT '{}'::jsonb,
  p_document_records jsonb DEFAULT '[]'::jsonb,
  p_remarks text DEFAULT 'Online hostel application submitted by student.'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  v_caller_id uuid;
  v_caller_email text;
  v_student_id uuid;
  v_existing_id text;
  v_app_row public.applications%ROWTYPE;
  v_doc record;
  v_now timestamptz := clock_timestamp();
  v_result jsonb;
BEGIN
  -- ============================================================================
  -- Step 1: Verify Caller Authentication & Verified Email
  -- ============================================================================
  v_caller_id := auth.uid();
  v_caller_email := lower(trim(coalesce(auth.jwt() ->> 'email', '')));

  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required: You must be logged into your student account to submit an application.'
      USING ERRCODE = '42501',
            HINT = 'Please sign in with your student credentials and retry.';
  END IF;

  IF v_caller_email = '' THEN
    RAISE EXCEPTION 'Authentication error: Valid email address not found in authenticated session token.'
      USING ERRCODE = '42501',
            HINT = 'Please sign out and sign in again to refresh your session.';
  END IF;

  -- ============================================================================
  -- Step 2: Server-Side Student Identity Verification
  -- ============================================================================
  IF lower(trim(p_email)) <> v_caller_email THEN
    RAISE EXCEPTION 'Access denied: You cannot submit an application on behalf of another user (form email "%" does not match authenticated user email "%").',
      lower(trim(p_email)), v_caller_email
      USING ERRCODE = '42501',
            HINT = 'Ensure the application email matches your logged-in student account.';
  END IF;

  -- ============================================================================
  -- Step 3: Check Enrollment Number Ownership Collision
  -- ============================================================================
  IF EXISTS (
    SELECT 1 FROM public.students
    WHERE lower(trim(enrollment_number)) = lower(trim(p_enrollment_number))
      AND id <> v_caller_id
      AND lower(trim(email)) <> v_caller_email
  ) THEN
    RAISE EXCEPTION 'Enrollment number "%" is already registered to another student account.',
      trim(p_enrollment_number)
      USING ERRCODE = '23505',
            HINT = 'Please verify your enrollment number or contact the administration office.';
  END IF;

  -- ============================================================================
  -- Step 4: Ensure Student Profile Exists & Succeeds BEFORE Application Insert
  -- (Crucial for sync_student_from_application trigger & foreign key integrity)
  -- No broad EXCEPTION WHEN OTHERS THEN.
  -- ============================================================================
  SELECT id INTO v_student_id
  FROM public.students
  WHERE id = v_caller_id OR lower(trim(email)) = v_caller_email
  LIMIT 1;

  IF v_student_id IS NULL THEN
    -- Insert new profile strictly for the authenticated caller
    -- Conflict on primary key (id) updates the profile in-place
    INSERT INTO public.students (
      id,
      enrollment_number,
      student_name,
      email,
      phone,
      department,
      year,
      address,
      created_at,
      updated_at
    ) VALUES (
      v_caller_id,
      trim(p_enrollment_number),
      trim(p_student_name),
      v_caller_email,
      trim(p_phone),
      p_department,
      p_year,
      trim(p_address),
      v_now,
      v_now
    )
    ON CONFLICT (id) DO UPDATE SET
      enrollment_number = EXCLUDED.enrollment_number,
      student_name = EXCLUDED.student_name,
      phone = EXCLUDED.phone,
      department = EXCLUDED.department,
      year = EXCLUDED.year,
      address = EXCLUDED.address,
      updated_at = v_now
    RETURNING id INTO v_student_id;
  ELSE
    -- Profile already exists; update it for the authenticated caller
    UPDATE public.students
    SET
      enrollment_number = trim(p_enrollment_number),
      student_name = trim(p_student_name),
      phone = trim(p_phone),
      department = p_department,
      year = p_year,
      address = trim(p_address),
      updated_at = v_now
    WHERE id = v_student_id;
  END IF;

  -- Confirm student profile establishment
  IF v_student_id IS NULL THEN
    RAISE EXCEPTION 'Failed to establish student profile for user %.', v_caller_id
      USING ERRCODE = 'P0001',
            HINT = 'Database error: unable to establish student record before application insertion.';
  END IF;

  -- ============================================================================
  -- Step 5: Duplicate Application Check for Active Cycle
  -- ============================================================================
  SELECT application_id INTO v_existing_id
  FROM public.applications
  WHERE (
    lower(trim(enrollment_number)) = lower(trim(p_enrollment_number))
    OR student_id = v_student_id
    OR lower(trim(email)) = v_caller_email
  )
  AND application_cycle = p_application_cycle
  LIMIT 1;

  IF v_existing_id IS NOT NULL THEN
    RAISE EXCEPTION 'Duplicate application: An application (%) is already registered for enrollment number % in cycle %.',
      v_existing_id, p_enrollment_number, p_application_cycle
      USING ERRCODE = '23505',
            HINT = 'You can review your existing application status under My Applications.';
  END IF;

  -- ============================================================================
  -- Step 6: Atomic Insert into applications Table
  -- Any existing trigger (e.g. sync_student_from_application) fires here and
  -- finds a fully confirmed student profile matching student_id.
  -- ============================================================================
  INSERT INTO public.applications (
    application_id,
    student_id,
    enrollment_number,
    student_name,
    email,
    phone,
    department,
    year,
    hostel_preference,
    address,
    application_cycle,
    status,
    documents,
    mandatory_fields_complete,
    mandatory_documents_complete,
    documents_accessible,
    document_validation_notes,
    submitted_at,
    created_at,
    updated_at
  ) VALUES (
    p_application_id,
    v_student_id,
    trim(p_enrollment_number),
    trim(p_student_name),
    v_caller_email, -- Always verified authenticated email
    trim(p_phone),
    p_department,
    p_year,
    p_hostel_preference,
    trim(p_address),
    p_application_cycle,
    'Submitted',
    coalesce(p_documents_payload, '{}'::jsonb),
    true,
    true,
    true,
    'Application registered. Awaiting automated intake / Make.com trigger.',
    v_now,
    v_now,
    v_now
  )
  RETURNING * INTO v_app_row;

  -- ============================================================================
  -- Step 7: Insert Document Metadata into application_documents
  -- Matches live schema: (id, application_id [UUID], document_type, file_name, document_url, uploaded_at, updated_at)
  -- ============================================================================
  IF p_document_records IS NOT NULL AND jsonb_array_length(p_document_records) > 0 THEN
    FOR v_doc IN SELECT * FROM jsonb_to_recordset(p_document_records) AS x(
      document_type text,
      file_name text,
      document_url text
    )
    LOOP
      INSERT INTO public.application_documents (
        application_id,
        document_type,
        file_name,
        document_url,
        uploaded_at,
        updated_at
      ) VALUES (
        v_app_row.id,
        v_doc.document_type,
        v_doc.file_name,
        v_doc.document_url,
        v_now,
        v_now
      );
    END LOOP;
  END IF;

  -- ============================================================================
  -- Step 8: Insert Initial Workflow History Record
  -- Matches live schema: (id, application_id [UUID], actor_type, remarks, metadata, created_at)
  -- ============================================================================
  INSERT INTO public.application_workflow_history (
    application_id,
    actor_type,
    remarks,
    metadata,
    created_at
  ) VALUES (
    v_app_row.id,
    'student',
    coalesce(p_remarks, 'Online hostel application submitted by student.'),
    jsonb_build_object(
      'stage', 'Submission',
      'status', 'Submitted',
      'performed_by', trim(p_student_name),
      'caller_uid', v_caller_id
    ),
    v_now
  );

  -- ============================================================================
  -- Step 9: Return Inserted Application Record as JSON
  -- ============================================================================
  v_result := to_jsonb(v_app_row);
  RETURN v_result;
END;
$$;

-- ------------------------------------------------------------------------------
-- 5. Overload RPC Function: submit_hostel_application(p_payload jsonb)
-- Enables PostgREST invocation when called with a single JSON body object
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.submit_hostel_application(p_payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
BEGIN
  RETURN public.submit_hostel_application(
    (p_payload ->> 'p_application_id')::text,
    (p_payload ->> 'p_enrollment_number')::text,
    (p_payload ->> 'p_student_name')::text,
    (p_payload ->> 'p_email')::text,
    (p_payload ->> 'p_phone')::text,
    (p_payload ->> 'p_department')::text,
    coalesce(
      (p_payload ->> 'p_year')::integer,
      substring((p_payload ->> 'p_year') from '([1-9])')::integer,
      1
    ),
    (p_payload ->> 'p_hostel_preference')::text,
    (p_payload ->> 'p_address')::text,
    (p_payload ->> 'p_application_cycle')::text,
    coalesce(p_payload -> 'p_documents_payload', '{}'::jsonb),
    coalesce(p_payload -> 'p_document_records', '[]'::jsonb),
    coalesce(p_payload ->> 'p_remarks', 'Online hostel application submitted by student.')::text
  );
END;
$$;

-- ------------------------------------------------------------------------------
-- 6. Configure Permissions: Revoke from PUBLIC, Grant to authenticated
-- Keeps service_role strictly on the server
-- ------------------------------------------------------------------------------
REVOKE ALL ON FUNCTION public.is_active_admin() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.can_access_document(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.submit_hostel_application(text, text, text, text, text, text, integer, text, text, text, jsonb, jsonb, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.submit_hostel_application(jsonb) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.is_active_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_access_document(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.submit_hostel_application(text, text, text, text, text, text, integer, text, text, text, jsonb, jsonb, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.submit_hostel_application(jsonb) TO authenticated;

COMMENT ON FUNCTION public.submit_hostel_application(text, text, text, text, text, text, integer, text, text, text, jsonb, jsonb, text) IS
  'Secure atomic hostel application submission with integer academic year. Enforces authenticated student verification, ensures student profile creation succeeds before application insert, preserves existing triggers, and maintains strict RLS.';
