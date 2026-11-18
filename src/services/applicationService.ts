import { supabase, isSupabaseConfigured, uploadDocumentToStorage } from '../lib/supabase';
import {
  Application,
  ApplicationStatus,
  HostelApplicationFormData,
  WorkflowHistoryItem,
  ApplicationDocument,
} from '../types';
import { INITIAL_APPLICATIONS, INITIAL_WORKFLOW_HISTORY } from '../lib/mockData';
import { settingsService } from './settingsService';
import { parseAcademicYearToInteger } from '../lib/academicYear';

// Local cache only used when Supabase is NOT configured (e.g. offline preview)
let localApplications: Application[] = [...INITIAL_APPLICATIONS];
let localWorkflowHistory: Record<string, WorkflowHistoryItem[]> = { ...INITIAL_WORKFLOW_HISTORY };

// Active in-flight submission lock to prevent concurrent double-clicks/requests
const inFlightSubmissions = new Set<string>();

// Active in-flight webhook requests to prevent concurrent calls
const inFlightWebhooks = new Set<string>();

// Storage keys for persistent tracking of dispatched and failed webhooks
const DISPATCHED_STORAGE_KEY = 'uniflow_dispatched_webhooks';
const FAILED_WEBHOOKS_KEY = 'uniflow_failed_webhooks';

export interface WebhookFailureRecord {
  applicationId: string;
  studentName: string;
  enrollmentNumber: string;
  timestamp: string;
  error: string;
  endpoint: string;
  payload: any;
}

// In-memory set initialized from sessionStorage if available to survive page reloads
const dispatchedWebhooks = new Set<string>();

if (typeof window !== 'undefined' && window.sessionStorage) {
  try {
    const raw = window.sessionStorage.getItem(DISPATCHED_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        parsed.forEach((id: string) => dispatchedWebhooks.add(id));
      }
    }
  } catch (e) {
    // ignore storage parsing error
  }
}

function markWebhookDispatched(applicationId: string) {
  dispatchedWebhooks.add(applicationId);
  if (typeof window !== 'undefined' && window.sessionStorage) {
    try {
      window.sessionStorage.setItem(
        DISPATCHED_STORAGE_KEY,
        JSON.stringify(Array.from(dispatchedWebhooks))
      );
    } catch (e) {
      // ignore storage error
    }
  }
}

function logWebhookFailure(record: WebhookFailureRecord) {
  console.error(`[Make.com Webhook Failure] App ID: ${record.applicationId} | Error: ${record.error}`, record);
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const raw = window.localStorage.getItem(FAILED_WEBHOOKS_KEY);
      const list: WebhookFailureRecord[] = raw ? JSON.parse(raw) : [];
      list.push(record);
      // Retain last 50 failure logs
      if (list.length > 50) list.shift();
      window.localStorage.setItem(FAILED_WEBHOOKS_KEY, JSON.stringify(list));
    } catch (e) {
      // ignore storage write errors
    }
  }
}

/**
 * Generates an official university application ID
 * Format: HOSTEL-YYYY-XXXXX (e.g., HOSTEL-2025-48192)
 */
