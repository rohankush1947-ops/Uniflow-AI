import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Logo } from './Logo';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireStudent?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAdmin = false,
  requireStudent = false,
}) => {
  const { user, isAdmin, isStudent, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <Logo size="lg" showTagline />
        <div className="mt-8 flex items-center gap-3 text-sm text-slate-500 font-medium">
          <span className="w-5 h-5 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
          <span>Verifying security credentials & access rights...</span>
        </div>
      </div>
    );
  }

  // Admin route protection
  if (requireAdmin) {
    if (!user || !isAdmin) {
      // Redirect to Admin Login with return location
      return <Navigate to="/admin/login" state={{ from: location, error: 'Administrator access required.' }} replace />;
    }
  }

  // Student route protection
  if (requireStudent) {
    if (!user || !isStudent) {
      return <Navigate to="/student/login" state={{ from: location }} replace />;
    }
  }

  return <>{children}</>;
};
