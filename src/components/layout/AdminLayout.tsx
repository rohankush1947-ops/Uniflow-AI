import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Logo } from '../common/Logo';
import { BannerAlert } from '../common/BannerAlert';
import {
  LayoutDashboard,
  FileCheck2,
  Clock,
  CheckCircle,
  XCircle,
  ShieldCheck,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { adminProfile, user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navItems = [
    { label: 'Overview', to: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'All Applications', to: '/admin/applications', icon: FileCheck2 },
    { label: 'Pending Applications', to: '/admin/applications?status=Pending', icon: Clock },
    { label: 'Approved Applications', to: '/admin/applications?status=Approved', icon: CheckCircle },
    { label: 'Rejected Applications', to: '/admin/applications?status=Rejected', icon: XCircle },
    { label: 'Document Verification', to: '/admin/verification', icon: ShieldCheck, badge: 'AI Verified' },
    { label: 'Notifications', to: '/admin/notifications', icon: Bell },
    { label: 'Settings', to: '/admin/settings', icon: Settings },
  ];

  const adminName = adminProfile?.name || user?.user_metadata?.name || 'Chief Warden';
  const roleName = adminProfile?.role === 'chief_warden' ? 'Chief Warden' : 'Hostel Administrator';
  const department = adminProfile?.department || 'Hostel Administration Office';

  const isCurrentActive = (itemTo: string) => {
    const [path, search] = itemTo.split('?');
    if (search) {
      return location.pathname === path && location.search.includes(search);
    }
    return location.pathname === path && !location.search.includes('status=');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <BannerAlert />

      <div className="flex-1 flex overflow-hidden">
        {/* Mobile Sidebar Backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-slate-900/60 lg:hidden backdrop-blur-xs"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Header */}
          <div className="h-20 px-6 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Logo size="sm" />
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Admin Identity Card */}
          <div className="p-4 m-3 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-800/60 border border-slate-700/80 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0">
                {adminName.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-white truncate">{adminName}</p>
                <div className="flex items-center gap-1 text-[11px] text-cyan-400 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{roleName}</span>
                </div>
              </div>
            </div>
            <div className="mt-2.5 pt-2 border-t border-slate-700/60 text-[11px] text-slate-400 truncate flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
              <span className="truncate">{department}</span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
            {navItems.map(item => {
              const Icon = item.icon;
              const active = isCurrentActive(item.to);
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all group ${
                    active
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                        active ? 'bg-blue-500 text-white' : 'bg-cyan-950 text-cyan-300 border border-cyan-800/50'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Logout Section */}
          <div className="p-3 border-t border-slate-800">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-colors"
            >
              <LogOut className="w-4 h-4 text-rose-400" />
              <span>Sign out</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Top Header */}
          <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                aria-label="Open admin sidebar"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <span className="text-blue-600 font-semibold">Admin Workspace</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-800 font-semibold">Hostel Admissions Control</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-full text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Make.com Automated Intake Ready</span>
              </div>

              <NavLink
                to="/admin/notifications"
                className="relative p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                aria-label="View system notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
              </NavLink>
            </div>
          </header>

          {/* Page Content Body */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};