export function generateApplicationId(cycleYear: string = '2025'): string {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let randomCode = '';
  for (let i = 0; i < 5; i++) {
    randomCode += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `HOSTEL-${cycleYear}-${randomCode}`;
}

/**
 * Triggers the Make.com Custom Webhook asynchronously after application is successfully saved.
 * Exact fields sent matching Make.com webhook structure:
 * - action
 * - student_name
 * - enrollment_number
 * - email
 * - phone
 * - department
 * - year
 * - hostel_preference
 * - address
 * - documents
 */
async function triggerMakeHostelWebhook(params: {
  applicationId: string;
  studentName: string;
  enrollmentNumber: string;
  email: string;
  phone: string;
  department: string;
  year: number | string;
  hostelPreference: string;
  address: string;
  documents: Record<string, string>;
  action?: string;
  internalDbId?: string;
}): Promise<{ success: boolean; error?: string }> {
  const makeWebhookUrl =
    settingsService.getSubmissionWebhookUrl() || import.meta.env.VITE_MAKE_WEBHOOK_URL;
  if (!makeWebhookUrl || makeWebhookUrl.trim() === '') {
    return { success: true };
  }

  // Prevent duplicate webhook submissions for the same application ID (Requirement 6)
  if (dispatchedWebhooks.has(params.applicationId) || inFlightWebhooks.has(params.applicationId)) {
    console.warn(`[Make.com Webhook] Webhook already dispatched or in-flight for application ${params.applicationId}. Skipping duplicate.`);
    return { success: true };
  }

  // Mark in-flight immediately to prevent concurrent calls
  inFlightWebhooks.add(params.applicationId);

  const webhookUrl = makeWebhookUrl.trim();

  // Consistent integer conversion for year in Make.com webhook payload (Requirements 2, 3, 5)
  const webhookYear: number =
    typeof params.year === 'number' && !isNaN(params.year) && params.year > 0
      ? params.year
      : (parseAcademicYearToInteger(params.year) || 1);

  // Exact payload fields matching Make.com webhook structure:
  // action, student_name, enrollment_number, email, phone, department, year, hostel_preference, address, documents
  const payload = {
    action: params.action || import.meta.env.VITE_MAKE_WEBHOOK_ACTION || 'new_hostel_application',
    student_name: params.studentName,
    enrollment_number: params.enrollmentNumber,
    email: params.email,
    phone: params.phone,
    department: params.department,
    year: webhookYear,
    hostel_preference: params.hostelPreference,
    address: params.address,
    documents: params.documents,
    // Supplemental identifier to aid downstream reconciliation
    application_id: params.applicationId,
  };

  // 35-second client timeout to gracefully handle slow Make.com scenarios without hanging
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 35000);

  try {
    console.log(`[Make.com Webhook] Initiating asynchronous webhook dispatch for application ${params.applicationId}...`);
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    // Request reached Make.com, mark as dispatched to prevent duplicate dispatches
    markWebhookDispatched(params.applicationId);

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      const isTimeout =
        res.status === 408 ||
        res.status === 504 ||
        errText.toLowerCase().includes('exceeded maximum wait time');

      const errMsg = isTimeout
        ? `Make.com scenario execution exceeded maximum wait time (HTTP ${res.status}). The scenario has multiple router branches and continues processing in the background.`
        : `Make.com webhook failed with HTTP status ${res.status}: ${errText || res.statusText || 'Webhook error'}`;

      // Requirement 7: Log webhook failures for debugging and future retries
      logWebhookFailure({
        applicationId: params.applicationId,
        studentName: params.studentName,
        enrollmentNumber: params.enrollmentNumber,
        timestamp: new Date().toISOString(),
        error: errMsg,
        endpoint: webhookUrl,
        payload,
      });

      // Update Supabase document_validation_notes with background note (without failing submission status)
      if (isSupabaseConfigured && params.internalDbId) {
        try {
          await supabase
            .from('applications')
            .update({
              document_validation_notes: `Application registered in database. Background automation note: ${errMsg}`,
            })
            .eq('id', params.internalDbId);
        } catch (e: any) {
          console.warn('Could not update validation notes:', e);
        }
      }

      return { success: false, error: errMsg };
    }

    console.log(`[Make.com Webhook] Webhook response received successfully for application ${params.applicationId}`);
    return { success: true };
  } catch (err: any) {
    clearTimeout(timeoutId);

    // Mark as dispatched because request was already dispatched across the wire
    markWebhookDispatched(params.applicationId);

    const isTimeout = err.name === 'AbortError' || err.message?.includes('aborted');
    const errMsg = isTimeout
      ? 'Make.com scenario exceeded maximum client wait time (35s). Scenario is executing branches in the background.'
      : `Failed to connect to Make.com webhook: ${err.message || 'Network error'}`;

    // Requirement 7: Log webhook failures for debugging and future retries
    logWebhookFailure({
      applicationId: params.applicationId,
      studentName: params.studentName,
      enrollmentNumber: params.enrollmentNumber,
      timestamp: new Date().toISOString(),
      error: errMsg,
      endpoint: webhookUrl,
      payload,
    });

    if (isSupabaseConfigured && params.internalDbId) {
      try {
        await supabase
          .from('applications')
          .update({
            document_validation_notes: `Application registered in database. Background automation notice: ${errMsg}`,
          })
          .eq('id', params.internalDbId);
      } catch (e: any) {
        console.warn('Could not update validation notes:', e);
      }
    }

    return { success: false, error: errMsg };
  } finally {
    inFlightWebhooks.delete(params.applicationId);
  }
}

