import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { NotificationLog } from '../../types';
import { Bell, CheckCircle2, Mail, Clock } from 'lucide-react';

export const StudentNotifications: React.FC = () => {
  const { studentProfile, user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);
  const [loading, setLoading] = useState(true);

  const studentEmail = studentProfile?.email || user?.email || '';

  useEffect(() => {
    async function loadStudentNotifs() {
      setLoading(true);
      if (isSupabaseConfigured && studentEmail) {
        try {
          const { data, error } = await supabase
            .from('notification_logs')
            .select('*')
            .eq('recipient_email', studentEmail)
            .order('created_at', { ascending: false });

          if (!error && data) {
            setNotifications(data);
          } else {
            setNotifications([]);
          }
        } catch (err) {
          console.warn('Error fetching student notifications:', err);
          setNotifications([]);
        }
      } else {
        // Offline demo notifications
        setNotifications([
          {
            id: 'notif-1',
            application_id: 'HOSTEL-2025-91823',
            recipient_email: 'student@uniflow.edu',
            subject: 'Hostel Application Status Update (Under Department Review)',
            sent_at: new Date(Date.now() - 7200000).toISOString(),
            created_at: new Date(Date.now() - 7200000).toISOString(),
          },
          {
            id: 'notif-2',
            application_id: 'HOSTEL-2025-91823',
            recipient_email: 'student@uniflow.edu',
            subject: 'Application Received & Registered: HOSTEL-2025-91823',
            sent_at: new Date(Date.now() - 86400000).toISOString(),
            created_at: new Date(Date.now() - 86400000).toISOString(),
          },
        ]);
      }
      setLoading(false);
    }
    loadStudentNotifs();
  }, [studentEmail]);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Notifications & System Alerts
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Real-time updates regarding your submitted applications and university correspondence.
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500">
          <span className="w-6 h-6 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin inline-block mb-3" />
          <p>Retrieving your notifications...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200/80 shadow-2xs text-center max-w-lg mx-auto">
          <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">No notifications yet</h3>
          <p className="text-xs text-slate-500 mt-1">
            When status updates or requests are issued for your hostel application, notifications will be displayed here.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs divide-y divide-slate-100 overflow-hidden">
          {notifications.map(item => (
            <div key={item.id} className="p-5 hover:bg-slate-50/50 transition-colors flex items-start gap-4">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                <Bell className="w-5 h-5" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-bold text-slate-900">{item.subject}</h4>
                  <span className="text-[11px] font-mono text-slate-400 whitespace-nowrap">
                    {new Date(item.sent_at || item.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                    <Mail className="w-3 h-3" />
                    <span>Dispatched to {item.recipient_email}</span>
                  </span>
                  {item.application_id && (
                    <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                      Ref: {item.application_id}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
