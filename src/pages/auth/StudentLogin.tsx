import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Logo } from '../../components/common/Logo';
import { BannerAlert } from '../../components/common/BannerAlert';
import { ArrowRight, Lock, Mail, AlertCircle, Sparkles, User } from 'lucide-react';

export const StudentLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { loginAsStudent, isLiveSupabase } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email) {
      setErrorMessage('Please enter your university email address.');
      return;
    }

    if (isLiveSupabase && !password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setSubmitting(true);
    const result = await loginAsStudent(email, password);
    setSubmitting(false);

    if (result.success) {
      const returnUrl = (location.state as any)?.from?.pathname || '/student/dashboard';
      navigate(returnUrl);
    } else {
      setErrorMessage(result.error || 'Failed to sign in. Please verify your credentials.');
    }
  };

  const fillDemoAccount = () => {
    setEmail('student@uniflow.edu');
    setPassword('Student@123');
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <BannerAlert />

      <div className="flex-1 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <div className="inline-block mb-4">
            <Logo size="lg" showTagline />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Student Portal Sign In
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Access hostel accommodations, verification history, and clearances
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
          <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 rounded-2xl border border-slate-100 sm:px-10">
            {/* Quick Credentials Info */}
            {isLiveSupabase ? (
              <div className="mb-6 p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200/60 flex items-center gap-2.5 text-xs text-emerald-900">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span>
                  <strong>Supabase Auth Active:</strong> Sign in with your registered account or click below to register.
                </span>
              </div>
            ) : (
              <div className="mb-6 p-3.5 rounded-xl bg-blue-50/80 border border-blue-200/60 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="text-xs font-semibold text-blue-900">Evaluation Demo Student</span>
                </div>
                <button
                  type="button"
                  onClick={fillDemoAccount}
                  className="px-2.5 py-1 text-xs font-bold text-blue-700 bg-white hover:bg-blue-100 rounded-lg shadow-2xs transition-colors"
                >
                  Auto Fill
                </button>
              </div>
            )}

            {errorMessage && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form className="space-y-4" onSubmit={handleLogin}>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  University Email Address
                </label>
                <div className="relative rounded-xl shadow-2xs">
                  <div className="pointer-events-none absolute inset-y-0 left-0 pl-3.5 flex items-center">
                    <Mail className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="student@uniflow.edu"
                    className="block w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-hidden transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Password
                  </label>
                  <span className="text-[11px] text-blue-600 hover:underline cursor-pointer">
                    Forgot password?
                  </span>
                </div>
                <div className="relative rounded-xl shadow-2xs">
                  <div className="pointer-events-none absolute inset-y-0 left-0 pl-3.5 flex items-center">
                    <Lock className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="block w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-hidden transition-all"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-md shadow-blue-600/20 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-50"
                >
                  {submitting ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <User className="w-4 h-4" />
                      <span>Sign In as Student</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-100 text-center space-y-3">
              <p className="text-xs text-slate-500">
                New to university accommodation?{' '}
                <Link to="/student/register" className="font-bold text-blue-600 hover:underline">
                  Create student profile
                </Link>
              </p>
              <div className="pt-1">
                <Link to="/admin/login" className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors">
                  Are you a Warden or Administrator? <span className="text-blue-600 underline">Admin Sign In</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="py-4 text-center text-xs text-slate-400">
        &copy; {new Date().getFullYear()} UniFlow AI. Campus Administration Portal.
      </div>
    </div>
  );
};
