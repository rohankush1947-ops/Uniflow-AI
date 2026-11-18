import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { applicationService } from '../../services/applicationService';
import { HostelApplicationFormData, Application } from '../../types';
import { parseAcademicYearToInteger, formatAcademicYearDisplay } from '../../lib/academicYear';
import {
  Building,
  User,
  GraduationCap,
  Mail,
  Phone,
  MapPin,
  Upload,
  FileCheck2,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  X,
  FileText,
  Calendar,
  Sparkles,
  Info,
} from 'lucide-react';

export const HostelApplicationForm: React.FC = () => {
  const { studentProfile, user } = useAuth();
  const navigate = useNavigate();

  // Pre-populate with student profile if available
  const [formData, setFormData] = useState<HostelApplicationFormData>({
    fullName: studentProfile?.full_name || user?.user_metadata?.name || '',
    enrollmentNumber: studentProfile?.enrollment_number || '',
    email: studentProfile?.email || user?.email || '',
    phone: studentProfile?.phone || '',
    department: studentProfile?.department || 'Computer Science & Engineering',
    academicYear: formatAcademicYearDisplay(studentProfile?.academic_year || studentProfile?.year || '3rd Year (B.Tech)'),
    address: studentProfile?.address || '',
    hostelPreference: 'Tagore Block - Single AC',
    applicationCycle: 'Academic Session 2025-2026 (Odd Semester)',
    documents: {
      studentIdCard: null,
      aadhaarCard: null,
      marksheet: null,
      incomeCertificate: null,
    },
  });

  const [activeStep, setActiveStep] = useState<number>(1);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedApplication, setSubmittedApplication] = useState<Application | null>(null);

  // Field change handler
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  // File upload handler with validation
  const handleFileChange = (key: keyof HostelApplicationFormData['documents'], file: File | null) => {
    if (!file) return;

    // Validate type: PDF, JPG, PNG
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setValidationErrors(prev => ({
        ...prev,
        [key]: 'Invalid file format. Only PDF, JPG, and PNG files are allowed.',
      }));
      return;
    }

    // Validate size: Max 5MB
    if (file.size > 5 * 1024 * 1024) {
      setValidationErrors(prev => ({
        ...prev,
        [key]: 'File size exceeds 5MB limit.',
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [key]: file,
      },
    }));

    if (validationErrors[key]) {
      setValidationErrors(prev => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
    }
  };

  const removeFile = (key: keyof HostelApplicationFormData['documents']) => {
    setFormData(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [key]: null,
      },
    }));
  };

  // Step validation
  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.fullName.trim()) errors.fullName = 'Full legal name is required.';
      if (!formData.enrollmentNumber.trim()) errors.enrollmentNumber = 'Enrollment number is required.';
      if (!formData.email.trim()) errors.email = 'Valid university email is required.';
      if (!formData.phone.trim()) errors.phone = 'Contact phone number is required.';
      if (!formData.address.trim()) errors.address = 'Residential permanent address is required.';
      const parsedYear = parseAcademicYearToInteger(formData.academicYear);
      if (!parsedYear) {
        errors.academicYear = 'Please select a valid academic year (1st, 2nd, 3rd, or 4th Year).';
      }
    } else if (step === 2) {
      if (!formData.hostelPreference) errors.hostelPreference = 'Please select a hostel preference.';
      if (!formData.applicationCycle) errors.applicationCycle = 'Please select an application cycle.';
    } else if (step === 3) {
      if (!formData.documents.studentIdCard) {
        errors.studentIdCard = 'Student ID card copy is mandatory.';
      }
      if (!formData.documents.aadhaarCard) {
        errors.aadhaarCard = 'Government identity card (Aadhaar/Passport) is mandatory.';
      }
      if (!formData.documents.marksheet) {
        errors.marksheet = 'Previous semester marksheet is mandatory.';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!validateStep(3)) return;

    setIsSubmitting(true);
    try {
      const studentId = studentProfile?.id || user?.id || 'stu-demo';
      const result = await applicationService.createApplication(formData, studentId);

      if (result.success && result.application) {
        setSubmittedApplication(result.application);
      } else {
        setValidationErrors({
          form: result.error || 'Submission failed. Please check your data and retry.',
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err: any) {
      setValidationErrors({
        form: err.message || 'An unexpected error occurred during application dispatch.',
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // If application was successfully created, render full confirmation view
  if (submittedApplication) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-8 sm:p-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200/80 flex items-center justify-center mx-auto mb-5 shadow-xs">
            <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
          </div>

          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider">
            Application Registered Successfully
          </span>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-3">
            Hostel Application Received!
          </h2>

          <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto">
            Your application has been registered into the UniFlow AI verification queue.
          </p>

          {/* Generated Application ID Box */}
          <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center max-w-sm mx-auto">
            <p className="text-xs text-slate-500 font-medium">Official Application Tracking ID</p>
            <p className="text-2xl font-mono font-extrabold text-blue-600 tracking-wide mt-1">
              {submittedApplication.application_id}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Save this ID for tracking and communication with the warden's office.
            </p>
          </div>

          {/* Submitted Summary details */}
          <div className="mt-6 text-left bg-slate-50/70 p-5 rounded-2xl border border-slate-100 space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-200/50">
              <span className="text-slate-500 font-medium">Applicant Name</span>
              <span className="font-bold text-slate-900">{submittedApplication.student_name}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/50">
              <span className="text-slate-500 font-medium">Enrollment No.</span>
              <span className="font-mono font-bold text-slate-900">{submittedApplication.enrollment_number}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/50">
              <span className="text-slate-500 font-medium">Hostel Preference</span>
              <span className="font-bold text-blue-700">{submittedApplication.hostel_preference}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500 font-medium">Cycle</span>
              <span className="font-medium text-slate-700">{submittedApplication.application_cycle}</span>
            </div>
          </div>

          {/* Next steps notice */}
          <div className="mt-6 p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-left text-xs text-blue-900 flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Automated Next Steps:</p>
              <p className="text-blue-800 mt-0.5 leading-relaxed">
                The intake automation agent will verify your uploaded documents. Wardens will review distance scores and academic records for final room allocation.
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate('/student/applications')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors shadow-sm text-sm flex items-center justify-center gap-2"
            >
              <span>View in My Applications</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/student/dashboard')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-colors text-sm"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Apply for Hostel Accommodation
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Complete the 3-section digital application to request on-campus dormitory allocation.
        </p>
      </div>

      {/* Stepper Wizard Indicator */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="grid grid-cols-3 gap-2">
          <div
            className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
              activeStep === 1
                ? 'bg-blue-50 text-blue-800 border border-blue-200'
                : activeStep > 1
                ? 'bg-emerald-50 text-emerald-800'
                : 'text-slate-400'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                activeStep === 1
                  ? 'bg-blue-600 text-white'
                  : activeStep > 1
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {activeStep > 1 ? <CheckCircle2 className="w-4 h-4" /> : '1'}
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-bold leading-tight">Personal Details</p>
              <p className="text-[10px] opacity-75">Student credentials</p>
            </div>
          </div>

          <div
            className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
              activeStep === 2
                ? 'bg-blue-50 text-blue-800 border border-blue-200'
                : activeStep > 2
                ? 'bg-emerald-50 text-emerald-800'
                : 'text-slate-400'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                activeStep === 2
                  ? 'bg-blue-600 text-white'
                  : activeStep > 2
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {activeStep > 2 ? <CheckCircle2 className="w-4 h-4" /> : '2'}
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-bold leading-tight">Hostel Details</p>
              <p className="text-[10px] opacity-75">Hall & cycle selection</p>
            </div>
          </div>

          <div
            className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
              activeStep === 3
                ? 'bg-blue-50 text-blue-800 border border-blue-200'
                : 'text-slate-400'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                activeStep === 3 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
              }`}
            >
              3
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-bold leading-tight">Documents</p>
              <p className="text-[10px] opacity-75">Scans & verification</p>
            </div>
          </div>
        </div>
      </div>

      {validationErrors.form && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{validationErrors.form}</span>
        </div>
      )}

      {/* Form Content */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 sm:p-8">
        {/* SECTION 1: Personal Details */}
        {activeStep === 1 && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                <span>Section 1: Student Personal Details</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Enter your registered university profile details. Mandatory fields are marked with <span className="text-rose-500 font-bold">*</span>.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Legal Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="e.g. Aarav Sharma"
                  className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-slate-50/50 focus:bg-white focus:ring-2 outline-hidden transition-all ${
                    validationErrors.fullName ? 'border-rose-400 focus:ring-rose-500' : 'border-slate-200 focus:ring-blue-600'
                  }`}
                />
                {validationErrors.fullName && (
                  <p className="text-[11px] text-rose-600 mt-1">{validationErrors.fullName}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Enrollment / Roll No. <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="enrollmentNumber"
                  value={formData.enrollmentNumber}
                  onChange={handleInputChange}
                  placeholder="e.g. 2024CSB1042"
                  className={`w-full px-3.5 py-2.5 text-sm uppercase rounded-xl border bg-slate-50/50 focus:bg-white focus:ring-2 outline-hidden transition-all ${
                    validationErrors.enrollmentNumber ? 'border-rose-400 focus:ring-rose-500' : 'border-slate-200 focus:ring-blue-600'
                  }`}
                />
                {validationErrors.enrollmentNumber && (
                  <p className="text-[11px] text-rose-600 mt-1">{validationErrors.enrollmentNumber}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  University Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="student@uniflow.edu"
                  className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-slate-50/50 focus:bg-white focus:ring-2 outline-hidden transition-all ${
                    validationErrors.email ? 'border-rose-400 focus:ring-rose-500' : 'border-slate-200 focus:ring-blue-600'
                  }`}
                />
                {validationErrors.email && (
                  <p className="text-[11px] text-rose-600 mt-1">{validationErrors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Phone Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+91 98765 43210"
                  className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-slate-50/50 focus:bg-white focus:ring-2 outline-hidden transition-all ${
                    validationErrors.phone ? 'border-rose-400 focus:ring-rose-500' : 'border-slate-200 focus:ring-blue-600'
                  }`}
                />
                {validationErrors.phone && (
                  <p className="text-[11px] text-rose-600 mt-1">{validationErrors.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Department
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-hidden transition-all"
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
                  Academic Year <span className="text-rose-500">*</span>
                </label>
                <select
                  name="academicYear"
                  value={formData.academicYear}
                  onChange={handleInputChange}
                  className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-slate-50/50 focus:bg-white focus:ring-2 outline-hidden transition-all ${
                    validationErrors.academicYear ? 'border-rose-400 focus:ring-rose-500' : 'border-slate-200 focus:ring-blue-600'
                  }`}
                >
                  <option value="1st Year (B.Tech)">1st Year (B.Tech)</option>
                  <option value="2nd Year (B.Tech)">2nd Year (B.Tech)</option>
                  <option value="3rd Year (B.Tech)">3rd Year (B.Tech)</option>
                  <option value="4th Year (B.Tech)">4th Year (B.Tech)</option>
                  <option value="1st Year (M.Tech/MCA)">1st Year (M.Tech/MCA)</option>
                  <option value="2nd Year (M.Tech/MCA)">2nd Year (M.Tech/MCA)</option>
                  <option value="Research Scholar (Ph.D.)">Research Scholar (Ph.D.)</option>
                </select>
                {validationErrors.academicYear && (
                  <p className="text-[11px] text-rose-600 mt-1">{validationErrors.academicYear}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Permanent Residential Address <span className="text-rose-500">*</span>
              </label>
              <textarea
                name="address"
                rows={3}
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Enter complete address with PIN code. Used by hostel algorithms to evaluate outstation priority (>100km criteria)."
                className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-slate-50/50 focus:bg-white focus:ring-2 outline-hidden transition-all ${
                  validationErrors.address ? 'border-rose-400 focus:ring-rose-500' : 'border-slate-200 focus:ring-blue-600'
                }`}
              />
              {validationErrors.address && (
                <p className="text-[11px] text-rose-600 mt-1">{validationErrors.address}</p>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 flex items-center gap-2 shadow-sm"
              >
                <span>Continue to Hostel Details</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* SECTION 2: Hostel Details */}
        {activeStep === 2 && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Building className="w-5 h-5 text-blue-600" />
                <span>Section 2: Hostel Details & Preferences</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Select your preferred dormitory block, room air-conditioning specification, and application cycle.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Hostel Preference <span className="text-rose-500">*</span>
                </label>
                <select
                  name="hostelPreference"
                  value={formData.hostelPreference}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-hidden transition-all"
                >
                  <option value="Tagore Block - Single AC">Tagore Block — Single Occupancy (Air Conditioned)</option>
                  <option value="Kalpana Chawla Hall - Double Non-AC">Kalpana Chawla Hall — Double Occupancy (Non-AC)</option>
                  <option value="Bhabha Hostel - Triple Non-AC">Bhabha Hostel — Triple Occupancy (Economical Non-AC)</option>
                  <option value="Ramanujan Post-Graduate Hostel - Single AC">Ramanujan PG Block — Single Occupancy (AC, Scholars only)</option>
                  <option value="Sarojini Naidu Wing - Double AC">Sarojini Naidu Wing — Double Occupancy (Air Conditioned)</option>
                </select>
                <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Room allocation is subject to availability, distance score, and academic seniority.</span>
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Application Cycle <span className="text-rose-500">*</span>
                </label>
                <select
                  name="applicationCycle"
                  value={formData.applicationCycle}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-hidden transition-all"
                >
                  <option value="Academic Session 2025-2026 (Odd Semester)">Academic Session 2025-2026 (Odd Semester)</option>
                  <option value="Academic Session 2025-2026 (Even Semester)">Academic Session 2025-2026 (Even Semester)</option>
                  <option value="Summer Term Hostel (June-July 2025)">Summer Term Hostel (June-July 2025)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-slate-100">
              <button
                type="button"
                onClick={handleBack}
                className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-200 flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 flex items-center gap-2 shadow-sm"
              >
                <span>Continue to Documents</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* SECTION 3: Documents Upload */}
        {activeStep === 3 && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-blue-600" />
                <span>Section 3: Verification Documents</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Upload clear scans or photographs of required documents. Supported formats: <strong>PDF, JPG, PNG</strong> (Max 5MB each).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Document 1: Student ID Card */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <label className="text-xs font-bold text-slate-800">
                      1. Student ID Card <span className="text-rose-500">*</span>
                    </label>
                    <p className="text-[11px] text-slate-500">Current semester university identity card</p>
                  </div>
                </div>

                {formData.documents.studentIdCard ? (
                  <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="text-xs font-semibold text-emerald-900 truncate">
                        {formData.documents.studentIdCard.name}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile('studentIdCard')}
                      className="p-1 text-slate-400 hover:text-rose-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="mt-2 border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors bg-white">
                    <Upload className="w-6 h-6 text-slate-400 mb-1" />
                    <span className="text-xs font-semibold text-blue-600">Choose File</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">PDF, PNG, JPG up to 5MB</span>
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      className="hidden"
                      onChange={e => handleFileChange('studentIdCard', e.target.files?.[0] || null)}
                    />
                  </label>
                )}
                {validationErrors.studentIdCard && (
                  <p className="text-[11px] text-rose-600 mt-1">{validationErrors.studentIdCard}</p>
                )}
              </div>

              {/* Document 2: Aadhaar Card */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <label className="text-xs font-bold text-slate-800">
                      2. Aadhaar / Govt ID <span className="text-rose-500">*</span>
                    </label>
                    <p className="text-[11px] text-slate-500">For permanent address verification</p>
                  </div>
                </div>

                {formData.documents.aadhaarCard ? (
                  <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="text-xs font-semibold text-emerald-900 truncate">
                        {formData.documents.aadhaarCard.name}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile('aadhaarCard')}
                      className="p-1 text-slate-400 hover:text-rose-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="mt-2 border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors bg-white">
                    <Upload className="w-6 h-6 text-slate-400 mb-1" />
                    <span className="text-xs font-semibold text-blue-600">Choose File</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">PDF, PNG, JPG up to 5MB</span>
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      className="hidden"
                      onChange={e => handleFileChange('aadhaarCard', e.target.files?.[0] || null)}
                    />
                  </label>
                )}
                {validationErrors.aadhaarCard && (
                  <p className="text-[11px] text-rose-600 mt-1">{validationErrors.aadhaarCard}</p>
                )}
              </div>

              {/* Document 3: Previous Semester Marksheet */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <label className="text-xs font-bold text-slate-800">
                      3. Previous Semester Marksheet <span className="text-rose-500">*</span>
                    </label>
                    <p className="text-[11px] text-slate-500">Grade sheet with CGPA / SGPA visible</p>
                  </div>
                </div>

                {formData.documents.marksheet ? (
                  <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="text-xs font-semibold text-emerald-900 truncate">
                        {formData.documents.marksheet.name}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile('marksheet')}
                      className="p-1 text-slate-400 hover:text-rose-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="mt-2 border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors bg-white">
                    <Upload className="w-6 h-6 text-slate-400 mb-1" />
                    <span className="text-xs font-semibold text-blue-600">Choose File</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">PDF, PNG, JPG up to 5MB</span>
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      className="hidden"
                      onChange={e => handleFileChange('marksheet', e.target.files?.[0] || null)}
                    />
                  </label>
                )}
                {validationErrors.marksheet && (
                  <p className="text-[11px] text-rose-600 mt-1">{validationErrors.marksheet}</p>
                )}
              </div>

              {/* Document 4: Income Certificate (Optional / applicable) */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <label className="text-xs font-bold text-slate-800">
                      4. Income Certificate <span className="text-slate-400 font-normal">(If applicable)</span>
                    </label>
                    <p className="text-[11px] text-slate-500">For subsidized fee concessions</p>
                  </div>
                </div>

                {formData.documents.incomeCertificate ? (
                  <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="text-xs font-semibold text-emerald-900 truncate">
                        {formData.documents.incomeCertificate.name}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile('incomeCertificate')}
                      className="p-1 text-slate-400 hover:text-rose-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="mt-2 border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors bg-white">
                    <Upload className="w-6 h-6 text-slate-400 mb-1" />
                    <span className="text-xs font-semibold text-blue-600">Choose File</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">PDF, PNG, JPG up to 5MB</span>
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      className="hidden"
                      onChange={e => handleFileChange('incomeCertificate', e.target.files?.[0] || null)}
                    />
                  </label>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-slate-100">
              <button
                type="button"
                onClick={handleBack}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-200 flex items-center gap-2 disabled:opacity-50"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 flex items-center gap-2 shadow-md shadow-blue-600/25 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Uploading Documents & Registering...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Official Application</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
