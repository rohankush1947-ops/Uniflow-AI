export type ApplicationStatus =
  | 'Submitted'
  | 'Under Initial Verification'
  | 'Under Department Review'
  | 'Additional Documents Requested'
  | 'Approved'
  | 'Rejected';

export type DocumentType =
  | 'student_id_card'
  | 'aadhaar_card'
  | 'marksheet'
  | 'income_certificate'
  | 'other';

export type UserRole = 'student' | 'admin' | 'warden' | 'chief_warden' | 'system';

export interface Student {
  id: string;
  enrollment_number: string;
  student_name: string;
  full_name?: string;
  email: string;
  phone: string;
  department: string;
  year: number | string;
  academic_year?: string;
  address: string;
  created_at?: string;
  updated_at?: string;
}

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  name?: string;
  role: 'admin' | 'warden' | 'chief_warden' | string;
  is_active: boolean;
  department?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ApplicationDocument {
  id: string;
  application_id: string;
  document_type: DocumentType | string;
  file_name: string;
  document_url: string;
  file_url?: string;
  uploaded_at: string;
  updated_at?: string;
}

export interface WorkflowHistoryItem {
  id: string;
  application_id: string;
  actor_type?: string;
  remarks?: string;
  metadata?: Record<string, any> | null;
  created_at: string;
  stage?: string;
  status?: ApplicationStatus;
  performed_by?: string;
  actor_role?: string;
  comments?: string;
}

export interface Application {
  id: string;
  application_id: string;
  student_id: string;
  enrollment_number: string;
  student_name: string;
  email: string;
  phone: string;
  department: string;
  year: number | string;
  hostel_preference: string;
  address: string;
  application_cycle: string;
  status: ApplicationStatus;
  documents?: Record<string, string> | any;
  mandatory_fields_complete: boolean;
  mandatory_documents_complete: boolean;
  documents_accessible: boolean;
  document_validation_notes?: string | null;
  admin_action_token_hash?: string | null;
  admin_action_token_expires_at?: string | null;
  admin_action_token_used_at?: string | null;
  admin_remarks?: string | null;
  rejection_reason?: string | null;
  submitted_at: string;
  initial_verification_at?: string | null;
  department_forwarded_at?: string | null;
  admin_reviewed_at?: string | null;
  decision_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApplicationAdminDecision {
  id: string;
  application_id: string;
  admin_email: string;
  decision: string;
  requested_documents?: string[] | null;
  created_at: string;
}

export interface NotificationLog {
  id: string;
  application_id?: string;
  recipient_email: string;
  subject: string;
  sent_at?: string;
  created_at: string;
  updated_at?: string;
}

export interface HostelApplicationFormData {
  fullName: string;
  enrollmentNumber: string;
  email: string;
  phone: string;
  department: string;
  academicYear: string;
  address: string;
  hostelPreference: string;
  applicationCycle: string;
  documents: {
    studentIdCard: File | null;
    aadhaarCard: File | null;
    marksheet: File | null;
    incomeCertificate: File | null;
  };
}

export interface SystemSettings {
  cycleIdentifier: string;
  cycleOpen: boolean;
  minDistanceKm: number;
  makeSubmissionWebhook: string;
  makeActionWebhook: string;
  updatedAt?: string;
}
