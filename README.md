# UniFlow AI — Smart University. Seamless Administration.

UniFlow AI is an AI-powered University Management and Workflow Automation Platform. Its mission is to automate repetitive university administrative processes and eliminate physical paperwork, manual document verification, bureaucratic delays, and communication gaps between students, departments, and administration.

The first operational module is **Hostel Application Automation (v1.0)**.

---

## 🚀 Key Modules & Capabilities

### 1. Public Landing Page (`/`)
- Brand identity with modern typography and sleek university ERP visual aesthetic.
- Hero section: *"Transforming University Administration with AI"*.
- Interactive live preview of the autonomous 4-stage application pipeline.
- Capabilities showcase, step-by-step explanation, multi-stakeholder benefits, and upcoming modules roadmap.

### 2. Authentication & Security
- **Student Authentication (`/student/login`, `/student/register`)**:
  - Secure email/password login and account registration via Supabase Auth.
  - Automatic profile creation in the `students` table (`student_name`, `enrollment_number`, `year`, `department`, `phone`, `address`).
- **Warden & Admin Control (`/admin/login`)**:
  - Protected access strictly verified against the `admin_users` table where `email = user.email` and `is_active = true`.
  - Rejects unauthorized or inactive administrators.
  - Never exposes `SUPABASE_SERVICE_ROLE_KEY` in client-side code.

### 3. Student Portal (`/student/*`)
- **Dashboard (`/student/dashboard`)**:
  - Key metric cards: Total Applications, Pending, Approved, and Rejected (sourced directly from live Supabase data).
  - Real-time workflow timeline tracking active hostel applications.
  - Quick action banner for instant application creation.
- **Hostel Application Form (`/student/apply`)**:
  - **Section 1: Personal Details** (Full Name, Enrollment Number, Email, Phone, Department, Academic Year, Address).
  - **Section 2: Hostel Details** (Hostel Preference, Application Cycle).
  - **Section 3: Documents** (Student ID Card, Aadhaar Card, Previous Semester Marksheet, Income Certificate).
  - Multi-format file upload validation (PDF, JPG, PNG; max 5MB) with drag-and-drop, selected file feedback, and file removal.
  - Generates unique Application ID (`HOSTEL-2025-XXXXX`).
  - Uploads documents privately to Supabase Storage bucket `documents` and records entries to `applications`, `application_documents`, and `application_workflow_history`.
  - Interactive success confirmation screen.
- **My Applications (`/student/applications`)**:
  - Full application table with search, status filters, and live status badges.
  - Deep inspection modal showing complete application details, document preview links, and audit history.
  - Actionable prompt when supplementary documents are requested by the warden.
- **Student Documents Vault (`/student/documents`)**:
  - Central repository for all verified identity and academic credentials.
- **Notifications (`/student/notifications`)**:
  - Notification log displaying status updates, email triggers, and system remarks from `notification_logs`.
- **Student Profile (`/student/profile`)**:
  - University academic record and distance criteria verification.

### 4. Admin & Warden Portal (`/admin/*`)
- **Admin Overview (`/admin/dashboard`)**:
  - Metric summary: Total Applications, Pending Review, Approved, Rejected.
  - Visual charts: Department application distribution and turnaround metrics.
  - Urgent review queue highlighting applications awaiting warden decision.
- **Applications Management (`/admin/applications`)**:
  - Search by student name, roll number, or application ID.
  - Multi-status filter tabs.
  - Application inspection modal with student dossier and submitted document review.
  - **Document Accessibility Check**: Test and flag document accessibility status.
  - **Approve Application**: Allocate room and add administrative remarks with confirmation dialog.
  - **Reject Application**: Mandatory rejection reason selection and remarks with confirmation dialog.
  - **Request Additional Documents**: Multi-select document checklist with deadline notes with confirmation dialog.
- **Document Verification Workbench (`/admin/verification`)**:
  - Review OCR parsing status, inspect scans, and flag credentials for re-upload.
- **Notification Logs (`/admin/notifications`)**:
  - Audit trail of student communications and automated email dispatches from `notification_logs`.
- **Settings (`/admin/settings`)**:
  - Active admissions cycle controls, minimum distance score threshold (e.g., 150 km), and Make.com webhook URL configuration.

---

## 🛠️ Technology Stack

- **Frontend Core**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS v4, Plus Jakarta Sans typography
- **Routing**: React Router v7
- **Database & Storage**: Supabase (`@supabase/supabase-js`)
- **Icons**: Lucide React
- **Automation / Webhooks**: Make.com webhook dispatch layer

