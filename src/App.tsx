import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { StudentLogin } from './pages/auth/StudentLogin';
import { StudentRegister } from './pages/auth/StudentRegister';
import { AdminLogin } from './pages/auth/AdminLogin';

// Student Layout & Pages
import { StudentLayout } from './components/layout/StudentLayout';
import { StudentDashboard } from './pages/student/StudentDashboard';
import { HostelApplicationForm } from './pages/student/HostelApplicationForm';
import { MyApplications } from './pages/student/MyApplications';
import { StudentDocuments } from './pages/student/StudentDocuments';
import { StudentNotifications } from './pages/student/StudentNotifications';
import { StudentProfile } from './pages/student/StudentProfile';

// Admin Layout & Pages
import { AdminLayout } from './components/layout/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminApplications } from './pages/admin/AdminApplications';
import { AdminDocumentVerification } from './pages/admin/AdminDocumentVerification';
import { AdminNotifications } from './pages/admin/AdminNotifications';
import { AdminSettings } from './pages/admin/AdminSettings';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/student/login" element={<StudentLogin />} />
          <Route path="/student/register" element={<StudentRegister />} />
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Student Protected Portal */}
          <Route
            path="/student"
            element={
              <ProtectedRoute requireStudent>
                <StudentLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/student/dashboard" replace />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="apply" element={<HostelApplicationForm />} />
            <Route path="applications" element={<MyApplications />} />
            <Route path="documents" element={<StudentDocuments />} />
            <Route path="notifications" element={<StudentNotifications />} />
            <Route path="profile" element={<StudentProfile />} />
          </Route>

          {/* Admin Protected Portal */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="applications" element={<AdminApplications />} />
            <Route path="verification" element={<AdminDocumentVerification />} />
            <Route path="notifications" element={<AdminNotifications />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* Catch-all Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
