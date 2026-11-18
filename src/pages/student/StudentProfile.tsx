import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { User, GraduationCap, Mail, Phone, MapPin, Building, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const StudentProfile: React.FC = () => {
  const { studentProfile, user } = useAuth();

  const name = studentProfile?.full_name || user?.user_metadata?.name || 'Aarav Sharma';
  const enrollment = studentProfile?.enrollment_number || '2024CSB1042';
  const email = studentProfile?.email || user?.email || 'student@uniflow.edu';
  const phone = studentProfile?.phone || '+91 98765 43210';
  const department = studentProfile?.department || 'Computer Science & Engineering';
  const year = studentProfile?.academic_year || '3rd Year (B.Tech)';
  const address = studentProfile?.address || 'Flat 402, Green Valley Heights, Sector 62, Noida, UP - 201309';

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Student Profile
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Registered academic identity and residential records.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Banner */}
        <div className="h-32 bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-600 p-6 flex items-end">
          <div className="flex items-center gap-4 translate-y-8">
            <div className="w-20 h-20 rounded-2xl bg-white p-1 shadow-lg">
              <div className="w-full h-full rounded-xl bg-blue-600 text-white flex items-center justify-center font-extrabold text-2xl">
                {name.charAt(0)}
              </div>
            </div>
            <div className="text-white pt-6">
              <h2 className="text-xl font-bold leading-tight">{name}</h2>
              <p className="text-xs text-blue-100 font-mono">{enrollment}</p>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="pt-12 p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Academic Department
              </span>
              <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-blue-600" />
                <span>{department}</span>
              </p>
              <p className="text-xs text-slate-500 mt-0.5">{year}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Contact Credentials
              </span>
              <p className="text-xs font-semibold text-slate-800 flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{email}</span>
              </p>
              <p className="text-xs font-semibold text-slate-800 flex items-center gap-2 mt-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{phone}</span>
              </p>
            </div>
          </div>

          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Permanent Domicile & Residential Address
            </span>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 flex items-start gap-3">
              <MapPin className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-slate-800 font-medium leading-relaxed">{address}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Distance Criteria Met (&gt;150 km from campus)</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200/70 text-xs text-blue-900 flex items-start gap-3">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Verified University Record</p>
              <p className="text-blue-800 mt-0.5">
                Profile is verified against the university central academic ledger. Any change in residential address requires submitting an updated government identity proof to the registrar office.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
