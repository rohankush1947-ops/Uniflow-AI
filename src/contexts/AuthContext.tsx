import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Student, AdminUser, UserRole } from '../types';
import { INITIAL_STUDENTS, INITIAL_ADMIN_USERS } from '../lib/mockData';
import { parseAcademicYearToInteger } from '../lib/academicYear';

interface AuthContextType {
  user: any | null;
  role: UserRole | null;
  studentProfile: Student | null;
  adminProfile: AdminUser | null;
  isAdmin: boolean;
  isStudent: boolean;
  isLoading: boolean;
  isLiveSupabase: boolean;
  loginAsStudent: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  registerStudent: (studentData: Partial<Student> & { password?: string }) => Promise<{ success: boolean; error?: string }>;
  loginAsAdmin: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  switchDemoRole: (role: 'student' | 'admin') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [studentProfile, setStudentProfile] = useState<Student | null>(null);
  const [adminProfile, setAdminProfile] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize session on mount
  useEffect(() => {
    async function initAuth() {
      setIsLoading(true);
      try {
        if (isSupabaseConfigured) {
          const { data: { session }, error: sessionErr } = await supabase.auth.getSession();
          if (sessionErr) {
            console.warn('Session retrieval notice:', sessionErr.message);
          }
          if (session?.user) {
            setUser(session.user);
            await loadProfile(session.user);
          } else {
            setUser(null);
            setRole(null);
            setStudentProfile(null);
            setAdminProfile(null);
          }
        } else {
          // Check if demo role was set in local testing
          const savedRole = sessionStorage.getItem('uniflow_demo_role') as UserRole | null;
          if (savedRole === 'admin') {
            const admin = INITIAL_ADMIN_USERS[0];
            setUser({ id: admin.id, email: admin.email, user_metadata: { name: admin.full_name } });
            setRole('admin');
            setAdminProfile(admin);
          } else if (savedRole === 'student') {
            const student = INITIAL_STUDENTS[0];
            setUser({ id: student.id, email: student.email, user_metadata: { name: student.student_name } });
            setRole('student');
            setStudentProfile(student);
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    }

    initAuth();

    // Listen to real Supabase auth state changes
    if (isSupabaseConfigured) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          setUser(session.user);
          await loadProfile(session.user);
        } else {
          setUser(null);
          setRole(null);
          setStudentProfile(null);
          setAdminProfile(null);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  // Helper to load profile from live Supabase tables
  async function loadProfile(supabaseUser: any) {
    if (!supabaseUser?.email) return;
    const email = supabaseUser.email;

    if (isSupabaseConfigured) {
      try {
        // 1. Check if user is in admin_users table with is_active = true
        const { data: adminData, error: adminErr } = await supabase
          .from('admin_users')
          .select('*')
          .eq('email', email)
          .eq('is_active', true)
          .maybeSingle();

        if (!adminErr && adminData) {
          const mappedAdmin: AdminUser = {
            id: adminData.id,
            email: adminData.email,
            full_name: adminData.full_name || adminData.email.split('@')[0],
            name: adminData.full_name || adminData.email.split('@')[0],
            role: adminData.role || 'admin',
            is_active: adminData.is_active,
            department: adminData.department || 'Hostel Administration Office',
            created_at: adminData.created_at,
            updated_at: adminData.updated_at,
          };
          setRole('admin');
          setAdminProfile(mappedAdmin);
          setStudentProfile(null);
          return;
        }

        // 2. Query students table
        const { data: stuData, error: stuErr } = await supabase
          .from('students')
          .select('*')
          .or(`email.eq.${email},id.eq.${supabaseUser.id}`)
          .maybeSingle();

        if (!stuErr && stuData) {
          const mappedStudent: Student = {
            id: stuData.id,
            enrollment_number: stuData.enrollment_number,
            student_name: stuData.student_name,
            full_name: stuData.student_name,
            email: stuData.email,
            phone: stuData.phone,
            department: stuData.department,
            year: stuData.year,
            academic_year: stuData.year,
            address: stuData.address,
            created_at: stuData.created_at,
            updated_at: stuData.updated_at,
          };
          setRole('student');
          setStudentProfile(mappedStudent);
          setAdminProfile(null);
          return;
        }

        // 3. If signed up but no student table row found yet, synthesize from auth metadata
        const metadata = supabaseUser.user_metadata || {};
        const fallbackStudent: Student = {
          id: supabaseUser.id,
          enrollment_number: metadata.enrollment_number || 'PENDING',
          student_name: metadata.student_name || metadata.full_name || email.split('@')[0],
          full_name: metadata.student_name || metadata.full_name || email.split('@')[0],
          email,
          phone: metadata.phone || '',
          department: metadata.department || 'General Academic',
          year: metadata.year || '1st Year',
          academic_year: metadata.year || '1st Year',
          address: metadata.address || '',
          created_at: supabaseUser.created_at,
        };

        setRole('student');
        setStudentProfile(fallbackStudent);
        setAdminProfile(null);
      } catch (err) {
        console.error('Error fetching live user profile:', err);
      }
    } else {
      // Offline Demo fallback
      const admin = INITIAL_ADMIN_USERS.find(a => a.email.toLowerCase() === email.toLowerCase());
      if (admin && admin.is_active) {
        setRole('admin');
        setAdminProfile(admin);
        setStudentProfile(null);
        return;
      }

      const student = INITIAL_STUDENTS.find(s => s.email.toLowerCase() === email.toLowerCase()) || INITIAL_STUDENTS[0];
      setRole('student');
      setStudentProfile(student);
      setAdminProfile(null);
    }
  }

  // Student Login
  const loginAsStudent = async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured) {
        if (!password) {
          setIsLoading(false);
          return { success: false, error: 'Password is required' };
        }
        const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) {
          setIsLoading(false);
          return { success: false, error: error.message };
        }

        setUser(data.user);
        await loadProfile(data.user);
        setIsLoading(false);
        return { success: true };
      } else {
        const student = INITIAL_STUDENTS.find(s => s.email.toLowerCase() === email.toLowerCase()) || INITIAL_STUDENTS[0];
        setUser({ id: student.id, email: student.email, user_metadata: { name: student.student_name } });
        setRole('student');
        setStudentProfile(student);
        setAdminProfile(null);
        sessionStorage.setItem('uniflow_demo_role', 'student');
        setIsLoading(false);
        return { success: true };
      }
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err.message || 'An unexpected error occurred during sign in.' };
    }
  };