export const applicationService = {
  /**
   * Submit a new hostel application
   */
  async createApplication(
    formData: HostelApplicationFormData,
    studentId: string
  ): Promise<{ success: boolean; application?: Application; error?: string }> {
    const submissionKey = `${formData.enrollmentNumber.trim().toUpperCase()}_${formData.applicationCycle}`;

    // Prevent concurrent in-flight submissions
    if (inFlightSubmissions.has(submissionKey)) {
      return {
        success: false,
        error: 'An application submission is already in progress for this student. Please wait.',
      };
    }
    inFlightSubmissions.add(submissionKey);

    try {
      // Step 0: If Supabase is configured, verify active student session
      if (isSupabaseConfigured) {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session?.user) {
          return {
            success: false,
            error: 'Authentication required: You must be logged into your student account to submit an application. Please sign in and retry.',
          };
        }

        const sessionEmail = (session.user.email || '').toLowerCase().trim();
        const formEmail = formData.email.toLowerCase().trim();
        if (sessionEmail && formEmail && sessionEmail !== formEmail) {
          return {
            success: false,
            error: `Email mismatch: You are signed in as ${sessionEmail}, but your application lists ${formEmail}. Applications can only be submitted for your authenticated account.`,
          };
        }
      }

      // Verify all required NOT NULL columns for applications table (Requirement 4)
      const enrollmentNumber = (formData.enrollmentNumber || '').trim();
      const studentName = (formData.fullName || '').trim();
      const email = (formData.email || '').trim();

      if (!enrollmentNumber) {
        return {
          success: false,
          error: 'Enrollment number is required and cannot be blank.',
        };
      }
      if (!studentName) {
        return {
          success: false,
          error: 'Student full legal name is required and cannot be blank.',
        };
      }
      if (!email) {
        return {
          success: false,
          error: 'Student email address is required and cannot be blank.',
        };
      }

      // Validate academic year and convert into valid JavaScript number (int4) (Requirements 1, 2, 3, 4, 6)
      const parsedYear = parseAcademicYearToInteger(formData.academicYear);
      if (parsedYear === null || typeof parsedYear !== 'number' || isNaN(parsedYear) || parsedYear <= 0) {
        return {
          success: false,
          error: 'Please select a valid academic year (1st, 2nd, 3rd, or 4th Year).',
        };
      }
      const numericYear: number = Number(parsedYear);

      const appId = generateApplicationId('2025');
      const now = new Date().toISOString();

      // Check for existing duplicate application in database / local store
      if (isSupabaseConfigured) {
        const { data: existingApp, error: checkError } = await supabase
          .from('applications')
          .select('*')
          .eq('enrollment_number', enrollmentNumber)
          .eq('application_cycle', formData.applicationCycle)
          .maybeSingle();

        if (checkError) {
          console.error('[Database Operation Failed: SELECT from applications (Duplicate Check)]', {
            operation: 'SELECT',
            table: 'applications',
            filter: { enrollment_number: enrollmentNumber, application_cycle: formData.applicationCycle },
            error: checkError,
          });
        }

        if (!checkError && existingApp) {
          // If webhook was not dispatched yet, trigger it asynchronously in background
          if (!dispatchedWebhooks.has(existingApp.application_id)) {
            console.log(`Existing application found (${existingApp.application_id}). Triggering background Make.com dispatch.`);
            triggerMakeHostelWebhook({
              applicationId: existingApp.application_id,
              studentName: existingApp.student_name || studentName,
              enrollmentNumber: existingApp.enrollment_number || enrollmentNumber,
              email: existingApp.email || email,
              phone: existingApp.phone || formData.phone.trim(),
              department: existingApp.department || formData.department,
              year: parseAcademicYearToInteger(existingApp.year) || numericYear,
              hostelPreference: existingApp.hostel_preference || formData.hostelPreference,
              address: existingApp.address || formData.address.trim(),
              documents: existingApp.documents || {},
              internalDbId: existingApp.id,
            }).catch(err => {
              console.warn('[Automation Warning: Background Retry Webhook Dispatch]', err);
            });
          }

          return {
            success: false,
            error: `A hostel application (${existingApp.application_id}) has already been successfully submitted for enrollment number ${enrollmentNumber} for ${formData.applicationCycle}. Duplicate applications are not allowed.`,
          };
        }
      } else {
        // Local mode duplicate check
        const existingLocal = localApplications.find(
          a =>
            a.enrollment_number.toLowerCase() === formData.enrollmentNumber.trim().toLowerCase() &&
            a.application_cycle === formData.applicationCycle
        );
        if (existingLocal) {
          if (dispatchedWebhooks.has(existingLocal.application_id)) {
            return {
              success: false,
              error: `A hostel application (${existingLocal.application_id}) has already been registered for this cycle. Duplicate applications are not allowed.`,
            };
          }
        }
      }

      // Upload documents
      const uploadedDocUrls: Record<string, string> = {};
      const documentRecords: Partial<ApplicationDocument>[] = [];

      const docKeys: (keyof typeof formData.documents)[] = [
        'studentIdCard',
        'aadhaarCard',
        'marksheet',
        'incomeCertificate',
      ];

      for (const key of docKeys) {
        const file = formData.documents[key];
        if (file) {
          const uploadRes = await uploadDocumentToStorage(file, `hostel-applications/${appId}`);
          if (uploadRes.error) {
            console.error(`Document upload error for ${key}:`, uploadRes.error);
            const errDetail = (uploadRes.error.message || '').toLowerCase();
            if (errDetail.includes('bucket not found') || errDetail.includes('nosuchbucket') || uploadRes.error.statusCode === '404') {
              return {
                success: false,
                error: `Supabase Storage setup required: The 'documents' storage bucket does not exist in your Supabase project. Please execute the provided SQL migration in your Supabase SQL Editor (Dashboard > SQL Editor) to create the 'documents' bucket and policies.`,
              };
            }
            if (errDetail.includes('row-level security') || errDetail.includes('unauthorized') || uploadRes.error.statusCode === '403') {
              return {
                success: false,
                error: `Storage permission denied: Unable to upload ${file.name}. Please ensure you are logged into your student account with valid upload privileges.`,
              };
            }
            return {
              success: false,
              error: `Document upload failed for ${file.name}: ${uploadRes.error.message || 'Storage error'}.`,
            };
          }

          const fileUrl = uploadRes.url || `documents/hostel-applications/${appId}/${file.name}`;
          uploadedDocUrls[key] = fileUrl;

          documentRecords.push({
            document_type:
              key === 'studentIdCard'
                ? 'student_id_card'
                : key === 'aadhaarCard'
                ? 'aadhaar_card'
                : key === 'marksheet'
                ? 'marksheet'
                : 'income_certificate',
            file_name: file.name,
            document_url: fileUrl,
            uploaded_at: now,
            updated_at: now,
          });
        }
      }

      const hasMandatoryDocs = Boolean(
        formData.documents.studentIdCard && formData.documents.aadhaarCard && formData.documents.marksheet
      );

      // Structure documents object for webhook and database with both snake_case and camelCase
      const documentsPayload: Record<string, string> = {
        student_id_card: uploadedDocUrls.studentIdCard || '',
        aadhaar_card: uploadedDocUrls.aadhaarCard || '',
        marksheet: uploadedDocUrls.marksheet || '',
        income_certificate: uploadedDocUrls.incomeCertificate || '',
        studentIdCard: uploadedDocUrls.studentIdCard || '',
        aadhaarCard: uploadedDocUrls.aadhaarCard || '',
        incomeCertificate: uploadedDocUrls.incomeCertificate || '',
      };

      const applicationRecord = {
        application_id: appId,
        student_id: studentId && studentId !== 'stu-demo' ? studentId : null,
        enrollment_number: formData.enrollmentNumber.trim(),
        student_name: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        department: formData.department,
        year: numericYear,
        hostel_preference: formData.hostelPreference,
        address: formData.address.trim(),
        application_cycle: formData.applicationCycle,
        status: 'Submitted' as ApplicationStatus,
        documents: documentsPayload,
        mandatory_fields_complete: true,
        mandatory_documents_complete: hasMandatoryDocs,
        documents_accessible: true,
        document_validation_notes: 'Application registered. Awaiting automated intake / Make.com trigger.',
        submitted_at: now,
        created_at: now,
        updated_at: now,
      };

      if (isSupabaseConfigured) {
        let insertedApp: Application | null = null;
        let internalId = appId;

        // Prepare parameters for secure atomic server-side submission (Requirement 3, 4, 6, 7, 8, 9)
        const rpcPayload = {
          p_application_id: appId,
          p_enrollment_number: formData.enrollmentNumber.trim(),
          p_student_name: formData.fullName.trim(),
          p_email: formData.email.trim(),
          p_phone: formData.phone.trim(),
          p_department: formData.department,
          p_year: numericYear,
          p_hostel_preference: formData.hostelPreference,
          p_address: formData.address.trim(),
          p_application_cycle: formData.applicationCycle,
          p_documents_payload: documentsPayload,
          p_document_records: documentRecords.map(doc => ({
            document_type: doc.document_type,
            file_name: doc.file_name,
            document_url: doc.document_url,
          })),
          p_remarks: 'Online hostel application submitted by student.',
        };

        // 1. Primary Secure Path: Execute server-side RPC (SECURITY DEFINER)
        // Verifies student identity server-side via auth.uid() & JWT email without granting direct INSERT table permissions.
        const { data: rpcData, error: rpcError } = await supabase.rpc('submit_hostel_application', rpcPayload);

        if (!rpcError && rpcData) {
          insertedApp = rpcData as Application;
          internalId = (insertedApp as any).id || appId;
        } else {
          // Identify exact failed database operation (Requirement 7)
          if (rpcError) {
            console.error('[Database Operation Failed: supabase.rpc("submit_hostel_application")]', {
              operation: 'RPC submit_hostel_application',
              code: rpcError.code,
              message: rpcError.message,
              details: rpcError.details,
              hint: rpcError.hint,
              payload: {
                ...rpcPayload,
                p_year_type: typeof rpcPayload.p_year,
                p_year_value: rpcPayload.p_year,
              },
            });
          }

          // If RPC is not installed or schema cache not updated, try Supabase Edge Function fallback
          if (rpcError && (rpcError.code === 'PGRST202' || rpcError.message?.includes('schema cache') || rpcError.message?.includes('Could not find the function'))) {
            console.warn('[Database Fallback] RPC submit_hostel_application not found in database. Attempting Supabase Edge Function fallback...');
            try {
              const { data: edgeData, error: edgeError } = await supabase.functions.invoke('submit-hostel-application', {
                body: rpcPayload,
              });

              if (!edgeError && edgeData?.application) {
                insertedApp = edgeData.application as Application;
                internalId = insertedApp.id || appId;
              } else if (edgeError) {
                console.error('[Database Operation Failed: Edge Function "submit-hostel-application"]', {
                  operation: 'Edge Function submit-hostel-application',
                  name: edgeError.name,
                  message: edgeError.message,
                  status: (edgeError as any).context?.status || (edgeError as any).status,
                  context: (edgeError as any).context,
                  payload: rpcPayload,
                });
                let detailedError = edgeError.message || '';
                const edgeStatus = (edgeError as any).context?.status || (edgeError as any).status;

                if (
                  edgeStatus === 404 ||
                  detailedError.toLowerCase().includes('failed to send a request') ||
                  edgeError.name === 'FunctionsFetchError' ||
                  edgeError.name === 'FunctionsHttpError'
                ) {
                  detailedError =
                    'Backend setup required: Neither the database RPC function (submit_hostel_application) nor the Edge Function (submit-hostel-application) is currently deployed in your Supabase project (yahvcyibzepcmetuwltk).\n\nTo resolve this immediately: Run the SQL migration script in your Supabase SQL Editor (Dashboard > SQL Editor) to install the stored procedure and storage bucket.';
                }

                return {
                  success: false,
                  error: detailedError,
                };
              }
            } catch (invokeErr: any) {
              console.error('[Database Operation Failed: Edge Function Network Exception]', {
                operation: 'Edge Function submit-hostel-application invocation',
                error: invokeErr,
              });
              return {
                success: false,
                error:
                  'Backend setup required: The submit-hostel-application Edge Function is not deployed, and the submit_hostel_application database RPC is not yet installed in Supabase. Please run the SQL migration script in your Supabase SQL Editor.',
              };
            }
          } else if (rpcError) {
            console.error('[Database Operation Failed: RPC execution rejected by database]', {
              operation: 'RPC submit_hostel_application',
              code: rpcError.code,
              message: rpcError.message,
              details: rpcError.details,
              hint: rpcError.hint,
            });
            let userMsg = rpcError.message || 'Permission denied or validation failed on application submission.';
            if (rpcError.code === '23505' || userMsg.toLowerCase().includes('duplicate application')) {
              userMsg = `Duplicate application: An application has already been registered for enrollment number ${formData.enrollmentNumber} for cycle ${formData.applicationCycle}.`;
            } else if (rpcError.code === '42501' || userMsg.toLowerCase().includes('authentication required')) {
              userMsg = 'Access denied: You must be logged in with your own student account to submit this application.';
            } else if (rpcError.code === '42804' || userMsg.toLowerCase().includes('type integer')) {
              userMsg = `Database type mismatch during application insert: ${userMsg}. (Expected year as integer)`;
            }
            return {
              success: false,
              error: userMsg,
            };
          }
        }

        if (!insertedApp) {
          return {
            success: false,
            error: 'Application could not be committed to Supabase. Please verify database RPC setup.',
          };
        }

        // 2. Trigger Make.com webhook asynchronously after successful database insertion (Requirements 1, 2, 3, 4, 11)
        triggerMakeHostelWebhook({
          applicationId: insertedApp.application_id || appId,
          studentName: formData.fullName.trim(),
          enrollmentNumber: formData.enrollmentNumber.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          department: formData.department,
          year: numericYear,
          hostelPreference: formData.hostelPreference,
          address: formData.address.trim(),
          documents: documentsPayload,
          internalDbId: internalId,
        }).catch(err => {
          console.error('Asynchronous Make.com webhook dispatch caught error:', err);
        });

        // 3. Immediate success return with verified database application record (Requirement 10)
        return { success: true, application: insertedApp as Application };
      } else {
        // Local mode fallback
        const createdApp: Application = {
          ...(applicationRecord as any),
          id: `app-local-${Date.now()}`,
        };

        localApplications = [createdApp, ...localApplications];

        localWorkflowHistory[appId] = [
          {
            id: `wf-${Date.now()}`,
            application_id: appId,
            actor_type: 'student',
            remarks: 'Online hostel application submitted by student.',
            metadata: { stage: 'Submission', status: 'Submitted', performed_by: formData.fullName.trim() },
            stage: 'Submission',
            status: 'Submitted',
            performed_by: formData.fullName.trim(),
            actor_role: 'student',
            comments: 'Online hostel application submitted by student.',
            created_at: now,
          },
        ];

        // Trigger Make.com webhook asynchronously in local mode as well if configured
        triggerMakeHostelWebhook({
          applicationId: appId,
          studentName: formData.fullName.trim(),
          enrollmentNumber: formData.enrollmentNumber.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          department: formData.department,
          year: numericYear,
          hostelPreference: formData.hostelPreference,
          address: formData.address.trim(),
          documents: documentsPayload,
        }).catch(err => {
          console.error('Asynchronous Make.com webhook dispatch caught error in local mode:', err);
        });

        return { success: true, application: createdApp };
      }
    } catch (err: any) {
      console.error('Failed to create application:', err);
      return { success: false, error: err.message || 'Failed to submit application. Please check input values.' };
    } finally {
      inFlightSubmissions.delete(submissionKey);
    }
  },

  /**
   * Get all applications for a specific student from Supabase
   */
  async getStudentApplications(email: string, studentId?: string): Promise<Application[]> {
    if (isSupabaseConfigured) {
      try {
        let query = supabase.from('applications').select('*');
        if (studentId && studentId !== 'stu-demo') {
          query = query.or(`student_id.eq.${studentId},email.eq.${email}`);
        } else {
          query = query.eq('email', email);
        }

        const { data, error } = await query.order('created_at', { ascending: false });
        if (error) {
          console.warn('Error fetching student applications from Supabase:', error.message);
          return [];
        }
        return (data || []) as Application[];
      } catch (err) {
        console.error('Fetch student applications exception:', err);
        return [];
      }
    } else {
      return localApplications.filter(a => a.email.toLowerCase() === email.toLowerCase());
    }
  },

  /**
   * Get single application by ID from Supabase
   */
  async getApplicationById(applicationId: string): Promise<Application | null> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('applications')
          .select('*')
          .or(`application_id.eq.${applicationId},id.eq.${applicationId}`)
          .maybeSingle();

        if (error || !data) {
          return null;
        }
        return data as Application;
      } catch (err) {
        return null;
      }
    } else {
      return localApplications.find(a => a.application_id === applicationId || a.id === applicationId) || null;
    }
  },

  /**
   * Get all applications for Admin view with filtering & searching from Supabase
   */
  async getAllApplications(filters?: {
    status?: string;
    search?: string;
    department?: string;
  }): Promise<Application[]> {
    if (isSupabaseConfigured) {
      try {
        let query = supabase.from('applications').select('*');

        if (filters?.status && filters.status !== 'All' && filters.status !== 'Pending') {
          query = query.eq('status', filters.status);
        } else if (filters?.status === 'Pending') {
          query = query.in('status', ['Submitted', 'Under Initial Verification', 'Under Department Review']);
        }

        if (filters?.department && filters.department !== 'All') {
          query = query.eq('department', filters.department);
        }

        const { data, error } = await query.order('created_at', { ascending: false });
        if (error) {
          console.warn('Error fetching admin applications from Supabase:', error.message);
          return [];
        }

        let results = (data || []) as Application[];

        if (filters?.search && filters.search.trim() !== '') {
          const q = filters.search.toLowerCase();
          results = results.filter(
            a =>
              (a.student_name && a.student_name.toLowerCase().includes(q)) ||
              (a.enrollment_number && a.enrollment_number.toLowerCase().includes(q)) ||
              (a.application_id && a.application_id.toLowerCase().includes(q)) ||
              (a.email && a.email.toLowerCase().includes(q))
          );
        }

        return results;
      } catch (err) {
        console.error('Exception fetching applications:', err);
        return [];
      }
    } else {
      return filterLocalApplications(filters);
    }
  },

  /**
   * Get workflow history audit trail for an application from Supabase
   */
  async getWorkflowHistory(applicationId: string): Promise<WorkflowHistoryItem[]> {
    if (isSupabaseConfigured) {
      try {
        let targetId = applicationId;
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(applicationId);
        if (!isUuid) {
          const { data: appRow } = await supabase
            .from('applications')
            .select('id')
            .eq('application_id', applicationId)
            .maybeSingle();
          if (appRow?.id) {
            targetId = appRow.id;
          }
        }

        const { data, error } = await supabase
          .from('application_workflow_history')
          .select('*')
          .eq('application_id', targetId)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('[Database Operation Failed: SELECT from application_workflow_history]', {
            operation: 'SELECT',
            table: 'application_workflow_history',
            applicationId: targetId,
            error,
          });
        }

        if (!error && data && data.length > 0) {
          return data.map((item: any) => ({
            id: item.id,
            application_id: item.application_id,
            actor_type: item.actor_type || 'system',
            remarks: item.remarks || '',
            metadata: item.metadata,
            stage: item.metadata?.stage || item.actor_type || 'Workflow Event',
            status: item.metadata?.status || 'Submitted',
            performed_by: item.metadata?.performed_by || item.actor_type || 'System',
            actor_role: item.actor_type || 'system',
            comments: item.remarks || item.metadata?.comments || '',
            created_at: item.created_at,
          }));
        }
      } catch (err) {
        console.warn('Workflow history retrieval notice:', err);
      }
      return [];
    }

    return localWorkflowHistory[applicationId] || [];
  },

  /**
   * Returns list of logged webhook failures for debugging and retry inspection (Requirement 7)
   */
  getFailedWebhookLogs(): WebhookFailureRecord[] {
    if (typeof window === 'undefined' || !window.localStorage) return [];
    try {
      const raw = window.localStorage.getItem(FAILED_WEBHOOKS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  /**
   * Clears logged webhook failures
   */
  clearFailedWebhookLogs(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(FAILED_WEBHOOKS_KEY);
    }
  },

  /**
   * Manually retries a failed webhook dispatch for an application (Requirement 7)
   */
  async retryWebhookDispatch(applicationId: string): Promise<{ success: boolean; error?: string }> {
    const app = await this.getApplicationById(applicationId);
    if (!app) {
      return { success: false, error: `Application ${applicationId} not found.` };
    }

    // Force remove from dispatched set to allow manual retry
    dispatchedWebhooks.delete(applicationId);

    return triggerMakeHostelWebhook({
      applicationId: app.application_id,
      studentName: app.student_name,
      enrollmentNumber: app.enrollment_number,
      email: app.email,
      phone: app.phone,
      department: app.department,
      year: app.year,
      hostelPreference: app.hostel_preference,
      address: app.address,
      documents: app.documents || {},
      internalDbId: app.id,
    });
  },
};

function filterLocalApplications(filters?: { status?: string; search?: string; department?: string }): Application[] {
  let list = [...localApplications];

  if (filters?.status && filters.status !== 'All') {
    if (filters.status === 'Pending') {
      list = list.filter(
        a =>
          a.status === 'Submitted' ||
          a.status === 'Under Initial Verification' ||
          a.status === 'Under Department Review'
      );
    } else {
      list = list.filter(a => a.status === filters.status);
    }
  }

  if (filters?.department && filters.department !== 'All') {
    list = list.filter(a => a.department === filters.department);
  }

  if (filters?.search && filters.search.trim() !== '') {
    const q = filters.search.toLowerCase();
    list = list.filter(
      a =>
        a.student_name.toLowerCase().includes(q) ||
        a.enrollment_number.toLowerCase().includes(q) ||
        a.application_id.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q)
    );
  }

  return list;
}
