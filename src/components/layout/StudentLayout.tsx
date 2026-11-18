import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Logo } from '../common/Logo';
import { BannerAlert } from '../common/BannerAlert';
import {
  LayoutDashboard,
  FilePlus,
  Files,
  FileText,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  ChevronRight,
  GraduationCap,
} from 'lucide-react';

export const StudentLayout: React.FC = () => {
  const { studentProfile, user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navItems = [
    { label: 'Overview', to: '/student/dashboard', icon: LayoutDashboard },
    { label: 'Apply for Hostel', to: '/student/apply', icon: FilePlus, badge: 'Active' },
    { label: 'My Applications', to: '/student/applications', icon: Files },
    { label: 'Documents', to: '/student/documents', icon: FileText },
    { label: 'Notifications', to: '/student/notifications', icon: Bell },
    { label: 'Profile', to: '/student/profile', icon: User },
  ];

  const studentName = studentProfile?.full_name || user?.user_metadata?.name || 'Student';
  const enrollmentNo = studentProfile?.enrollment_number || '2024CSB1042';
  const dept = studentProfile?.department || 'Computer Science';

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
          className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200/90 flex flex-col transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Sidebar Header */}
          <div className="h-20 px-6 flex items-center justify-between border-b border-slate-100">
            <Logo size="sm" />
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Student Profile Card Snippet */}
          <div className="p-4 m-3 rounded-2xl bg-gradient-to-br from-blue-50/80 via-white to-cyan-50/50 border border-blue-100/80 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0">
                {studentName.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-900 truncate">{studentName}</p>
                <div className="flex items-center gap-1.5 text-[11px] text-blue-700 font-medium">
                  <GraduationCap className="w-3 h-3 shrink-0" />
                  <span className="truncate">{enrollmentNo}</span>
                </div>
              </div>
            </div>
            <div className="mt-2.5 pt-2 border-t border-blue-100/60 text-[11px] text-slate-500 truncate">
              {dept}
            </div>
          </div>

          {/* Nav Links */}
          <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
            {navItems.map(item => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all group ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                            isActive ? 'bg-blue-500 text-white' : 'bg-blue-50 text-blue-700 border border-blue-200/50'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Logout Section */}
          <div className="p-3 border-t border-slate-100">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <LogOut className="w-4 h-4 text-rose-500" />
              <span>Log out</span>
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
                aria-label="Open sidebar"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <span>Student Portal</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-800 font-semibold">Hostel Automation</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <NavLink
                to="/student/apply"
                className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-2xs"
              >
                <FilePlus className="w-3.5 h-3.5" />
                <span>Apply for Hostel</span>
              </NavLink>

              <NavLink
                to="/student/notifications"
                className="relative p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                aria-label="View notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600" />
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
