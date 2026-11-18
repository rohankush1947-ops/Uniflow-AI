import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Logo } from '../../components/common/Logo';
import { BannerAlert } from '../../components/common/BannerAlert';
import { parseAcademicYearToInteger } from '../../lib/academicYear';
import { ArrowRight, Lock, Mail, AlertCircle, User, Phone, BookOpen, GraduationCap, MapPin } from 'lucide-react';

export const StudentRegister: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    enrollmentNumber: '',
    email: '',
    phone: '',
    department: 'Computer Science & Engineering',
    academicYear: '1st Year (B.Tech)',
    address: '',
    password: '',
    confirmPassword: '',
  });

  const [errorMessage, setErrorMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { registerStudent } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.fullName || !formData.enrollmentNumber || !formData.email || !formData.phone) {
      setErrorMessage('Please fill in all mandatory personal details.');
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    const parsedYear = parseAcademicYearToInteger(formData.academicYear) || 1;
    const result = await registerStudent({
      full_name: formData.fullName,
      enrollment_number: formData.enrollmentNumber.toUpperCase(),
      email: formData.email,
      phone: formData.phone,
      department: formData.department,
      academic_year: formData.academicYear,
      year: parsedYear,
      address: formData.address,
      password: formData.password,
    });
    setSubmitting(false);

    if (result.success) {
      navigate('/student/dashboard');
    } else {
      setErrorMessage(result.error || 'Failed to register account.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <BannerAlert />

      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center">
          <div className="inline-block mb-3">
            <Logo size="lg" showTagline />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Student Registration Portal
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Register your university credentials for hostel allocations and academic services
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
          <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 rounded-2xl border border-slate-100 sm:px-10">
            {errorMessage && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form className="space-y-4" onSubmit={handleRegister}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Full Legal Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative rounded-xl shadow-2xs">
                    <div className="pointer-events-none absolute inset-y-0 left-0 pl-3.5 flex items-center">
                      <User className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                      placeholder="e.g. Aarav Sharma"
                      className="block w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-hidden transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Enrollment / Roll No. <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative rounded-xl shadow-2xs">
                    <div className="pointer-events-none absolute inset-y-0 left-0 pl-3.5 flex items-center">
                      <GraduationCap className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      name="enrollmentNumber"
                      value={formData.enrollmentNumber}
                      onChange={handleChange}
                      required
                      placeholder="e.g. 2024CSB1042"
                      className="block w-full pl-10 pr-3 py-2.5 text-sm uppercase bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-hidden transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    University Email <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative rounded-xl shadow-2xs">
                    <div className="pointer-events-none absolute inset-y-0 left-0 pl-3.5 flex items-center">
                      <Mail className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="aarav.s@uniflow.edu"
                      className="block w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-hidden transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Mobile Phone <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative rounded-xl shadow-2xs">
                    <div className="pointer-events-none absolute inset-y-0 left-0 pl-3.5 flex items-center">
                      <Phone className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      placeholder="+91 98765 43210"
                      className="block w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-hidden transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Department
                  </label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="block w-full px-3.5 py-2.5 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-hidden transition-all"
                  >
                    <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                    <option value="Electronics & Communication">Electronics & Communication</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Civil Engineering">Civil Engineering</option>
                    <option value="Electrical Engineering">Electrical Engineering</option>
                    <option value="Biotechnology">Biotechnology</option>
                    <option value="Management Studies">Management Studies</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Academic Year
                  </label>
                  <select
                    name="academicYear"
                    value={formData.academicYear}
                    onChange={handleChange}
                    className="block w-full px-3.5 py-2.5 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-hidden transition-all"
                  >
                    <option value="1st Year (B.Tech)">1st Year (B.Tech)</option>
                    <option value="2nd Year (B.Tech)">2nd Year (B.Tech)</option>
                    <option value="3rd Year (B.Tech)">3rd Year (B.Tech)</option>
                    <option value="4th Year (B.Tech)">4th Year (B.Tech)</option>
                    <option value="1st Year (M.Tech/MCA)">1st Year (M.Tech/MCA)</option>
                    <option value="2nd Year (M.Tech/MCA)">2nd Year (M.Tech/MCA)</option>
                    <option value="Research Scholar (Ph.D.)">Research Scholar (Ph.D.)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Permanent Residential Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative rounded-xl shadow-2xs">
                  <div className="pointer-events-none absolute top-3 left-3.5 flex items-center">
                    <MapPin className="h-4 w-4 text-slate-400" />
                  </div>
                  <textarea
                    name="address"
                    rows={2}
                    value={formData.address}
                    onChange={handleChange}
                    required
                    placeholder="Enter complete permanent residential address (Used for distance calculation)"
                    className="block w-full pl-10 pr-3 py-2 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-hidden transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative rounded-xl shadow-2xs">
                    <div className="pointer-events-none absolute inset-y-0 left-0 pl-3.5 flex items-center">
                      <Lock className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      placeholder="Min. 6 characters"
                      className="block w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-hidden transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Confirm Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative rounded-xl shadow-2xs">
                    <div className="pointer-events-none absolute inset-y-0 left-0 pl-3.5 flex items-center">
                      <Lock className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      placeholder="Re-enter password"
                      className="block w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-hidden transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-md shadow-blue-600/20 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-50"
                >
                  {submitting ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Complete Registration & Proceed</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-500">
                Already registered?{' '}
                <Link to="/student/login" className="font-bold text-blue-600 hover:underline">
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
