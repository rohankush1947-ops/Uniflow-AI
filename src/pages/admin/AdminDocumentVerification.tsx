import React, { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { applicationService } from '../../services/applicationService';
import { ApplicationDocument } from '../../types';
import { ShieldCheck, FileText, CheckCircle2, AlertCircle, ExternalLink, Search } from 'lucide-react';

interface VerifiedDocItem {
  id: string;
  studentName: string;
  enrollment: string;
  appId: string;
  docType: string;
  fileName: string;
  fileUrl: string;
  status: 'Verified' | 'Flagged' | 'Pending';
  notes: string;
}

export const AdminDocumentVerification: React.FC = () => {
  const [documents, setDocuments] = useState<VerifiedDocItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchDocs() {
      setLoading(true);
      if (isSupabaseConfigured) {
        try {
          const apps = await applicationService.getAllApplications();
          const { data: docRows, error } = await supabase.from('application_documents').select('*');

          if (!error && docRows && docRows.length > 0) {
            const mapped: VerifiedDocItem[] = docRows.map((doc: any) => {
              const matchedApp = apps.find(a => a.id === doc.application_id || a.application_id === doc.application_id);
              return {
                id: doc.id,
                studentName: matchedApp?.student_name || 'Student Applicant',
                enrollment: matchedApp?.enrollment_number || 'N/A',
                appId: matchedApp?.application_id || doc.application_id,
                docType: doc.document_type?.replace(/_/g, ' ').toUpperCase(),
                fileName: doc.file_name,
                fileUrl: doc.document_url,
                status: matchedApp?.documents_accessible ? 'Verified' : 'Pending',
                notes: matchedApp?.document_validation_notes || 'Uploaded via student application portal.',
              };
            });
            setDocuments(mapped);
          } else {
            setDocuments([]);
          }
        } catch (err) {
          console.error('Error fetching verification documents:', err);
          setDocuments([]);
        }
      } else {
        // Offline demo documents
        setDocuments([
          {
            id: 'doc-v-1',
            studentName: 'Aarav Sharma',
            enrollment: '2024CSB1042',
            appId: 'HOSTEL-2025-91823',
            docType: 'Aadhaar Card',
            fileName: 'Aadhaar_Card_2024.jpg',
            fileUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe',
            status: 'Verified',
            notes: 'Matches registered address (>150km criteria met).',
          },
          {
            id: 'doc-v-2',
            studentName: 'Priya Iyer',
            enrollment: '2024ECB2019',
            appId: 'HOSTEL-2025-44219',
            docType: 'Semester 3 Grade Sheet',
            fileName: 'Marksheet_Sem3.pdf',
            fileUrl: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167',
            status: 'Verified',
            notes: 'CGPA 9.12 verified against academic ledger.',
          },
        ]);
      }
      setLoading(false);
    }
    fetchDocs();
  }, []);

  const filtered = documents.filter(
    d =>
      d.studentName.toLowerCase().includes(search.toLowerCase()) ||
      d.enrollment.toLowerCase().includes(search.toLowerCase()) ||
      d.appId.toLowerCase().includes(search.toLowerCase())
  );

  const markVerified = (id: string) => {
    setDocuments(prev =>
      prev.map(d => (d.id === id ? { ...d, status: 'Verified', notes: 'Manually verified by Warden.' } : d))
    );
  };

  const markFlagged = (id: string) => {
    setDocuments(prev =>
      prev.map(d => (d.id === id ? { ...d, status: 'Flagged', notes: 'Flagged for supplementary upload.' } : d))
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Document Verification Workbench
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Inspect student credentials, OCR parsing status, and verification notes.
        </p>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search candidate or roll..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-hidden"
          />
        </div>
        <div className="text-xs text-slate-500">
          Showing <strong>{filtered.length}</strong> credential records
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500">
          <span className="w-6 h-6 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin inline-block mb-3" />
          <p>Querying Supabase application documents...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200/80 shadow-2xs text-center max-w-lg mx-auto">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">No documents in queue</h3>
          <p className="text-xs text-slate-500 mt-1">
            When students submit applications with credentials, they will be listed here for warden inspection.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map(doc => (
            <div
              key={doc.id}
              className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      {doc.appId}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-1.5">{doc.studentName}</h3>
                    <p className="text-xs text-slate-500 font-mono">Roll: {doc.enrollment}</p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                      doc.status === 'Verified'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : doc.status === 'Flagged'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    {doc.status}
                  </span>
                </div>

                <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Document Credential:</span>
                    <span className="font-bold text-slate-800">{doc.docType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">File Name:</span>
                    <span className="font-mono text-slate-700 truncate max-w-xs">{doc.fileName}</span>
                  </div>
                  <div className="pt-1 border-t border-slate-200/50">
                    <span className="text-slate-500 block text-[11px]">Audit / Validation Notes:</span>
                    <p className="text-slate-700 mt-0.5 text-[11px] leading-relaxed">{doc.notes}</p>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <a
                  href={doc.fileUrl || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <span>Inspect Scan</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => markVerified(doc.id)}
                    className="px-3 py-1 rounded-lg text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                  >
                    Pass
                  </button>
                  <button
                    onClick={() => markFlagged(doc.id)}
                    className="px-3 py-1 rounded-lg text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors"
                  >
                    Flag
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
