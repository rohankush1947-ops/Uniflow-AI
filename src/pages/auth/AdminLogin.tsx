import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Logo } from '../../components/common/Logo';
import { BannerAlert } from '../../components/common/BannerAlert';
import { Shield, ShieldAlert, Lock, Mail, AlertCircle, ArrowRight, CheckCircle2, UserCheck } from 'lucide-react';

export const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { loginAsAdmin, isLiveSupabase } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email) {
      setErrorMessage('Please enter an authorized administrator email address.');
      return;
    }

    if (isLiveSupabase && !password) {
      setErrorMessage('Please enter your administrator account password.');
      return;
    }

    setSubmitting(true);
    const result = await loginAsAdmin(email, password);
    setSubmitting(false);

    if (result.success) {
      const returnUrl = (location.state as any)?.from?.pathname || '/admin/dashboard';
      navigate(returnUrl);
    } else {
      setErrorMessage(result.error || 'Access Denied: Invalid credentials or unauthorized administrative role.');
    }
  };

  const fillValidAdmin = () => {
    setEmail('admin@uniflow.edu');
    setPassword('Admin@UniFlow2025');
    setErrorMessage('');
  };

  const fillInactiveAdmin = () => {
    setEmail('inactive.admin@uniflow.edu');
    setPassword('Inactive@123');
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between selection:bg-cyan-500 selection:text-slate-950">
      <BannerAlert />

      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <div className="inline-flex p-3 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl mb-4">
            <Shield className="w-10 h-10 text-cyan-400" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white">
            Warden & Admin Control
          </h2>
          <p className="mt-1.5 text-xs text-slate-400">
            Protected University Operations & Hostel Admission Desk
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-slate-900 py-8 px-6 shadow-2xl rounded-2xl border border-slate-800 sm:px-10">
            {/* Security Notice */}
            <div className="mb-6 p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 text-[11px] text-slate-300 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                <strong>Restricted Area:</strong> Access verified against the university's active <code className="text-cyan-300 bg-slate-950 px-1 py-0.5 rounded font-mono">admin_users</code> registry with <code className="text-cyan-300 bg-slate-950 px-1 py-0.5 rounded font-mono">is_active = true</code>.
              </span>
            </div>

            {/* Live Status or Demo Credentials */}
            {isLiveSupabase ? (
              <div className="mb-6 p-3 rounded-xl bg-slate-950 border border-cyan-900/50 text-[11px] text-cyan-300 space-y-1">
                <div className="flex items-center gap-2 font-bold text-cyan-400">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span>Supabase RBAC Verification Active</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Sign in with your registered university administrator account. The system verifies your email against the <code className="text-cyan-300 bg-slate-900 px-1 py-0.5 rounded font-mono">admin_users</code> table with <code className="text-cyan-300 bg-slate-900 px-1 py-0.5 rounded font-mono">is_active = true</code>.
                </p>
              </div>
            ) : (
              <div className="mb-6 p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Evaluation Test Credentials:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={fillValidAdmin}
                    className="px-2.5 py-1.5 text-[11px] font-semibold text-emerald-400 bg-emerald-950/40 hover:bg-emerald-950/70 border border-emerald-800/50 rounded-lg text-left transition-colors flex items-center justify-between"
                  >
                    <span>Chief Warden</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  </button>
                  <button
                    type="button"
                    onClick={fillInactiveAdmin}
                    className="px-2.5 py-1.5 text-[11px] font-semibold text-rose-400 bg-rose-950/40 hover:bg-rose-950/70 border border-rose-800/50 rounded-lg text-left transition-colors flex items-center justify-between"
                    title="Test security rejection for inactive admin"
                  >
                    <span>Inactive (Test)</span>
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  </button>
                </div>
              </div>
            )}

            {errorMessage && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-200 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form className="space-y-4" onSubmit={handleAdminLogin}>
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Administrative Email Address
                </label>
                <div className="relative rounded-xl shadow-2xs">
                  <div className="pointer-events-none absolute inset-y-0 left-0 pl-3.5 flex items-center">
                    <Mail className="h-4 w-4 text-slate-500" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="admin@uniflow.edu"
                    className="block w-full pl-10 pr-3 py-2.5 text-sm bg-slate-950 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-hidden transition-all placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Security Passkey / Password
                </label>
                <div className="relative rounded-xl shadow-2xs">
                  <div className="pointer-events-none absolute inset-y-0 left-0 pl-3.5 flex items-center">
                    <Lock className="h-4 w-4 text-slate-500" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="block w-full pl-10 pr-3 py-2.5 text-sm bg-slate-950 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-hidden transition-all placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-cyan-500/20 text-sm font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 focus:outline-hidden transition-all disabled:opacity-50"
                >
                  {submitting ? (
                    <span className="w-5 h-5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                  ) : (
                    <>
                      <UserCheck className="w-4 h-4" />
                      <span>Authenticate Administrative Access</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-800 text-center">
              <Link to="/student/login" className="text-xs text-slate-400 hover:text-white transition-colors">
                Are you a student applicant? <span className="text-cyan-400 underline">Return to Student Login</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="py-4 text-center text-xs text-slate-600">
        UniFlow AI Security Enclave &bull; Row Level Security &bull; Audit Trail Logged
      </div>
    </div>
  );
};
