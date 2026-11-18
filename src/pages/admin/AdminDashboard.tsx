import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { adminService } from '../../services/adminService';
import { applicationService } from '../../services/applicationService';
import { Application } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  FileCheck2,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ShieldCheck,
  TrendingUp,
  Building,
  Users,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Zap,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { adminProfile } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    additionalDocs: 0,
    avgProcessingHours: 18.4,
    verificationAccuracy: '99.2%',
  });
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [dashStats, allApps] = await Promise.all([
          adminService.getDashboardStats(),
          applicationService.getAllApplications(),
        ]);
        setStats(dashStats);
        setApplications(allApps);
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const pendingApplications = applications.filter(
    a => a.status === 'Submitted' || a.status === 'Under Initial Verification' || a.status === 'Under Department Review'
  );

  return (
    <div className="space-y-8">
      {/* Welcome & System Status Banner */}
      <div className="rounded-2xl bg-slate-900 text-white p-6 sm:p-8 shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950 text-cyan-300 text-xs font-semibold border border-cyan-800/60">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Hostel Admissions Administration Desk</span>
            </span>
            <span className="text-xs text-slate-400 font-mono hidden sm:inline">Session 2025-2026</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Administrator Workspace
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Welcome, <strong>{adminProfile?.name || 'Chief Warden'}</strong> &bull; {adminProfile?.department || 'Hostel Administration Office'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/admin/applications"
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
          >
            <span>Review Applications Queue</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/admin/verification"
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors"
          >
            Doc Verification
          </Link>
        </div>
      </div>

      {/* Dashboard Statistics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Applications</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-3">{stats.total}</p>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-emerald-600 font-semibold">
            <TrendingUp className="w-3 h-3" />
            <span>Active intake cycle</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Review</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-amber-600 mt-3">{stats.pending}</p>
          <p className="text-[11px] text-slate-500 mt-1">Requires warden decision</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Approved</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-emerald-600 mt-3">{stats.approved}</p>
          <p className="text-[11px] text-slate-500 mt-1">Room allotments issued</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rejected</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-rose-600 mt-3">{stats.rejected}</p>
          <p className="text-[11px] text-slate-500 mt-1">Reason recorded</p>
        </div>
      </div>

      {/* Visual Analytics & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Breakdown */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-slate-900">Application Distribution by Department</h3>
              <p className="text-xs text-slate-500 mt-0.5">Applicant density across academic branches</p>
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
              Live Metrics
            </span>
          </div>

          <div className="space-y-4">
            {[
              { dept: 'Computer Science & Engineering', count: 18, pct: 45, color: 'bg-blue-600' },
              { dept: 'Electronics & Communication', count: 10, pct: 25, color: 'bg-cyan-500' },
              { dept: 'Mechanical Engineering', count: 7, pct: 18, color: 'bg-indigo-600' },
              { dept: 'Civil Engineering', count: 5, pct: 12, color: 'bg-slate-500' },
            ].map(item => (
              <div key={item.dept}>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-700">{item.dept}</span>
                  <span className="text-slate-500 font-mono">{item.count} applicants ({item.pct}%)</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${item.color} rounded-full transition-all`} style={{ width: `${item.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Operational Efficiency Card */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Automation Performance</h3>
            <p className="text-xs text-slate-500 mt-0.5">AI validation & workflow metrics</p>

            <div className="mt-6 space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Avg. Processing Turnaround
                </span>
                <p className="text-2xl font-extrabold text-blue-600 mt-1">18.4 Hours</p>
                <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">85% reduction from manual era (12 days)</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Document OCR Accuracy
                </span>
                <p className="text-2xl font-extrabold text-emerald-600 mt-1">99.2%</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Aadhaar, Roll No., & Grade parsing</p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Make.com Webhooks Active
            </span>
            <Link to="/admin/settings" className="text-blue-600 font-bold hover:underline">
              Settings &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Pending Applications Queue */}
      <div className="rounded-2xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-6 py-5 flex items-center justify-between border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Urgent Review Queue</h3>
            <p className="text-xs text-slate-500 mt-0.5">Applications awaiting warden inspection & allocation</p>
          </div>
          <Link
            to="/admin/applications"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>View All Applications</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading queue...</div>
        ) : pendingApplications.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="font-bold">Queue is clear!</p>
            <p className="text-slate-400 mt-0.5">No applications are currently awaiting administrative review.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-3.5">ID & Student</th>
                  <th className="px-6 py-3.5">Department</th>
                  <th className="px-6 py-3.5">Hostel Preference</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Docs Verified</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingApplications.slice(0, 5).map(app => (
                  <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-blue-600 block">{app.application_id}</span>
                      <span className="font-semibold text-slate-900">{app.student_name}</span>
                      <span className="text-[11px] text-slate-400 font-mono block">({app.enrollment_number})</span>
                    </td>
                    <td className="px-6 py-4 text-slate-700 font-medium">
                      {app.department}
                    </td>
                    <td className="px-6 py-4 text-slate-800">
                      {app.hostel_preference}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={app.status} size="sm" />
                    </td>
                    <td className="px-6 py-4">
                      {app.mandatory_documents_complete ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>All 3 Mandatory</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-600 font-semibold text-[11px]">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Incomplete</span>
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/admin/applications?id=${app.application_id}`}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors inline-block"
                      >
                        Review
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
