import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { applicationService } from '../../services/applicationService';
import { adminService } from '../../services/adminService';
import { Application, WorkflowHistoryItem, AdminUser } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import {
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  Eye,
  User,
  Building,
  GraduationCap,
  Calendar,
  AlertTriangle,
  Info,
} from 'lucide-react';

export const AdminApplications: React.FC = () => {
  const { adminProfile, user } = useAuth();
  const [searchParams] = useSearchParams();

  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApps, setFilteredApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [departmentFilter, setDepartmentFilter] = useState('All');

  // Selected application for deep inspection
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [workflowHistory, setWorkflowHistory] = useState<WorkflowHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Action Dialog States
  const [approveDialog, setApproveDialog] = useState(false);
  const [rejectDialog, setRejectDialog] = useState(false);
  const [requestDocsDialog, setRequestDocsDialog] = useState(false);

  // Form Inputs for Actions
  const [adminRemarks, setAdminRemarks] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [requestedDocs, setRequestedDocs] = useState<string[]>([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<{
    type: 'success' | 'warning' | 'error';
    message: string;
    integrationNotice?: boolean;
  } | null>(null);

  // Initialize search params (e.g. ?status=Pending or ?id=HOSTEL-2025-...)
  useEffect(() => {
    const statusParam = searchParams.get('status');
    if (statusParam) {
      setStatusFilter(statusParam);
    }
  }, [searchParams]);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    try {
      const data = await applicationService.getAllApplications();
      setApplications(data);
      setFilteredApps(data);

      // Check if specific ID was targeted in URL
      const idParam = searchParams.get('id');
      if (idParam) {
        const found = data.find(a => a.application_id === idParam || a.id === idParam);
        if (found) {
          handleOpenInspection(found);
        }
      }
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setLoading(false);
    }
  }

  // Filtering effect
  useEffect(() => {
    let result = [...applications];

    if (statusFilter !== 'All') {
      if (statusFilter === 'Pending') {
        result = result.filter(
          a =>
            a.status === 'Submitted' ||
            a.status === 'Under Initial Verification' ||
            a.status === 'Under Department Review'
        );
      } else {
        result = result.filter(a => a.status === statusFilter);
      }
    }

    if (departmentFilter !== 'All') {
      result = result.filter(a => a.department === departmentFilter);
    }

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        a =>
          a.student_name.toLowerCase().includes(q) ||
          a.enrollment_number.toLowerCase().includes(q) ||
          a.application_id.toLowerCase().includes(q) ||
          a.email.toLowerCase().includes(q)
      );
    }

    setFilteredApps(result);
  }, [searchQuery, statusFilter, departmentFilter, applications]);

  // Open inspection modal
  const handleOpenInspection = async (app: Application) => {
    setSelectedApp(app);
    setActionFeedback(null);
    setHistoryLoading(true);
    try {
      const history = await applicationService.getWorkflowHistory(app.application_id);
      setWorkflowHistory(history);
    } catch (err) {
      console.error('History load error:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const currentAdminUser: AdminUser = adminProfile || {
    id: user?.id || 'adm-default',
    email: user?.email || 'admin@uniflow.edu',
    full_name: user?.user_metadata?.name || 'Chief Warden',
    name: user?.user_metadata?.name || 'Chief Warden',
    role: 'chief_warden',
    is_active: true,
  };

  // 1. Approve Handler
  const handleApprove = async () => {
    if (!selectedApp) return;
    setActionLoading(true);
    setActionFeedback(null);

    const res = await adminService.approveApplication(
      selectedApp.application_id,
      adminRemarks || 'Hostel room allocated after verification.',
      currentAdminUser
    );

    setActionLoading(false);
    setApproveDialog(false);

    if (res.success) {
      setActionFeedback({
        type: 'success',
        message: res.message || 'Application approved successfully.',
        integrationNotice: res.integrationRequired,
      });
      // Update local state
      updateLocalApplicationStatus(selectedApp.application_id, 'Approved', adminRemarks);
    } else {
      setActionFeedback({
        type: res.integrationRequired ? 'warning' : 'error',
        message: res.message || res.error || 'Failed to approve application.',
        integrationNotice: res.integrationRequired,
      });
    }
  };

  // 2. Reject Handler
  const handleReject = async () => {
    if (!selectedApp) return;
    if (!rejectionReason.trim()) {
      alert('A mandatory rejection reason is required.');
      return;
    }

    setActionLoading(true);
    setActionFeedback(null);

    const res = await adminService.rejectApplication(
      selectedApp.application_id,
      rejectionReason,
      adminRemarks || 'Application rejected based on university criteria.',
      currentAdminUser
    );

    setActionLoading(false);
    setRejectDialog(false);

    if (res.success) {
      setActionFeedback({
        type: 'success',
        message: res.message || 'Application rejected successfully.',
        integrationNotice: res.integrationRequired,
      });
      updateLocalApplicationStatus(selectedApp.application_id, 'Rejected', adminRemarks, rejectionReason);
    } else {
      setActionFeedback({
        type: res.integrationRequired ? 'warning' : 'error',
        message: res.message || res.error || 'Failed to reject application.',
        integrationNotice: res.integrationRequired,
      });
    }
  };

  // 3. Request Additional Documents Handler
  const handleRequestDocs = async () => {
    if (!selectedApp) return;
    if (requestedDocs.length === 0) {
      alert('Please check at least one document to request.');
      return;
    }

    setActionLoading(true);
    setActionFeedback(null);

    const res = await adminService.requestAdditionalDocuments(
      selectedApp.application_id,
      requestedDocs,
      adminRemarks || 'Please upload the requested documents within 5 working days.',
      currentAdminUser
    );

    setActionLoading(false);
    setRequestDocsDialog(false);

    if (res.success) {
      setActionFeedback({
        type: 'success',
        message: res.message || 'Additional documents requested.',
        integrationNotice: res.integrationRequired,
      });
      updateLocalApplicationStatus(
        selectedApp.application_id,
        'Additional Documents Requested',
        adminRemarks,
        undefined,
        requestedDocs
      );
    } else {
      setActionFeedback({
        type: res.integrationRequired ? 'warning' : 'error',
        message: res.message || res.error || 'Failed to request documents.',
        integrationNotice: res.integrationRequired,
      });
    }
  };

  // Verify Document Accessibility
  const handleVerifyAccessibility = async () => {
    if (!selectedApp) return;
    setActionLoading(true);
    const res = await adminService.verifyDocumentAccessibility(
      selectedApp.application_id,
      true,
      'Accessibility verified by Warden'
    );
    setActionLoading(false);
    if (res.success) {
      setSelectedApp(prev => (prev ? { ...prev, documents_accessible: true } : null));
      setApplications(prev =>
        prev.map(a =>
          a.application_id === selectedApp.application_id ? { ...a, documents_accessible: true } : a
        )
      );
    }
  };

  // Helper to update local state without reloading
  function updateLocalApplicationStatus(
    appId: string,
    newStatus: any,
    remarks?: string,
    rejectionReasonStr?: string,
    requestedList?: string[]
  ) {
    const updated = applications.map(a => {
      if (a.application_id === appId) {
        return {
          ...a,
          status: newStatus,
          admin_remarks: remarks || a.admin_remarks,
          rejection_reason: rejectionReasonStr || a.rejection_reason,
          document_validation_notes: requestedList
            ? `Requested: ${requestedList.join(', ')}. ${remarks || ''}`
            : a.document_validation_notes,
          updated_at: new Date().toISOString(),
        };
      }
      return a;
    });

    setApplications(updated);
    if (selectedApp && selectedApp.application_id === appId) {
      setSelectedApp(prev =>
        prev
          ? {
              ...prev,
              status: newStatus,
              admin_remarks: remarks || prev.admin_remarks,
              rejection_reason: rejectionReasonStr || prev.rejection_reason,
            }
          : null
      );
    }
  }

  const toggleRequestedDoc = (docName: string) => {
    setRequestedDocs(prev =>
      prev.includes(docName) ? prev.filter(d => d !== docName) : [...prev, docName]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Applications Management
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Review candidate qualifications, inspect identity documents, and execute administrative decisions.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search student name, enrollment no, application ID..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-hidden transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-slate-400 font-semibold">Dept:</span>
            <select
              value={departmentFilter}
              onChange={e => setDepartmentFilter(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 text-slate-700 outline-hidden"
            >
              <option value="All">All Departments</option>
              <option value="Computer Science & Engineering">Computer Science & Engineering</option>
              <option value="Electronics & Communication">Electronics & Communication</option>
              <option value="Mechanical Engineering">Mechanical Engineering</option>
              <option value="Civil Engineering">Civil Engineering</option>
            </select>
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-1">
          <span className="text-xs text-slate-400 font-semibold shrink-0">Filter Status:</span>
          {[
            'All',
            'Pending',
            'Submitted',
            'Under Initial Verification',
            'Under Department Review',
            'Additional Documents Requested',
            'Approved',
            'Rejected',
          ].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === status
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">
            <span className="w-6 h-6 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin inline-block mb-3" />
            <p>Loading application data...</p>
          </div>
        ) : filteredApps.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm font-bold text-slate-900">No applications match the filters</p>
            <p className="text-xs text-slate-500 mt-1">Try resetting the status filter or search query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Application ID</th>
                  <th className="px-6 py-4">Student Details</th>
                  <th className="px-6 py-4">Department & Year</th>
                  <th className="px-6 py-4">Hostel Preference</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Submitted</th>
                  <th className="px-6 py-4 text-right">Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredApps.map(app => (
                  <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-blue-600">
                      {app.application_id}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-900 block">{app.student_name}</span>
                      <span className="text-[11px] text-slate-500 font-mono block">Roll: {app.enrollment_number}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-slate-800 block">{app.department}</span>
                      <span className="text-[11px] text-slate-500 block">{app.year}</span>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800">
                      {app.hostel_preference}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={app.status} size="sm" />
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(app.submitted_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleOpenInspection(app)}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors inline-flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* INSPECTION & ADMINISTRATIVE DECISION MODAL */}
      {selectedApp && (
        <Modal
          isOpen={Boolean(selectedApp)}
          onClose={() => {
            setSelectedApp(null);
            setActionFeedback(null);
          }}
          title={`Administrative Review — ${selectedApp.application_id}`}
          subtitle={`Applicant: ${selectedApp.student_name} (${selectedApp.enrollment_number})`}
          maxWidth="4xl"
        >
          <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
            {/* Feedback alert (if any decision made) */}
            {actionFeedback && (
              <div
                className={`p-4 rounded-xl border text-xs flex items-start gap-3 ${
                  actionFeedback.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : actionFeedback.type === 'warning'
                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                {actionFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-bold">{actionFeedback.message}</p>
                  {actionFeedback.integrationNotice && (
                    <p className="text-[11px] mt-1 text-slate-600">
                      Make.com automated webhook integration is recommended for production execution to respect Supabase RLS policies.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Current Status Bar */}
            <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Current Pipeline Stage</span>
                <div className="mt-1">
                  <StatusBadge status={selectedApp.status} size="lg" />
                </div>
              </div>
              <div className="text-sm">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Requested Dormitory</span>
                <span className="font-bold text-cyan-300">{selectedApp.hostel_preference}</span>
              </div>
            </div>

            {/* Student Dossier */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-4">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Student Dossier & Address Records
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Enrollment Roll</span>
                  <span className="font-mono font-bold text-slate-900">{selectedApp.enrollment_number}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Academic Dept</span>
                  <span className="font-bold text-slate-900">{selectedApp.department}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Year of Study</span>
                  <span className="font-bold text-slate-900">{selectedApp.year}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Contact Phone</span>
                  <span className="font-mono text-slate-900">{selectedApp.phone}</span>
                </div>
                <div className="col-span-2 sm:col-span-4 pt-2 border-t border-slate-200/60">
                  <span className="text-slate-400 block text-[11px]">Permanent Residential Address</span>
                  <span className="font-medium text-slate-800">{selectedApp.address}</span>
                </div>
              </div>
            </div>

            {/* Submitted Documents & Accessibility Verification */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Submitted Credentials & Accessibility Inspection
                </h4>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      selectedApp.documents_accessible
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {selectedApp.documents_accessible ? (
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-3 h-3 text-amber-600" />
                    )}
                    <span>{selectedApp.documents_accessible ? 'Accessibility Verified' : 'Pending Accessibility'}</span>
                  </span>

                  {!selectedApp.documents_accessible && (
                    <button
                      onClick={handleVerifyAccessibility}
                      disabled={actionLoading}
                      className="px-2.5 py-1 text-[11px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
                    >
                      Verify Accessibility
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span className="font-bold text-xs text-slate-900">Student ID Card</span>
                    </div>
                    <p className="text-[11px] text-slate-500">Official Campus Credential</p>
                  </div>
                  <a
                    href={selectedApp.documents?.student_id_card || selectedApp.documents?.studentIdCard || 'https://images.unsplash.com/photo-1544717305-2782549b5136'}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <span>Inspect Scan</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-white flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="w-4 h-4 text-cyan-600" />
                      <span className="font-bold text-xs text-slate-900">Aadhaar / Govt ID</span>
                    </div>
                    <p className="text-[11px] text-slate-500">Permanent Address Proof</p>
                  </div>
                  <a
                    href={selectedApp.documents?.aadhaar_card || selectedApp.documents?.aadhaarCard || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe'}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <span>Inspect Scan</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-white flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="w-4 h-4 text-indigo-600" />
                      <span className="font-bold text-xs text-slate-900">Semester Marksheet</span>
                    </div>
                    <p className="text-[11px] text-slate-500">Academic CGPA Verification</p>
                  </div>
                  <a
                    href={selectedApp.documents?.marksheet || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167'}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <span>Inspect Scan</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {selectedApp.document_validation_notes && (
                <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900">
                  <strong>Validation Notes:</strong> {selectedApp.document_validation_notes}
                </div>
              )}
            </div>

            {/* Workflow Audit Trail */}
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                Full Workflow Audit History
              </h4>
              {historyLoading ? (
                <p className="text-xs text-slate-400">Loading history records...</p>
              ) : (
                <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-3">
                  {workflowHistory.map((h, i) => (
                    <div key={h.id || i} className="flex items-start gap-3 border-b border-slate-100 last:border-b-0 pb-2 last:pb-0">
                      <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        {i + 1}
                      </div>
                      <div className="flex-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800">{h.stage} &bull; {h.status}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(h.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5">{h.comments}</p>
                        <span className="text-[10px] font-semibold text-slate-500">
                          Actor: {h.performed_by} [{h.actor_role}]
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ACTION BUTTONS PANEL */}
            <div className="pt-4 border-t border-slate-200">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-3">
                Administrative Decision Desk
              </span>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setAdminRemarks(`Hostel accommodation approved for ${selectedApp.hostel_preference}.`);
                    setApproveDialog(true);
                  }}
                  disabled={selectedApp.status === 'Approved'}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve Application</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRequestedDocs(['Clear copy of Aadhaar Card', 'Consolidated Grade Sheet']);
                    setAdminRemarks('Please re-upload higher resolution document scans.');
                    setRequestDocsDialog(true);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors"
                >
                  <AlertCircle className="w-4 h-4" />
                  <span>Request Additional Documents</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRejectionReason('Ineligible according to distance criteria (under 150km)');
                    setAdminRemarks('Advised to avail university day-scholar transit pass.');
                    setRejectDialog(true);
                  }}
                  disabled={selectedApp.status === 'Rejected'}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject Application</span>
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* CONFIRMATION DIALOG: APPROVE */}
      <ConfirmDialog
        isOpen={approveDialog}
        onClose={() => setApproveDialog(false)}
        onConfirm={handleApprove}
        title="Confirm Hostel Room Allocation"
        description={`Are you sure you want to approve application ${selectedApp?.application_id} for ${selectedApp?.student_name}? This will allocate a room in ${selectedApp?.hostel_preference} and notify the student.`}
        confirmLabel="Confirm & Issue Allocation"
        variant="success"
        isLoading={actionLoading}
      >
        <div className="space-y-2 mt-2">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Administrative Remarks (Sent to student):
          </label>
          <textarea
            rows={2}
            value={adminRemarks}
            onChange={e => setAdminRemarks(e.target.value)}
            className="w-full text-xs p-2.5 border border-slate-200 rounded-xl outline-hidden focus:ring-2 focus:ring-emerald-500"
            placeholder="e.g. Room KC-204 allocated. Collect key from caretaker office."
          />
        </div>
      </ConfirmDialog>

      {/* CONFIRMATION DIALOG: REJECT (MANDATORY REASON) */}
      <ConfirmDialog
        isOpen={rejectDialog}
        onClose={() => setRejectDialog(false)}
        onConfirm={handleReject}
        title="Confirm Application Rejection"
        description={`Rejecting application ${selectedApp?.application_id}. A mandatory formal reason must be provided for university compliance records.`}
        confirmLabel="Confirm Rejection"
        variant="danger"
        isLoading={actionLoading}
        confirmDisabled={!rejectionReason.trim()}
      >
        <div className="space-y-3 mt-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Mandatory Rejection Reason <span className="text-rose-500">*</span>
            </label>
            <select
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-200 rounded-xl outline-hidden focus:ring-2 focus:ring-rose-500"
            >
              <option value="Ineligible according to distance criteria (under 150km)">
                Ineligible according to distance criteria (residential distance under 150 km)
              </option>
              <option value="Academic disciplinary hold or pending inquiry">
                Academic disciplinary hold or pending inquiry
              </option>
              <option value="Academic CGPA below minimum hall eligibility threshold">
                Academic CGPA below minimum hall eligibility threshold
              </option>
              <option value="Hostel accommodation capacity exhausted for selected category">
                Hostel accommodation capacity exhausted for selected category
              </option>
              <option value="Invalid or falsified document records detected">
                Invalid or falsified document records detected
              </option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Administrative Remarks / Guidance:
            </label>
            <textarea
              rows={2}
              value={adminRemarks}
              onChange={e => setAdminRemarks(e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-200 rounded-xl outline-hidden focus:ring-2 focus:ring-rose-500"
              placeholder="e.g. Advised to re-apply next academic semester or apply for day-scholar travel pass."
            />
          </div>
        </div>
      </ConfirmDialog>

      {/* CONFIRMATION DIALOG: REQUEST ADDITIONAL DOCUMENTS */}
      <ConfirmDialog
        isOpen={requestDocsDialog}
        onClose={() => setRequestDocsDialog(false)}
        onConfirm={handleRequestDocs}
        title="Request Additional Documents"
        description={`Select which documents ${selectedApp?.student_name} must re-upload to proceed with verification.`}
        confirmLabel="Send Document Request"
        variant="warning"
        isLoading={actionLoading}
        confirmDisabled={requestedDocs.length === 0}
      >
        <div className="space-y-3 mt-2">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Required Documents Checklist:
          </label>
          <div className="space-y-2">
            {[
              'Clear copy of Student ID Card',
              'Clear copy of Aadhaar Card',
              'Consolidated Semester Grade Sheet',
              'Signed Guardian Undertaking Document',
              'Current Financial Year Income Certificate',
            ].map(docName => (
              <label
                key={docName}
                className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200/80 cursor-pointer text-xs"
              >
                <input
                  type="checkbox"
                  checked={requestedDocs.includes(docName)}
                  onChange={() => toggleRequestedDoc(docName)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-slate-800 font-medium">{docName}</span>
              </label>
            ))}
          </div>

          <div className="pt-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Remarks for Student:
            </label>
            <textarea
              rows={2}
              value={adminRemarks}
              onChange={e => setAdminRemarks(e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-200 rounded-xl outline-hidden focus:ring-2 focus:ring-amber-500"
              placeholder="e.g. Please upload within 5 working days to retain priority queue."
            />
          </div>
        </div>
      </ConfirmDialog>
    </div>
  );
};
