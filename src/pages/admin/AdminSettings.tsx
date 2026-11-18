import React, { useState, useEffect } from 'react';
import {
  Save,
  CheckCircle2,
  Globe,
  Building,
  RotateCcw,
  Send,
  Loader2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { settingsService } from '../../services/settingsService';
import { SystemSettings } from '../../types';

export const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings>(() => settingsService.getSettings());
  const [cycleIdentifier, setCycleIdentifier] = useState(settings.cycleIdentifier);
  const [cycleOpen, setCycleOpen] = useState(settings.cycleOpen);
  const [minDistanceKm, setMinDistanceKm] = useState(String(settings.minDistanceKm));
  const [makeSubmissionWebhook, setMakeSubmissionWebhook] = useState(settings.makeSubmissionWebhook);
  const [makeActionWebhook, setMakeActionWebhook] = useState(settings.makeActionWebhook);

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [resetNotice, setResetNotice] = useState(false);

  // Webhook connection test states
  const [testingSubmission, setTestingSubmission] = useState(false);
  const [submissionTestResult, setSubmissionTestResult] = useState<{
    success: boolean;
    status?: number;
    error?: string;
  } | null>(null);

  const [testingAction, setTestingAction] = useState(false);
  const [actionTestResult, setActionTestResult] = useState<{
    success: boolean;
    status?: number;
    error?: string;
  } | null>(null);

  // Keep state synced if changed elsewhere
  useEffect(() => {
    const unsubscribe = settingsService.subscribe(newSettings => {
      setSettings(newSettings);
    });
    return unsubscribe;
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const updated = settingsService.saveSettings({
      cycleIdentifier: cycleIdentifier.trim() || 'Academic Session 2025-2026 (Odd Semester)',
      cycleOpen,
      minDistanceKm: Number(minDistanceKm) || 150,
      makeSubmissionWebhook: makeSubmissionWebhook.trim(),
      makeActionWebhook: makeActionWebhook.trim(),
    });

    setSettings(updated);
    setSavedSuccess(true);
    setResetNotice(false);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  const handleResetDefaults = () => {
    const defaults = settingsService.resetToDefaults();
    setSettings(defaults);
    setCycleIdentifier(defaults.cycleIdentifier);
    setCycleOpen(defaults.cycleOpen);
    setMinDistanceKm(String(defaults.minDistanceKm));
    setMakeSubmissionWebhook(defaults.makeSubmissionWebhook);
    setMakeActionWebhook(defaults.makeActionWebhook);
    setSubmissionTestResult(null);
    setActionTestResult(null);
    setResetNotice(true);
    setSavedSuccess(false);
    setTimeout(() => setResetNotice(false), 4000);
  };

  const handleTestSubmissionWebhook = async () => {
    setTestingSubmission(true);
    setSubmissionTestResult(null);
    try {
      const res = await settingsService.testWebhook(makeSubmissionWebhook, 'submission');
      setSubmissionTestResult(res);
    } finally {
      setTestingSubmission(false);
    }
  };

  const handleTestActionWebhook = async () => {
    setTestingAction(true);
    setActionTestResult(null);
    try {
      const res = await settingsService.testWebhook(makeActionWebhook, 'action');
      setActionTestResult(res);
    } finally {
      setTestingAction(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Hostel Admissions Configuration
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure admission cycles, distance criteria algorithms, and Make.com automation webhooks.
          </p>
        </div>

        <button
          type="button"
          onClick={handleResetDefaults}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restore Environment Defaults</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between gap-2 animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">
              Configuration persisted successfully to system memory. Active admissions and webhook layers updated.
            </span>
          </div>
          {settings.updatedAt && (
            <span className="text-[10px] text-emerald-600 font-mono">
              {new Date(settings.updatedAt).toLocaleTimeString()}
            </span>
          )}
        </div>
      )}

      {resetNotice && (
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
          <AlertCircle className="w-4 h-4 text-blue-600 shrink-0" />
          <span className="font-medium">
            System configuration successfully reset to base environment (.env) values.
          </span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Admission Cycle Controls */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building className="w-4 h-4 text-blue-600" />
              <span>Active Admissions Cycle & Quota Policies</span>
            </h3>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                cycleOpen ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              {cycleOpen ? 'Intake Active' : 'Intake Frozen'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Current Cycle Identifier
              </label>
              <input
                type="text"
                value={cycleIdentifier}
                onChange={e => setCycleIdentifier(e.target.value)}
                placeholder="Academic Session 2025-2026 (Odd Semester)"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Included in all generated application records and Make.com payloads.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Intake Status
              </label>
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setCycleOpen(!cycleOpen)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer ${
                    cycleOpen
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                  }`}
                >
                  {cycleOpen ? 'Open for Submissions' : 'Submissions Closed'}
                </button>
                <span className="text-xs text-slate-500">
                  {cycleOpen
                    ? 'Students can submit new hostel forms'
                    : 'Intake is frozen; new submissions are blocked'}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Minimum Domicile Distance Threshold (Kilometers)
            </label>
            <div className="max-w-xs">
              <input
                type="number"
                min="0"
                step="1"
                value={minDistanceKm}
                onChange={e => setMinDistanceKm(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Residential addresses under this radius will be flagged as day-scholars and disqualified from on-campus rooms.
            </p>
          </div>
        </div>

        {/* Make.com Automation Webhooks */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-600" />
              <span>Make.com / Automation Webhook Integrations</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Overrides runtime .env defaults</span>
            </span>
          </div>

          <div className="space-y-5">
            {/* 1. Student Submission Webhook */}
            <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  New Application Trigger Webhook (VITE_MAKE_WEBHOOK_URL)
                </label>
                <button
                  type="button"
                  onClick={handleTestSubmissionWebhook}
                  disabled={testingSubmission || !makeSubmissionWebhook}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-blue-600 transition-colors shadow-2xs disabled:opacity-50 cursor-pointer self-start sm:self-auto"
                >
                  {testingSubmission ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                      <span>Testing Webhook...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5 text-blue-600" />
                      <span>Test Endpoint</span>
                    </>
                  )}
                </button>
              </div>

              <input
                type="url"
                value={makeSubmissionWebhook}
                onChange={e => {
                  setMakeSubmissionWebhook(e.target.value);
                  setSubmissionTestResult(null);
                }}
                placeholder="https://hook.us2.make.com/your-submission-webhook"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 font-mono text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />

              <p className="text-[11px] text-slate-500">
                Dispatches strictly after Supabase database commit to initiate OCR document processing, geocode distance checks, and warden intake alerts.
              </p>

              {submissionTestResult && (
                <div
                  className={`mt-2 p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                    submissionTestResult.success
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {submissionTestResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>
                    {submissionTestResult.success
                      ? `Endpoint Reachable (HTTP ${submissionTestResult.status || 200} Accepted). Test ping acknowledged!`
                      : `Endpoint Ping Failed: ${submissionTestResult.error}`}
                  </span>
                </div>
              )}
            </div>

            {/* 2. Admin Decision Webhook */}
            <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Admin Decision Webhook (VITE_MAKE_ADMIN_ACTION_WEBHOOK)
                </label>
                <button
                  type="button"
                  onClick={handleTestActionWebhook}
                  disabled={testingAction || !makeActionWebhook}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-cyan-600 transition-colors shadow-2xs disabled:opacity-50 cursor-pointer self-start sm:self-auto"
                >
                  {testingAction ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-600" />
                      <span>Testing Webhook...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5 text-cyan-600" />
                      <span>Test Endpoint</span>
                    </>
                  )}
                </button>
              </div>

              <input
                type="url"
                value={makeActionWebhook}
                onChange={e => {
                  setMakeActionWebhook(e.target.value);
                  setActionTestResult(null);
                }}
                placeholder="https://hook.us2.make.com/your-admin-action-webhook"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 font-mono text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-600"
              />

              <p className="text-[11px] text-slate-500">
                Fires when a warden approves, rejects, or requests additional documents to dispatch automated student email notifications and execute privileged RLS database updates.
              </p>

              {actionTestResult && (
                <div
                  className={`mt-2 p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                    actionTestResult.success
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {actionTestResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>
                    {actionTestResult.success
                      ? `Endpoint Reachable (HTTP ${actionTestResult.status || 200} Accepted). Test ping acknowledged!`
                      : `Endpoint Ping Failed: ${actionTestResult.error}`}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
