import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Database, ShieldCheck, Sparkles, User, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';

export const BannerAlert: React.FC = () => {
  const { isLiveSupabase, user, role, switchDemoRole } = useAuth();

  return (
    <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 border-b border-slate-800">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {isLiveSupabase ? (
            <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <Database className="w-3.5 h-3.5" />
              <span>Live Supabase Connected</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-cyan-300 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Interactive Evaluation Mode (Demo Schema Active)</span>
            </span>
          )}
          <span className="text-slate-600 hidden sm:inline">|</span>
          <span className="text-slate-400 hidden md:inline">
            Hostel Module &bull; <strong className="text-slate-200">Session 2025-2026</strong>
          </span>
        </div>

        {/* User state and links */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-slate-400">
                Logged in: <strong className="text-white font-mono">{user.email}</strong>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-900 text-blue-200 border border-blue-700">
                {role || 'Student'}
              </span>
              <Link
                to={role === 'admin' ? '/admin/dashboard' : '/student/dashboard'}
                className="text-cyan-400 hover:text-cyan-300 hover:underline font-medium inline-flex items-center gap-1 ml-1"
              >
                Dashboard &rarr;
              </Link>
            </div>
          ) : isLiveSupabase ? (
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Authenticating via Supabase</span>
              <Link
                to="/student/login"
                className="text-cyan-400 hover:text-cyan-300 font-semibold inline-flex items-center gap-1"
              >
                <LogIn className="w-3 h-3" />
                <span>Sign In</span>
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Demo Role:</span>
              <div className="inline-flex rounded-lg bg-slate-800 p-0.5 border border-slate-700">
                <button
                  onClick={() => switchDemoRole('student')}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                    role === 'student' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Student
                </button>
                <button
                  onClick={() => switchDemoRole('admin')}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                    role === 'admin' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Admin
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