---

## 📦 Getting Started

### 1. Prerequisites
- Node.js (v18 or newer recommended, tested on v24)
- npm (v9 or newer)

### 2. Installation
```bash
npm install
```

### 3. Environment Configuration
Credentials are read from `.env` or `.env.local`:
```env
VITE_SUPABASE_URL=https://yahvcyibzepcmetuwltk.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_sQ8Xnykg1KuQVTsL4ivAZg__nJg2PKW

# Make.com / Trusted Backend Webhooks
VITE_MAKE_WEBHOOK_URL=https://hook.eu1.make.com/your-submission-webhook
VITE_MAKE_ADMIN_ACTION_WEBHOOK=https://hook.eu1.make.com/your-admin-action-webhook
```

### 4. Running Locally
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 5. Production Build
```bash
npm run build
```

---

## 🗄️ Supabase Database Schema

UniFlow AI connects to your Supabase project matching the existing table structures:

| Table | Key Columns |
|---|---|
| `students` | `id`, `enrollment_number`, `student_name`, `email`, `phone`, `department`, `year`, `address`, `created_at`, `updated_at` |
| `applications` | `id`, `application_id`, `student_id`, `enrollment_number`, `student_name`, `email`, `phone`, `department`, `year`, `hostel_preference`, `address`, `application_cycle`, `status`, `documents`, `mandatory_fields_complete`, `mandatory_documents_complete`, `documents_accessible`, `document_validation_notes`, `admin_remarks`, `rejection_reason`, `submitted_at`, `initial_verification_at`, `department_forwarded_at`, `admin_reviewed_at`, `decision_at`, `created_at`, `updated_at` |
| `application_documents` | `id`, `application_id`, `document_type`, `file_name`, `document_url`, `uploaded_at`, `updated_at` |
| `application_workflow_history` | `id`, `application_id`, `actor_type`, `remarks`, `metadata`, `created_at` |
| `admin_users` | `id`, `email`, `full_name`, `role`, `is_active`, `department`, `created_at`, `updated_at` |
| `admin_action_tokens` | Secure action tokens for email-based approvals |
| `application_admin_decisions` | `id`, `application_id`, `admin_email`, `decision`, `requested_documents`, `created_at` |
| `notification_logs` | `id`, `application_id`, `recipient_email`, `subject`, `sent_at`, `created_at`, `updated_at` |

---

## 🔒 Operations Requiring Make.com or Trusted Backend

In accordance with strict university security and Row Level Security (RLS):

1. **Storage Bucket Creation**:
   - The storage bucket `documents` must be created in the Supabase Dashboard (`Storage -> New bucket -> "documents"`). Once created, private document uploads and signed URL generation will execute seamlessly.
2. **Secure Application Submission (RPC / Edge Function)**:
   - Authenticated students do not have direct `INSERT` permissions on `applications`, preventing unauthorized modifications and preserving strict RLS.
   - Applications are submitted via the `submit_hostel_application` PostgreSQL function (`SECURITY DEFINER`), which cryptographically verifies `auth.uid()` and JWT email on the server to prevent identity impersonation.
   - Run the migration script located in [`supabase/migrations/20261108_submit_hostel_application.sql`](file:///d:/UNIFLOW%20AI/supabase/migrations/20261108_submit_hostel_application.sql) in your Supabase SQL Editor.
   - Alternatively, deploy the Edge Function located in [`supabase/functions/submit-hostel-application/index.ts`](file:///d:/UNIFLOW%20AI/supabase/functions/submit-hostel-application/index.ts) using `supabase functions deploy submit-hostel-application`.
3. **Initial Administrator Registration (`admin_users`)**:
   - Because `admin_users` is protected by RLS, administrator records should be inserted in the Supabase Table Editor or via a trusted backend script with service privileges (e.g. `INSERT INTO admin_users (email, full_name, role, is_active, department) VALUES ('warden@uniflow.edu', 'Dr. Rajesh Rao', 'chief_warden', true, 'Hostel Administration')`).
4. **Administrative Decisions Execution**:
   - Wardens should execute status updates (Approve, Reject, Request Documents) via the configured Make.com webhook (`VITE_MAKE_ADMIN_ACTION_WEBHOOK`).
   - If direct write is attempted without a webhook and blocked by client RLS, the UI displays a clear *Integration Required* notice rather than pretending success.
5. **Automated Background OCR & Intake**:
   - Student submissions dispatch to `VITE_MAKE_WEBHOOK_URL` for background OCR extraction, geocoding/distance score calculations, and automated email confirmation dispatches.
