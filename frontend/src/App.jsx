import React, { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import Navbar from './components/common/Navbar';
import StudentSubmitPage from './pages/StudentSubmitPage';
import TrackTicketPage from './pages/TrackTicketPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AnalyticsPage from './pages/AnalyticsPage';
import { Sparkles } from 'lucide-react';

// Role is stored in sessionStorage so it resets on tab close (not persistent across sessions)
// This is intentional — admin must re-login each session
const SESSION_ROLE_KEY = 'm1_role';

export default function App() {
  // Initialize role from sessionStorage if already logged in this session
  const [role, setRole] = useState(() => sessionStorage.getItem(SESSION_ROLE_KEY) || null);

  // Active tab — student sees different tabs than admin
  const [activeTab, setActiveTab] = useState('submit');
  const [selectedTicketId, setSelectedTicketId] = useState('');

  // When role changes, reset to the default tab for that role
  useEffect(() => {
    if (role === 'student') setActiveTab('submit');
    if (role === 'admin') setActiveTab('admin');
  }, [role]);

  const handleLogin = (selectedRole) => {
    sessionStorage.setItem(SESSION_ROLE_KEY, selectedRole);
    setRole(selectedRole);
  };

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_ROLE_KEY);
    setRole(null);
    setActiveTab('submit');
    setSelectedTicketId('');
  };

  const navigateToTrackWithTicket = (ticketId) => {
    setSelectedTicketId(ticketId);
    setActiveTab('track');
  };

  // Not logged in — show the login/role selection page
  if (!role) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-brand-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        role={role}
        onLogout={handleLogout}
      />

      {/* Main Content Body */}
      <main className="flex-1 pb-16">
        {/* Student tabs */}
        {role === 'student' && activeTab === 'submit' && (
          <StudentSubmitPage onNavigateToTrack={navigateToTrackWithTicket} />
        )}
        {role === 'student' && activeTab === 'track' && (
          <TrackTicketPage initialTicketId={selectedTicketId} />
        )}

        {/* Admin tabs */}
        {role === 'admin' && activeTab === 'admin' && (
          <AdminDashboardPage />
        )}
        {role === 'admin' && activeTab === 'analytics' && (
          <AnalyticsPage />
        )}

        {/* Guard: student trying to access admin tab (shouldn't happen, but safety) */}
        {role === 'student' && (activeTab === 'admin' || activeTab === 'analytics') && (
          <div className="max-w-md mx-auto mt-20 text-center px-4">
            <div className="text-5xl mb-4">🔒</div>
            <h2 className="text-xl font-black text-slate-800">Admin Access Only</h2>
            <p className="text-sm text-slate-500 mt-2">
              You need to log in as Admin / Warden to access this section.
            </p>
            <button
              onClick={handleLogout}
              className="mt-6 px-6 py-2.5 rounded-xl bg-brand-600 text-white font-bold text-sm hover:bg-brand-700 transition-colors"
            >
              Switch to Admin Login
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-slate-800">M1 · Campus Intelligence</span>
            <span>—</span>
            <span>AI-Powered Hinglish Complaint Router</span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="inline-flex items-center gap-1 text-slate-400">
              <Sparkles className="w-3 h-3 text-brand-500" />
              Demo NLP + Gemini Support
            </span>
            <span className="text-slate-300">|</span>
            <span>FastAPI + SQLite + React</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
