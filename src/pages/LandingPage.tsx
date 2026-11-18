import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { BannerAlert } from '../components/common/BannerAlert';
import { Logo } from '../components/common/Logo';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building,
  CheckCircle2,
  Clock,
  FileCheck,
  Zap,
  Users,
  Award,
  ChevronRight,
  Send,
  HelpCircle,
  FileText,
  BadgeCheck,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-blue-600 selection:text-white">
      <BannerAlert />
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden bg-gradient-to-b from-white via-blue-50/30 to-slate-50 border-b border-slate-200/60">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-blue-300/20 to-cyan-300/20 blur-3xl pointer-events-none rounded-full" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            {/* Tag / Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-semibold shadow-2xs mb-6">
              <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
              <span>Next-Gen University ERP & Workflow Automation</span>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
              <span className="text-blue-900 font-bold">v1.0 Live</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-6">
              Transforming University Administration with{' '}
              <span className="bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
                AI
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-slate-600 font-normal leading-relaxed mb-10 max-w-2xl mx-auto">
              Automate repetitive university administrative processes and eliminate paperwork, manual verification,
              bureaucratic delays, and communication gaps between students, departments, and administration.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/student/register"
                className="w-full sm:w-auto px-7 py-3.5 text-base font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2.5 hover:translate-y-[-1px]"
              >
                <span>Get Started as Student</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#how-it-works"
                className="w-full sm:w-auto px-7 py-3.5 text-base font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs transition-all flex items-center justify-center gap-2"
              >
                <span>Explore Platform</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </a>
            </div>

            {/* Metric pill indicators */}
            <div className="mt-12 pt-8 border-t border-slate-200/60 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <div className="p-3 bg-white/80 rounded-xl border border-slate-200/60 shadow-2xs text-center">
                <p className="text-2xl font-extrabold text-blue-600">90%</p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Faster Processing Time</p>
              </div>
              <div className="p-3 bg-white/80 rounded-xl border border-slate-200/60 shadow-2xs text-center">
                <p className="text-2xl font-extrabold text-cyan-600">100%</p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Paperless Digital Intake</p>
              </div>
              <div className="p-3 bg-white/80 rounded-xl border border-slate-200/60 shadow-2xs text-center">
                <p className="text-2xl font-extrabold text-indigo-600">24 / 7</p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Real-time Status Tracking</p>
              </div>
              <div className="p-3 bg-white/80 rounded-xl border border-slate-200/60 shadow-2xs text-center">
                <p className="text-2xl font-extrabold text-emerald-600">0%</p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Lost Applications</p>
              </div>
            </div>
          </div>

          {/* Interactive Live Preview Card */}
          <div className="mt-14 max-w-4xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
            <div className="bg-slate-900 px-5 py-3.5 flex items-center justify-between text-white border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                </div>
                <span className="text-xs font-mono text-slate-400 ml-2">uniflow://hostel-admissions/live-pipeline</span>
              </div>
              <span className="text-xs text-cyan-400 font-mono font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                Live Automated Engine
              </span>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                      HOSTEL-2025-91823
                    </span>
                    <StatusBadge status="Under Department Review" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mt-2">
                    Aarav Sharma — Computer Science & Engineering (3rd Year)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Preference: Tagore Block - Single AC | Academic Session 2025-2026
                  </p>
                </div>
                <Link
                  to="/student/login"
                  className="px-4 py-2 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors self-start sm:self-auto flex items-center gap-1.5"
                >
                  <span>Simulate Workflow</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Progress Stepper Visual */}
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                  Autonomous Multi-Stage Pipeline Progress
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-emerald-800">1. Intake</span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                    <p className="text-xs text-emerald-900 font-medium mt-1">Form Submitted</p>
                    <p className="text-[10px] text-emerald-700">All fields verified</p>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-emerald-800">2. AI Validation</span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                    <p className="text-xs text-emerald-900 font-medium mt-1">Docs Verified</p>
                    <p className="text-[10px] text-emerald-700">Aadhaar, CGPA match</p>
                  </div>

                  <div className="p-3 rounded-xl bg-blue-50/90 border border-blue-300 ring-2 ring-blue-500/20">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-blue-800">3. Dept Review</span>
                      <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                    </div>
                    <p className="text-xs text-blue-900 font-medium mt-1">Warden Inspection</p>
                    <p className="text-[10px] text-blue-700">Room availability check</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 opacity-60">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-500">4. Allocation</span>
                      <Clock className="w-4 h-4 text-slate-400" />
                    </div>
                    <p className="text-xs text-slate-700 font-medium mt-1">Final Approval</p>
                    <p className="text-[10px] text-slate-500">Key issuance letter</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Working Module Section */}
      <section id="modules" className="py-20 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider">
              Working Module
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-3">
              Hostel Application Automation
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-2">
              The flagship live operational module powering complete digital intake, document verification,
              and administrative approvals for university dormitories.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-blue-300 transition-all hover:shadow-md">
              <div className="w-12 h-12 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center mb-5">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">1. Paperless Digital Submission</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Students submit academic details, room category preferences, and secure digital scans of student ID,
                government identity, and academic grade sheets in minutes.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-cyan-300 transition-all hover:shadow-md">
              <div className="w-12 h-12 rounded-xl bg-cyan-600/10 text-cyan-600 flex items-center justify-center mb-5">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">2. Automated Intake & Inspection</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Automated document parsing validates enrollment records, verifies residency distance criteria, and
                flags incomplete uploads before administrative dispatch.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-blue-300 transition-all hover:shadow-md">
              <div className="w-12 h-12 rounded-xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center mb-5">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">3. Role-Based Warden Decisions</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Wardens and chief administrators approve allocations with one click, request supplementary documents, or
                reject with formal reasons with automated email dispatch.
              </p>
            </div>
          </div>

          {/* Future Modules Roadmap banner */}
          <div className="mt-16 p-8 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div>
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Future Expansion</span>
                <h3 className="text-xl font-bold mt-1">Upcoming Enterprise Workflow Modules</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xl">
                  UniFlow AI's modular architecture is designed to expand across the complete university lifecycle.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {[
                  'Scholarship Applications',
                  'Bonafide Certificates',
                  'Fee Refunds',
                  'No Dues Certificates',
                  'Leave Applications',
                  'Student Grievances',
                ].map(module => (
                  <span
                    key={module}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700/80 flex items-center gap-1.5"
                  >
                    <Clock className="w-3 h-3 text-cyan-400" />
                    <span>{module}</span>
                    <span className="text-[10px] text-slate-500 font-mono">Planned</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-slate-50 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider">
              Core Capabilities
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-3">
              Engineered for Academic Excellence
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-2">
              Every feature is built around university security, compliance, auditability, and speed.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <FileCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Automated Document Validation</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Accepts multi-format credentials (PDF, JPG, PNG) with format verification and document accessibility checks.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center mb-4">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Make.com Automation Ready</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Clean webhooks dispatch application events instantly into Make.com scenarios for zero-lag background tasks.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Protected Admin RBAC</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Strict administrative validation directly checks the active admin register. Zero service-role keys exposed.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Immutable Workflow History</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Every stage, state transition, and admin action is recorded in an audit trail with actor timestamps.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Document Request Workflows</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Request specific missing or clearer documents without rejecting eligible students outright.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Department Isolation</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Students access exclusively their own records under strict Supabase Row Level Security (RLS).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider">
              Step-by-Step
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-3">
              How the Automated Workflow Works
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-2">
              From online student submission to room key collection — completely automated.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 relative">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 relative">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-extrabold text-sm flex items-center justify-center mb-4">
                1
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">Student Applies</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Student fills personal and hostel preferences, attaches verified documents, and gets a unique tracking ID.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 relative">
              <div className="w-8 h-8 rounded-full bg-cyan-600 text-white font-extrabold text-sm flex items-center justify-center mb-4">
                2
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">Intake Automation</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Make.com triggers upon storage insertion, validating enrollment integrity and document accessibility.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 relative">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-extrabold text-sm flex items-center justify-center mb-4">
                3
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">Admin Review</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Hostel wardens inspect applications via protected administrative dashboards with live document viewers.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 relative">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-extrabold text-sm flex items-center justify-center mb-4">
                4
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">Instant Decision</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Approved applications immediately record room allocation and notify student with clearance slips.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 bg-slate-50 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider">
              Measurable Impact
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-3">
              Benefits for Every Stakeholder
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-2">
              Replacing queues and physical paperwork with clarity and automation.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">For Students</h3>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>No standing in long administrative queue lines.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Live tracking with clear timeline stages.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Prompt notifications if documents need re-uploading.</span>
                </li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center mb-4">
                <Building className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">For Wardens & Staff</h3>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Eliminates physical binder management and lost files.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>One-click document verification and accessibility check.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Structured mandatory reason logging for rejections.</span>
                </li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">For University Leadership</h3>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Real-time hostel occupancy and demand analytics.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>100% audit-compliant decision records and timestamps.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Scalable to thousands of applicants without server overhead.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="py-16 bg-gradient-to-tr from-blue-700 via-blue-600 to-cyan-600 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
            Experience the Future of Campus Administration
          </h2>
          <p className="text-base sm:text-lg text-blue-100 max-w-2xl mx-auto mb-8">
            Join students and administrators currently using UniFlow AI for hostel accommodation processing.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/student/register"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white text-blue-700 font-bold hover:bg-blue-50 shadow-lg shadow-black/10 transition-all"
            >
              Apply for Hostel Now
            </Link>
            <Link
              to="/admin/login"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-blue-800/60 hover:bg-blue-800 text-white font-semibold border border-white/20 transition-all flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin Access</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="mb-4">
                <Logo size="md" showTagline />
              </div>
              <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                UniFlow AI is an AI-powered University Management and Workflow Automation Platform.
                Eliminating paperwork, manual verification, and administrative delays across campus life.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">Portals</h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link to="/student/login" className="hover:text-cyan-400 transition-colors">
                    Student Login
                  </Link>
                </li>
                <li>
                  <Link to="/student/register" className="hover:text-cyan-400 transition-colors">
                    Student Registration
                  </Link>
                </li>
                <li>
                  <Link to="/admin/login" className="hover:text-cyan-400 transition-colors">
                    Warden & Admin Portal
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">Live Modules</h4>
              <ul className="space-y-2 text-xs">
                <li className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  <span>Hostel Allocation (v1.0)</span>
                </li>
                <li className="text-slate-500">Scholarship Automation (Upcoming)</li>
                <li className="text-slate-500">Bonafide Certificate Service</li>
                <li className="text-slate-500">No Dues Clearances</li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <p>&copy; {new Date().getFullYear()} UniFlow AI. Smart University. Seamless Administration. All rights reserved.</p>
            <div className="flex gap-6">
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
              <span>Security Governance</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
