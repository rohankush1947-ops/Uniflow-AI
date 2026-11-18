import React, { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { NotificationLog } from '../../types';
import { Mail, CheckCircle2, Bell } from 'lucide-react';

export const AdminNotifications: React.FC = () => {
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      setLoading(true);
      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase
            .from('notification_logs')
            .select('*')
            .order('created_at', { ascending: false });

          if (!error && data) {
            setLogs(data);
          } else {
            setLogs([]);
          }
        } catch (err) {
          console.error('Error fetching notification logs:', err);
          setLogs([]);
        }
      } else {
        // Offline demo logs
        setLogs([
          {
            id: 'log-101',
            application_id: 'HOSTEL-2025-91823',
            recipient_email: 'student@uniflow.edu',
            subject: 'Hostel Application Status Update (Under Department Review)',
            sent_at: new Date(Date.now() - 3600000).toISOString(),
            created_at: new Date(Date.now() - 3600000).toISOString(),
          },
        ]);
      }
      setLoading(false);
    }
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Notification & Dispatch Logs
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Audit trail of automated email dispatches and student communication triggers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Supabase Notification Bus Online</span>
          </span>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500">
          <span className="w-6 h-6 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin inline-block mb-3" />
          <p>Querying Supabase notification_logs...</p>
        </div>
      ) : logs.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200/80 shadow-2xs text-center max-w-lg mx-auto">
          <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">No notification logs recorded</h3>
          <p className="text-xs text-slate-500 mt-1">
            When automated email dispatches or status change notifications occur, logs will appear here.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Application ID</th>
                  <th className="px-6 py-4">Recipient</th>
                  <th className="px-6 py-4">Subject</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Dispatched At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-blue-600">
                      {log.application_id || 'SYSTEM'}
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-800">
                      {log.recipient_email}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      {log.subject}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Dispatched</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-mono text-[11px]">
                      {new Date(log.sent_at || log.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
