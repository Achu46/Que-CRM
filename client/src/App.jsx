import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  Workflow, 
  Database, 
  Activity, 
  CheckCircle2, 
  XCircle, 
  RefreshCw,
  Users,
  DollarSign,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import api from './api/client.js';

export default function App() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/health');
      setHealth(res.data);
    } catch (err) {
      setError(err.message || 'Failed to connect to backend API');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 to-brand-500 flex items-center justify-center text-white font-bold shadow-md shadow-brand-500/20">
              Q
            </div>
            <div>
              <span className="font-bold text-lg text-slate-900 tracking-tight">Que-CRM</span>
              <span className="ml-2 px-2 py-0.5 text-xs font-semibold bg-brand-50 text-brand-700 rounded-full border border-brand-200">
                Phase 1 Scaffolding
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
              <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">Backend API:</span>
              {loading ? (
                <span className="inline-flex items-center text-amber-600 font-medium">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1" /> Connecting...
                </span>
              ) : health ? (
                <span className="inline-flex items-center text-emerald-600 font-semibold">
                  <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-500" /> Operational
                </span>
              ) : (
                <span className="inline-flex items-center text-rose-600 font-semibold">
                  <XCircle className="w-4 h-4 mr-1 text-rose-500" /> Offline
                </span>
              )}
            </div>
            <button
              onClick={checkHealth}
              disabled={loading}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              title="Refresh connection status"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Card */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-brand-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur border border-white/20 text-xs font-medium text-brand-200 mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Next-Generation Intelligent CRM Engine</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Que-CRM Foundation Initialized
            </h1>
            <p className="mt-3 text-slate-300 text-base sm:text-lg leading-relaxed">
              Clean architecture setup with Node.js/Express, React, Firebase Firestore, Google Gemini AI, Resend, and n8n automations. Zero secrets exposed on the client.
            </p>
          </div>
        </div>

        {/* Tech Stack Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-900">Google Gemini AI</h3>
            <p className="text-xs text-slate-500 mt-1">Lead enrichment, email drafts & deal sentiment intelligence.</p>
            <div className="mt-3 flex items-center text-xs font-medium text-blue-600">
              <span className="w-2 h-2 rounded-full bg-blue-500 mr-1.5"></span> Ready for API Key
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center mb-3">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-900">Firebase Firestore</h3>
            <p className="text-xs text-slate-500 mt-1">Document store for Leads, Deals, Contacts & Activity Streams.</p>
            <div className="mt-3 flex items-center text-xs font-medium text-orange-600">
              <span className="w-2 h-2 rounded-full bg-orange-500 mr-1.5"></span> Admin SDK Wired
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
              <Send className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-900">Resend Email</h3>
            <p className="text-xs text-slate-500 mt-1">One-to-one outreach and email delivery/click webhooks.</p>
            <div className="mt-3 flex items-center text-xs font-medium text-purple-600">
              <span className="w-2 h-2 rounded-full bg-purple-500 mr-1.5"></span> Client Configured
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <Workflow className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-900">n8n Automations</h3>
            <p className="text-xs text-slate-500 mt-1">Event-driven webhooks for notifications and integrations.</p>
            <div className="mt-3 flex items-center text-xs font-medium text-emerald-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5"></span> Dispatcher Ready
            </div>
          </div>
        </div>

        {/* Backend Connectivity Status Box */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">System Diagnostics & Environment</h2>
              <p className="text-sm text-slate-500">Live communication test between React frontend and Express server</p>
            </div>
            <div className="flex items-center text-xs text-slate-500 font-mono">
              <ShieldCheck className="w-4 h-4 mr-1 text-emerald-600" />
              Secrets Guarded
            </div>
          </div>

          <div className="mt-4">
            {loading && (
              <div className="py-6 flex items-center justify-center text-slate-500 space-x-2">
                <RefreshCw className="w-5 h-5 animate-spin text-brand-600" />
                <span className="text-sm">Pinging Express backend at /api/health...</span>
              </div>
            )}

            {error && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-sm">
                <p className="font-semibold flex items-center">
                  <XCircle className="w-4 h-4 mr-1.5" /> Unable to reach Express server
                </p>
                <p className="mt-1 text-xs text-rose-700">{error}</p>
                <p className="mt-2 text-xs text-slate-600">
                  Ensure the backend is running with <code className="bg-rose-100 px-1 py-0.5 rounded font-mono">npm run dev:server</code>.
                </p>
              </div>
            )}

            {health && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-xs text-slate-500 block">Service Name</span>
                    <span className="font-semibold text-slate-900">{health.service}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-xs text-slate-500 block">Server Environment</span>
                    <span className="font-semibold text-slate-900 uppercase font-mono">{health.env}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-xs text-slate-500 block">Last Responded</span>
                    <span className="font-semibold text-slate-900 font-mono text-xs">{new Date(health.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center">
                  <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600 shrink-0" />
                  <span>Frontend and Backend API bridge verified. Ready to proceed to <strong>Phase 2: Database & Core CRM REST APIs</strong>.</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500">
          Que-CRM Project • Clean Architecture Foundation
        </div>
      </footer>
    </div>
  );
}

