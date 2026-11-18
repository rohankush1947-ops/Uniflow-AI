import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { applicationService } from '../../services/applicationService';
import { Application } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  FilePlus,
  Files,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  Building,
  Calendar,
  Sparkles,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { studentProfile, user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  const studentEmail = studentProfile?.email || user?.email || 'student@uniflow.edu';
  const studentName = studentProfile?.full_name || user?.user_metadata?.name || 'Student';
  const enrollmentNo = studentProfile?.enrollment_number || '2024CSB1042';

  useEffect(() => {
    async function fetchApps() {
      setLoading(true);
      try {
        const data = await applicationService.getStudentApplications(studentEmail, studentProfile?.id);
        setApplications(data);
      } catch (err) {
        console.error('Failed to load student applications:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchApps();
  }, [studentEmail, studentProfile?.id]);

  const total = applications.length;
  const pending = applications.filter(
    a => a.status === 'Submitted' || a.status === 'Under Initial Verification' || a.status === 'Under Department Review' || a.status === 'Additional Documents Requested'
  ).length;
  const approved = applications.filter(a => a.status === 'Approved').length;
  const rejected = applications.filter(a => a.status === 'Rejected').length;

  const latestApp = applications[0];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-600 p-6 sm:p-8 text-white shadow-lg shadow-blue-500/15">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-blue-100 text-xs font-semibold backdrop-blur-xs mb-3">
              <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
              <span>Campus Accommodation Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {studentName}!
            </h1>
            <p className="mt-1 text-sm text-blue-100 max-w-xl">
              Enrollment No: <strong className="text-white font-mono">{enrollmentNo}</strong> &bull; Department of {studentProfile?.department || 'Computer Science & Engineering'}
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <Link
              to="/student/apply"
              className="px-5 py-3 rounded-xl bg-white text-blue-700 font-bold hover:bg-blue-50 shadow-md transition-all flex items-center gap-2 text-sm hover:scale-[1.02]"
            >
              <FilePlus className="w-4 h-4" />
              <span>Apply for Hostel</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Dashboard Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Applications</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Files className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-3">{total}</p>
          <p className="text-[11px] text-slate-500 mt-1">Academic Sessions Registered</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Review</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-amber-600 mt-3">{pending}</p>
          <p className="text-[11px] text-slate-500 mt-1">In Verification Pipeline</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Approved</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-emerald-600 mt-3">{approved}</p>
          <p className="text-[11px] text-slate-500 mt-1">Allocated Hostels</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rejected</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-rose-600 mt-3">{rejected}</p>
          <p className="text-[11px] text-slate-500 mt-1">Disqualified or Ineligible</p>
        </div>
      </div>

      {/* Active Application Status Timeline */}
      {latestApp && (
        <div className="rounded-2xl bg-white border border-slate-200/80 shadow-xs p-6 sm:p-7">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Cycle</span>
                <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  {latestApp.application_id}
                </span>
                <StatusBadge status={latestApp.status} />
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-1.5 flex items-center gap-2">
                <Building className="w-4 h-4 text-slate-400" />
                <span>{latestApp.hostel_preference}</span>
              </h2>
            </div>
            <Link
              to="/student/applications"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 self-start sm:self-auto"
            >
              <span>View Full Details & History</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Timeline visualization */}
          <div className="mt-6">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
              Real-time Workflow Progress
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Step 1 */}
              <div className={`p-4 rounded-xl border ${
                latestApp ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">1. Submission</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="text-xs text-slate-600 mt-1">Details & Docs Received</p>
                <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                  {new Date(latestApp.submitted_at).toLocaleDateString()}
                </p>
              </div>

              {/* Step 2 */}
              <div className={`p-4 rounded-xl border ${
                latestApp.initial_verification_at || latestApp.status !== 'Submitted'
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                  : 'bg-blue-50/80 border-blue-200 text-blue-900'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">2. Initial Verification</span>
                  {latestApp.initial_verification_at || latestApp.status !== 'Submitted' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
                  )}
                </div>
                <p className="text-xs text-slate-600 mt-1">Automated Document OCR</p>
                <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                  {latestApp.mandatory_documents_complete ? 'Passed' : 'Pending'}
                </p>
              </div>

              {/* Step 3 */}
              <div className={`p-4 rounded-xl border ${
                latestApp.status === 'Approved' || latestApp.status === 'Rejected'
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                  : latestApp.status === 'Under Department Review' || latestApp.status === 'Additional Documents Requested'
                  ? 'bg-amber-50/80 border-amber-200 text-amber-900 ring-2 ring-amber-400/20'
                  : 'bg-slate-50 border-slate-200 opacity-60'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">3. Department Review</span>
                  {latestApp.status === 'Approved' || latestApp.status === 'Rejected' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Clock className="w-4 h-4 text-amber-600" />
                  )}
                </div>
                <p className="text-xs text-slate-600 mt-1">Warden Inspection</p>
                <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                  {latestApp.department}
                </p>
              </div>

              {/* Step 4 */}
              <div className={`p-4 rounded-xl border ${
                latestApp.status === 'Approved'
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                  : latestApp.status === 'Rejected'
                  ? 'bg-rose-50/70 border-rose-200 text-rose-900'
                  : 'bg-slate-50 border-slate-200 opacity-60'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">4. Final Allocation</span>
                  {latestApp.status === 'Approved' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : latestApp.status === 'Rejected' ? (
                    <XCircle className="w-4 h-4 text-rose-600" />
                  ) : (
                    <Clock className="w-4 h-4 text-slate-400" />
                  )}
                </div>
                <p className="text-xs text-slate-600 mt-1">Hostel Room Allotted</p>
                <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                  {latestApp.decision_at ? new Date(latestApp.decision_at).toLocaleDateString() : 'Awaiting warden sign-off'}
                </p>
              </div>
            </div>

            {latestApp.admin_remarks && (
              <div className="mt-4 p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/70 text-xs text-blue-900 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold">Administrative Note:</strong> {latestApp.admin_remarks}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recent Applications Table */}
      <div className="rounded-2xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-6 py-5 flex items-center justify-between border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Applications</h3>
            <p className="text-xs text-slate-500 mt-0.5">Your submitted hostel requests</p>
          </div>
          <Link
            to="/student/applications"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">
            <span className="w-5 h-5 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin inline-block mb-2" />
            <p>Loading application records...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
              <Building className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">No applications yet</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              You haven't submitted a hostel accommodation application for this academic session.
            </p>
            <Link
              to="/student/apply"
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700"
            >
              <FilePlus className="w-3.5 h-3.5" />
              <span>Apply for Hostel Now</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-3.5">Application ID</th>
                  <th className="px-6 py-3.5">Hostel Preference</th>
                  <th className="px-6 py-3.5">Cycle</th>
                  <th className="px-6 py-3.5">Submission Date</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {applications.slice(0, 3).map(app => (
                  <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-slate-900">
                      {app.application_id}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800">
                      {app.hostel_preference}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {app.application_cycle}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(app.submitted_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to="/student/applications"
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
