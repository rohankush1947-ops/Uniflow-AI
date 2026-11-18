import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async req => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    // 1. Verify caller from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const authClient = createClient(supabaseUrl, supabaseAnonKey);
    const { data: { user }, error: userErr } = await authClient.auth.getUser(token);

    if (userErr || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized: Invalid student session token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const payload = await req.json();

    // 2. Server-side student identity check (Requirement 6 & 7)
    const userEmail = (user.email || '').toLowerCase().trim();
    const payloadEmail = (payload.p_email || '').toLowerCase().trim();

    if (!userEmail || userEmail !== payloadEmail) {
      return new Response(
        JSON.stringify({
          error: `Access denied: You cannot submit an application for another user (${payloadEmail} vs ${userEmail}).`,
        }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // 3. Connect via server-side service_role (never exposed to client)
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Call internal submit_hostel_application RPC using elevated service privileges
    const { data: appData, error: rpcErr } = await adminClient.rpc('submit_hostel_application', payload);

    if (rpcErr) {
      // If RPC doesn't exist, execute direct service-role insert
      if (rpcErr.code === 'PGRST202' || rpcErr.message?.includes('schema cache')) {
        const now = new Date().toISOString();

        // Check duplicate by enrollment_number, student_id, or email
        const { data: existing } = await adminClient
          .from('applications')
          .select('application_id')
          .or(`enrollment_number.eq.${payload.p_enrollment_number.trim()},student_id.eq.${user.id},email.eq.${userEmail}`)
          .eq('application_cycle', payload.p_application_cycle)
          .maybeSingle();

        if (existing) {
          return new Response(
            JSON.stringify({
              error: `Duplicate application: An application (${existing.application_id}) is already registered for this student/enrollment number in cycle ${payload.p_application_cycle}.`,
            }),
            { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Safe numeric year extraction (Requirements 3, 4, 5)
        const numericYear =
          typeof payload.p_year === 'number'
            ? payload.p_year
            : parseInt(String(payload.p_year).match(/\b([1-9])\b/)?.[1] || '1', 10);

        // Ensure student profile exists in students table before inserting application (Requirement 3, 4, 5)
        const { error: studentUpsertErr } = await adminClient
          .from('students')
          .upsert(
            {
              id: user.id,
              enrollment_number: payload.p_enrollment_number.trim(),
              student_name: payload.p_student_name.trim(),
              email: userEmail,
              phone: payload.p_phone.trim(),
              department: payload.p_department,
              year: numericYear,
              address: payload.p_address.trim(),
              updated_at: now,
            },
            { onConflict: 'id' }
          );

        if (studentUpsertErr) {
          return new Response(JSON.stringify({ error: `Student profile sync error: ${studentUpsertErr.message}` }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const { data: newApp, error: insertErr } = await adminClient
          .from('applications')
          .insert({
            application_id: payload.p_application_id,
            student_id: user.id,
            enrollment_number: payload.p_enrollment_number.trim(),
            student_name: payload.p_student_name.trim(),
            email: userEmail,
            phone: payload.p_phone.trim(),
            department: payload.p_department,
            year: numericYear,
            hostel_preference: payload.p_hostel_preference,
            address: payload.p_address.trim(),
            application_cycle: payload.p_application_cycle,
            status: 'Submitted',
            documents: payload.p_documents_payload || {},
            mandatory_fields_complete: true,
            mandatory_documents_complete: true,
            documents_accessible: true,
            document_validation_notes: 'Application registered. Awaiting automated intake / Make.com trigger.',
            submitted_at: now,
            created_at: now,
            updated_at: now,
          })
          .select()
          .single();

        if (insertErr) {
          return new Response(JSON.stringify({ error: insertErr.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Insert documents
        if (payload.p_document_records && payload.p_document_records.length > 0) {
          const docInserts = payload.p_document_records.map((d: any) => ({
            application_id: newApp.id,
            document_type: d.document_type,
            file_name: d.file_name,
            document_url: d.document_url,
            uploaded_at: now,
            updated_at: now,
          }));
          await adminClient.from('application_documents').insert(docInserts);
        }

        // Insert workflow history
        await adminClient.from('application_workflow_history').insert({
          application_id: newApp.id,
          actor_type: 'student',
          remarks: payload.p_remarks || 'Online hostel application submitted by student.',
          metadata: { stage: 'Submission', status: 'Submitted', performed_by: payload.p_student_name.trim() },
          created_at: now,
        });

        return new Response(JSON.stringify({ success: true, application: newApp }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ error: rpcErr.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, application: appData }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Internal Edge Function Error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

