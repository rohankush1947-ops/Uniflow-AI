import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { applicationService } from '../../services/applicationService';
import { Application, WorkflowHistoryItem } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import {
  Files,
  Search,
  Filter,
  Eye,
  Calendar,
  Building,
  User,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  FileText,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  Upload,
} from 'lucide-react';

export const MyApplications: React.FC = () => {
  const { studentProfile, user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApps, setFilteredApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Selected Application for Details Modal
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [workflowHistory, setWorkflowHistory] = useState<WorkflowHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const studentEmail = studentProfile?.email || user?.email || 'student@uniflow.edu';

  useEffect(() => {
    loadApplications();
  }, [studentEmail, studentProfile?.id]);

  async function loadApplications() {
    setLoading(true);
    try {
      const data = await applicationService.getStudentApplications(studentEmail, studentProfile?.id);
      setApplications(data);
      setFilteredApps(data);
    } catch (err) {
      console.error('Error loading applications:', err);
    } finally {
      setLoading(false);
    }
  }

  // Filter effect
  useEffect(() => {
    let result = [...applications];

    if (statusFilter !== 'All') {
      result = result.filter(a => a.status === statusFilter);
    }

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        a =>
          a.application_id.toLowerCase().includes(q) ||
          a.hostel_preference.toLowerCase().includes(q) ||
          a.application_cycle.toLowerCase().includes(q)
      );
    }

    setFilteredApps(result);
  }, [searchQuery, statusFilter, applications]);

  const handleOpenDetails = async (app: Application) => {
    setSelectedApp(app);
    setLoadingHistory(true);
    try {
      const history = await applicationService.getWorkflowHistory(app.application_id);
      setWorkflowHistory(history);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          My Applications
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Track and inspect status, document validations, and administrative decisions.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by ID or hostel..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-hidden transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-xs text-slate-400 font-semibold mr-1">Status:</span>
          {['All', 'Submitted', 'Under Initial Verification', 'Under Department Review', 'Additional Documents Requested', 'Approved', 'Rejected'].map(status => (
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
            <p>Fetching application records...</p>
          </div>
        ) : filteredApps.length === 0 ? (
          <div className="p-12 text-center">
            <Files className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-900">No matching applications found</p>
            <p className="text-xs text-slate-500 mt-1">Try adjusting your search criteria or status filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Application ID</th>
                  <th className="px-6 py-4">Submission Date</th>
                  <th className="px-6 py-4">Application Type</th>
                  <th className="px-6 py-4">Current Status</th>
                  <th className="px-6 py-4">Last Updated</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredApps.map(app => (
                  <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-slate-900">
                      {app.application_id}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{new Date(app.submitted_at).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <span className="font-semibold text-slate-900">Hostel Accommodation</span>
                        <p className="text-[11px] text-slate-500 truncate max-w-xs">{app.hostel_preference}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(app.updated_at || app.created_at).toLocaleString([], {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleOpenDetails(app)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Details</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details & Workflow History Modal */}
      {selectedApp && (
        <Modal
          isOpen={Boolean(selectedApp)}
          onClose={() => setSelectedApp(null)}
          title={`Application Details — ${selectedApp.application_id}`}
          subtitle={`Submitted on ${new Date(selectedApp.submitted_at).toLocaleDateString()} for ${selectedApp.application_cycle}`}
          maxWidth="3xl"
        >
          <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
            {/* Status Header Banner */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Workflow Stage</span>
                <div className="mt-1">
                  <StatusBadge status={selectedApp.status} size="lg" />
                </div>
              </div>
              <div className="text-right sm:text-right">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Allocated Hall</span>
                <p className="text-sm font-bold text-slate-900 mt-1">{selectedApp.hostel_preference}</p>
              </div>
            </div>

            {/* If Additional Documents are requested */}
            {selectedApp.status === 'Additional Documents Requested' && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-amber-800">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span>Action Required: Supplementary Documents Requested by Warden</span>
                </div>
                <p className="text-xs leading-relaxed">
                  {selectedApp.document_validation_notes || 'Please provide updated and legible document scans.'}
                </p>
                {selectedApp.admin_remarks && (
                  <p className="text-xs font-medium italic border-t border-amber-200/60 pt-2">
                    " {selectedApp.admin_remarks} "
                  </p>
                )}
              </div>
            )}

            {/* If Rejected */}
            {selectedApp.status === 'Rejected' && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-rose-800">
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <span>Application Not Approved</span>
                </div>
                <p className="text-xs leading-relaxed">
                  <strong>Formal Reason:</strong> {selectedApp.rejection_reason || 'Ineligible according to hostel admission criteria.'}
                </p>
                {selectedApp.admin_remarks && (
                  <p className="text-xs text-rose-800 border-t border-rose-200/60 pt-2">
                    <strong>Administrative Remarks:</strong> {selectedApp.admin_remarks}
                  </p>
                )}
              </div>
            )}

            {/* If Approved */}
            {selectedApp.status === 'Approved' && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Congratulations! Hostel Accommodation Allotted</span>
                </div>
                <p className="text-xs leading-relaxed">
                  {selectedApp.admin_remarks || 'Your room allocation has been confirmed by the Chief Warden office.'}
                </p>
              </div>
            )}

            {/* Applicant Information Section */}
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                Student & Academic Information
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50/60 p-4 rounded-2xl border border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Full Name</span>
                  <span className="font-bold text-slate-800">{selectedApp.student_name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Enrollment Number</span>
                  <span className="font-mono font-bold text-slate-800">{selectedApp.enrollment_number}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Department</span>
                  <span className="font-medium text-slate-800">{selectedApp.department}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Academic Year</span>
                  <span className="font-medium text-slate-800">{selectedApp.year}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Email</span>
                  <span className="font-medium text-slate-800">{selectedApp.email}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Phone</span>
                  <span className="font-medium text-slate-800">{selectedApp.phone}</span>
                </div>
                <div className="col-span-2 sm:col-span-3 pt-2 border-t border-slate-200/50">
                  <span className="text-slate-400 block text-[11px]">Permanent Address</span>
                  <span className="font-medium text-slate-700">{selectedApp.address}</span>
                </div>
              </div>
            </div>

            {/* Submitted Documents Section */}
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                Submitted Documents & Verification Status
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-slate-800">Student ID Card</p>
                      <span className="text-[10px] text-emerald-600 font-medium">Uploaded & Verified</span>
                    </div>
                  </div>
                  {selectedApp.documents?.student_id_card || selectedApp.documents?.studentIdCard ? (
                    <a
                      href={selectedApp.documents?.student_id_card || selectedApp.documents?.studentIdCard}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 text-[11px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg flex items-center gap-1"
                    >
                      <span>Preview</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-medium">Present</span>
                  )}
                </div>

                <div className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-slate-800">Aadhaar / Govt ID</p>
                      <span className="text-[10px] text-emerald-600 font-medium">OCR Parsed</span>
                    </div>
                  </div>
                  {selectedApp.documents?.aadhaar_card || selectedApp.documents?.aadhaarCard ? (
                    <a
                      href={selectedApp.documents?.aadhaar_card || selectedApp.documents?.aadhaarCard}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 text-[11px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg flex items-center gap-1"
                    >
                      <span>Preview</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-medium">Present</span>
                  )}
                </div>

                <div className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-slate-800">Semester Marksheet</p>
                      <span className="text-[10px] text-emerald-600 font-medium">Eligibility Confirmed</span>
                    </div>
                  </div>
                  {selectedApp.documents?.marksheet ? (
                    <a
                      href={selectedApp.documents?.marksheet}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 text-[11px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg flex items-center gap-1"
                    >
                      <span>Preview</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-medium">Present</span>
                  )}
                </div>
              </div>
            </div>

            {/* Workflow Audit Trail History */}
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                Workflow Audit Trail History
              </h4>
              {loadingHistory ? (
                <div className="p-4 text-center text-xs text-slate-400">Loading history steps...</div>
              ) : (
                <div className="border border-slate-200/80 rounded-2xl p-4 bg-slate-50/50 space-y-3">
                  {workflowHistory.map((item, idx) => (
                    <div key={item.id || idx} className="flex items-start gap-3 relative pb-3 border-b border-slate-100 last:border-b-0 last:pb-0">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-slate-800">{item.stage}</p>
                          <span className="text-[10px] font-mono text-slate-400">
                            {new Date(item.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5">{item.comments}</p>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-[10px] font-semibold text-slate-500 bg-slate-200/70 px-2 py-0.5 rounded">
                            By: {item.performed_by}
                          </span>
                          <span className="text-[10px] uppercase font-mono text-slate-400">
                            [{item.actor_role}]
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
