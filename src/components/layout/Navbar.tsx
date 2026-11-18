import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Logo } from '../common/Logo';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowRight, Menu, X, Shield, User } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAdmin, isStudent } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="focus:outline-hidden">
            <Logo size="md" showTagline />
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">
              How It Works
            </a>
            <a href="#benefits" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">
              Benefits
            </a>
            <a href="#modules" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">
              Hostel Module
            </a>
          </nav>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate(isAdmin ? '/admin/dashboard' : '/student/dashboard')}
                  className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors flex items-center gap-2"
                >
                  {isAdmin ? <Shield className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  <span>{isAdmin ? 'Admin Portal' : 'Student Portal'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/admin/login"
                  className="px-3.5 py-2 text-sm font-semibold text-slate-600 hover:text-blue-700 hover:bg-slate-50 rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <Shield className="w-4 h-4 text-slate-400" />
                  <span>Admin Login</span>
                </Link>
                <Link
                  to="/student/login"
                  className="px-3.5 py-2 text-sm font-semibold text-slate-700 hover:text-blue-700 hover:bg-slate-50 rounded-xl transition-colors"
                >
                  Student Login
                </Link>
                <Link
                  to="/student/register"
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm shadow-blue-500/25 transition-all flex items-center gap-2 hover:translate-y-[-1px]"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-3">
          <a
            href="#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
          >
            How It Works
          </a>
          <a
            href="#benefits"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
          >
            Benefits
          </a>
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <Link
              to="/student/login"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full text-center py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 rounded-xl"
            >
              Student Login
            </Link>
            <Link
              to="/admin/login"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full text-center py-2.5 text-sm font-semibold text-slate-700 border border-slate-200 rounded-xl"
            >
              Admin Login
            </Link>
            <Link
              to="/student/register"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full text-center py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
