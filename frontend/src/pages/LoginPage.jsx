import React, { useState } from 'react';
import {
  ShieldCheck,
  GraduationCap,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  AlertCircle,
  Building2,
  ArrowRight,
} from 'lucide-react';

// Admin password — in a real app this would be a proper auth system
// For demo/hackathon: hardcoded password "admin@m1" (never expose real secrets)
const ADMIN_PASSWORD = 'admin@m1';

export default function LoginPage({ onLogin }) {
  const [mode, setMode] = useState(null); // null | 'student' | 'admin'
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleStudentLogin = () => {
    onLogin('student');
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    setError('');
    if (!adminPassword.trim()) {
      setError('Please enter the admin password.');
      return;
    }
    setIsLoading(true);
    // Simulate a small delay for UX
    setTimeout(() => {
      if (adminPassword === ADMIN_PASSWORD) {
        onLogin('admin');
      } else {
        setError('Incorrect password. Please try again.');
        setAdminPassword('');
      }
      setIsLoading(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-brand-950 to-slate-900 flex flex-col items-center justify-center px-4 py-10">
      {/* Logo */}
      <div className="mb-10 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-brand-500/30">
          <ShieldCheck className="w-9 h-9 text-white" />
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">
          M1 · Campus Intelligence
        </h1>
        <p className="text-sm text-slate-400 mt-1 font-medium">
          AI-Powered Hinglish Complaint Router
        </p>
        <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-semibold">
          <Sparkles className="w-3 h-3" />
          <span>Multilingual · AI Classified · Real-time Tracking</span>
        </div>
      </div>

      {/* Role Selection or Admin Login */}
      {mode === null && (
        <div className="w-full max-w-sm space-y-4">
          <p className="text-center text-slate-400 text-sm font-medium mb-6">
            Who are you? Choose your portal below.
          </p>

          {/* Student Card */}
          <button
            onClick={handleStudentLogin}
            className="w-full group bg-white hover:bg-brand-50 border-2 border-white hover:border-brand-400 rounded-2xl p-6 text-left transition-all shadow-lg hover:shadow-xl hover:shadow-brand-500/10 flex items-center gap-5"
          >
            <div className="w-14 h-14 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center flex-shrink-0 shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-base font-black text-slate-900">Student Portal</h2>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                Submit complaints · Track your tickets · View status updates
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-brand-500 group-hover:translate-x-1 transition-all" />
          </button>

          {/* Admin / Warden Card */}
          <button
            onClick={() => setMode('admin')}
            className="w-full group bg-white hover:bg-slate-900 border-2 border-white hover:border-slate-700 rounded-2xl p-6 text-left transition-all shadow-lg hover:shadow-xl flex items-center gap-5"
          >
            <div className="w-14 h-14 rounded-xl bg-gradient-to-tr from-brand-700 to-brand-500 flex items-center justify-center flex-shrink-0 shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-base font-black text-slate-900 group-hover:text-white transition-colors">Admin / Warden Portal</h2>
              <p className="text-xs text-slate-500 group-hover:text-slate-400 mt-0.5 leading-relaxed transition-colors">
                Department queues · Approve complaints · Analytics & heatmap
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-slate-300 group-hover:text-brand-400 transition-colors" />
              <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-brand-400 group-hover:translate-x-1 transition-all" />
            </div>
          </button>
        </div>
      )}

      {/* Admin Login Form */}
      {mode === 'admin' && (
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-700 to-brand-500 flex items-center justify-center mx-auto mb-3 shadow-md">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-black text-slate-900">Admin / Warden Login</h2>
              <p className="text-xs text-slate-500 mt-1">
                Enter admin password to access the operations dashboard
              </p>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Admin Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={adminPassword}
                    onChange={(e) => { setAdminPassword(e.target.value); setError(''); }}
                    placeholder="Enter admin password"
                    className="w-full px-4 py-3 pr-10 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Demo hint */}
              <div className="text-[11px] text-slate-400 bg-slate-50 rounded-lg px-3 py-2 border border-slate-200">
                💡 <span className="font-semibold">Demo password:</span> <code className="font-mono bg-white px-1 rounded border border-slate-200">admin@m1</code>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md shadow-brand-500/20 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Login as Admin</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => { setMode(null); setAdminPassword(''); setError(''); }}
                className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 font-semibold text-sm border border-slate-200 transition-colors"
              >
                ← Go Back
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <p className="mt-10 text-xs text-slate-600 text-center">
        M1 Campus Intelligence · FastAPI + React + SQLite · Hackathon Demo
      </p>
    </div>
  );
}