  // Student Registration
  const registerStudent = async (studentData: Partial<Student> & { password?: string }): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const email = studentData.email!.trim();
      const password = studentData.password || 'Student@123';
      const studentName = studentData.student_name || studentData.full_name || 'New Student';
      const rawYear = studentData.year || studentData.academic_year || '1st Year (B.Tech)';
      const numericYear = parseAcademicYearToInteger(rawYear) || 1;

      if (isSupabaseConfigured) {
        // Sign up with Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              student_name: studentName,
              full_name: studentName,
              enrollment_number: studentData.enrollment_number,
              department: studentData.department,
              year: numericYear,
              academic_year: studentData.academic_year || `${numericYear} Year`,
              phone: studentData.phone,
              address: studentData.address,
              role: 'student',
            },
          },
        });

        if (authError) {
          setIsLoading(false);
          return { success: false, error: authError.message };
        }

        if (authData.user) {
          // Attempt to insert record into students table
          const { error: profileError } = await supabase.from('students').insert({
            id: authData.user.id,
            enrollment_number: studentData.enrollment_number,
            student_name: studentName,
            email,
            phone: studentData.phone,
            department: studentData.department,
            year: numericYear,
            address: studentData.address,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

          if (profileError) {
            console.warn('Student table insert notice (may require email verification or backend trigger):', profileError.message);
          }
        }

        // If session was returned immediately (email confirmation disabled in Supabase)
        if (authData.session?.user) {
          setUser(authData.session.user);
          await loadProfile(authData.session.user);
        }

        setIsLoading(false);
        return { success: true };
      } else {
        const newStudent: Student = {
          id: `stu-${Date.now()}`,
          enrollment_number: studentData.enrollment_number || '2025REG101',
          student_name: studentName,
          full_name: studentName,
          email,
          phone: studentData.phone || '+91 99999 88888',
          department: studentData.department || 'Computer Science & Engineering',
          year: numericYear,
          academic_year: String(rawYear),
          address: studentData.address || 'Campus Hostels',
          created_at: new Date().toISOString(),
        };

        setUser({ id: newStudent.id, email: newStudent.email, user_metadata: { name: newStudent.student_name } });
        setRole('student');
        setStudentProfile(newStudent);
        setAdminProfile(null);
        sessionStorage.setItem('uniflow_demo_role', 'student');
        setIsLoading(false);
        return { success: true };
      }
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err.message || 'Registration failed.' };
    }
  };

  // Admin Login
  const loginAsAdmin = async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const cleanEmail = email.trim();

      if (isSupabaseConfigured) {
        if (!password) {
          setIsLoading(false);
          return { success: false, error: 'Password is required' };
        }

        // 1. Authenticate with Supabase Auth
        const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (authErr) {
          setIsLoading(false);
          return { success: false, error: authErr.message };
        }

        // 2. Query admin_users table where email = email AND is_active = true
        const { data: adminRecord, error: adminQueryErr } = await supabase
          .from('admin_users')
          .select('*')
          .eq('email', cleanEmail)
          .eq('is_active', true)
          .maybeSingle();

        if (adminQueryErr || !adminRecord) {
          // Immediately sign out since account is not in admin_users or is_active != true
          await supabase.auth.signOut();
          setUser(null);
          setRole(null);
          setIsLoading(false);
          return {
            success: false,
            error:
              'Access Denied: Your account is not registered as an active administrator in the admin_users table (or is_active is false).',
          };
        }

        const mappedAdmin: AdminUser = {
          id: adminRecord.id,
          email: adminRecord.email,
          full_name: adminRecord.full_name || 'Hostel Administrator',
          name: adminRecord.full_name || 'Hostel Administrator',
          role: adminRecord.role || 'admin',
          is_active: adminRecord.is_active,
          department: adminRecord.department || 'Hostel Administration Office',
          created_at: adminRecord.created_at,
          updated_at: adminRecord.updated_at,
        };

        setUser(authData.user);
        setRole('admin');
        setAdminProfile(mappedAdmin);
        setStudentProfile(null);
        setIsLoading(false);
        return { success: true };
      } else {
        const adminRecord = INITIAL_ADMIN_USERS.find(a => a.email.toLowerCase() === cleanEmail.toLowerCase());

        if (!adminRecord) {
          setIsLoading(false);
          return {
            success: false,
            error: 'Administrator email not found in university directory. (Try: admin@uniflow.edu)',
          };
        }

        if (!adminRecord.is_active) {
          setIsLoading(false);
          return {
            success: false,
            error: 'Access Denied: This administrative account is currently marked as inactive.',
          };
        }

        setUser({ id: adminRecord.id, email: adminRecord.email, user_metadata: { name: adminRecord.full_name } });
        setRole('admin');
        setAdminProfile(adminRecord);
        setStudentProfile(null);
        sessionStorage.setItem('uniflow_demo_role', 'admin');
        setIsLoading(false);
        return { success: true };
      }
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err.message || 'Admin sign in failed.' };
    }
  };

  // Sign out
  const logout = async () => {
    setIsLoading(true);
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    sessionStorage.removeItem('uniflow_demo_role');
    setUser(null);
    setRole(null);
    setStudentProfile(null);
    setAdminProfile(null);
    setIsLoading(false);
  };

  const switchDemoRole = (newRole: 'student' | 'admin') => {
    if (isSupabaseConfigured) {
      // In live Supabase mode, inform that real Supabase auth is active
      console.log('Live Supabase authentication active.');
      return;
    }
    if (newRole === 'admin') {
      const admin = INITIAL_ADMIN_USERS[0];
      setUser({ id: admin.id, email: admin.email, user_metadata: { name: admin.full_name } });
      setRole('admin');
      setAdminProfile(admin);
      setStudentProfile(null);
      sessionStorage.setItem('uniflow_demo_role', 'admin');
    } else {
      const student = INITIAL_STUDENTS[0];
      setUser({ id: student.id, email: student.email, user_metadata: { name: student.student_name } });
      setRole('student');
      setStudentProfile(student);
      setAdminProfile(null);
      sessionStorage.setItem('uniflow_demo_role', 'student');
    }
  };

  const isAdmin = role === 'admin' || role === 'warden' || role === 'chief_warden';
  const isStudent = role === 'student';

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        studentProfile,
        adminProfile,
        isAdmin,
        isStudent,
        isLoading,
        isLiveSupabase: isSupabaseConfigured,
        loginAsStudent,
        registerStudent,
        loginAsAdmin,
        logout,
        switchDemoRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
