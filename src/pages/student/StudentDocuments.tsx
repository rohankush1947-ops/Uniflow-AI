import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { applicationService } from '../../services/applicationService';
import { ApplicationDocument } from '../../types';
import { FileText, CheckCircle2, ExternalLink, Plus, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export const StudentDocuments: React.FC = () => {
  const { studentProfile, user } = useAuth();
  const [documents, setDocuments] = useState<ApplicationDocument[]>([]);
  const [loading, setLoading] = useState(true);

  const studentEmail = studentProfile?.email || user?.email || '';

  useEffect(() => {
    async function loadDocs() {
      setLoading(true);
      if (isSupabaseConfigured) {
        try {
          // Fetch student applications to get their application IDs
          const apps = await applicationService.getStudentApplications(studentEmail, studentProfile?.id);
          const appIds = apps.map(a => a.id);

          if (appIds.length > 0) {
            const { data, error } = await supabase
              .from('application_documents')
              .select('*')
              .in('application_id', appIds);

            if (!error && data) {
              setDocuments(data);
            } else {
              setDocuments([]);
            }
          } else {
            setDocuments([]);
          }
        } catch (err) {
          console.warn('Error loading student documents:', err);
          setDocuments([]);
        }
      } else {
        // Offline demo documents
        setDocuments([
          {
            id: 'doc-1',
            application_id: 'HOSTEL-2025-91823',
            document_type: 'student_id_card',
            file_name: 'Student_ID_2024CSB1042.pdf',
            document_url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=800',
            uploaded_at: new Date(Date.now() - 3 * 86400000).toISOString(),
          },
          {
            id: 'doc-2',
            application_id: 'HOSTEL-2025-91823',
            document_type: 'aadhaar_card',
            file_name: 'Aadhaar_Card_Verified.jpg',
            document_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800',
            uploaded_at: new Date(Date.now() - 3 * 86400000).toISOString(),
          },
          {
            id: 'doc-3',
            application_id: 'HOSTEL-2025-91823',
            document_type: 'marksheet',
            file_name: 'Semester_4_GradeSheet.pdf',
            document_url: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&q=80&w=800',
            uploaded_at: new Date(Date.now() - 3 * 86400000).toISOString(),
          },
        ]);
      }
      setLoading(false);
    }

    loadDocs();
  }, [studentEmail, studentProfile?.id]);

  const formatDocType = (type: string) => {
    switch (type) {
      case 'student_id_card':
        return 'Student University ID Card';
      case 'aadhaar_card':
        return 'Aadhaar / Government Identity Card';
      case 'marksheet':
        return 'Semester Marksheet & Grade Record';
      case 'income_certificate':
        return 'Annual Income Certificate';
      default:
        return type.replace(/_/g, ' ').toUpperCase();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Documents Vault
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Centrally stored credentials used for hostel admissions and university clearances.
          </p>
        </div>

        <Link
          to="/student/apply"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Supporting Document</span>
        </Link>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500">
          <span className="w-6 h-6 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin inline-block mb-3" />
          <p>Retrieving documents vault from Supabase...</p>
        </div>
      ) : documents.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200/80 shadow-2xs text-center max-w-lg mx-auto">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">No documents found</h3>
          <p className="text-xs text-slate-500 mt-1">
            Documents uploaded during your hostel application process will appear here once submitted.
          </p>
          <Link
            to="/student/apply"
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Submit Application with Documents</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {documents.map(doc => (
            <div
              key={doc.id}
              className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Attached</span>
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 leading-snug">
                  {formatDocType(doc.document_type)}
                </h3>
                <p className="text-xs text-slate-500 mt-1 font-mono truncate">{doc.file_name}</p>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-[11px] text-slate-500">
                  <div className="flex justify-between">
                    <span>Uploaded:</span>
                    <span className="text-slate-700">
                      {new Date(doc.uploaded_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <a
                  href={doc.document_url || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <span>View Scan</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <span className="text-[10px] text-slate-400 font-mono">
                  ID: {doc.id.substring(0, 8)}...
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
