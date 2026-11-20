import React, { useState, useEffect } from 'react';
import { Search, AlertCircle, ArrowRight, ShieldCheck, Clock } from 'lucide-react';
import { api } from '../services/api';
import TicketTrackerCard from '../components/student/TicketTrackerCard';

export default function TrackTicketPage({ initialTicketId }) {
  const [ticketIdInput, setTicketIdInput] = useState(initialTicketId || '');
  const [complaint, setComplaint] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recentComplaints, setRecentComplaints] = useState([]);

  // Fetch recent tickets for quick demo lookup
  useEffect(() => {
    api.getComplaints({ limit: 4 })
      .then(res => setRecentComplaints(res || []))
      .catch(() => {});
  }, []);

  // Auto-search if initialTicketId was passed
  useEffect(() => {
    if (initialTicketId) {
      handleSearch(initialTicketId);
    }
  }, [initialTicketId]);

  const handleSearch = async (targetId) => {
    const idToSearch = (targetId || ticketIdInput).trim();
    if (!idToSearch) {
      setError('Please enter a valid ticket number (e.g. M1-2026-X4B2).');
      return;
    }

    setError(null);
    setIsLoading(true);
    setComplaint(null);
    try {
      const data = await api.trackComplaint(idToSearch);
      setComplaint(data);
    } catch (err) {
      setError(err.message || 'Ticket not found. Please verify the ticket ID.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLookup = (id) => {
    setTicketIdInput(id);
    handleSearch(id);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Page Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Track Complaint Status
        </h1>
        <p className="text-sm text-slate-600">
          Enter your unique ticket ID to view real-time department assignment, action logs, and resolution details.
        </p>
      </div>

      {/* Search Box */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-2xl mx-auto">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={ticketIdInput}
              onChange={(e) => setTicketIdInput(e.target.value)}
              placeholder="e.g. M1-2026-X8P2"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm font-mono font-bold uppercase tracking-wider text-slate-900 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !ticketIdInput.trim()}
            className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-md shadow-brand-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Track Ticket</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Recent Tickets Pill list for easy demo testing */}
        {recentComplaints.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Quick Test Recent Tickets:
            </span>
            <div className="flex flex-wrap gap-2">
              {recentComplaints.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleQuickLookup(item.ticket_id)}
                  className="px-2.5 py-1 text-xs font-mono font-bold bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-slate-700 rounded-lg border border-slate-200 transition-colors"
                >
                  {item.ticket_id} ({item.department})
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className="max-w-2xl mx-auto p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Lookup Error</p>
            <p className="text-xs mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Ticket Details View */}
      {complaint && (
        <div className="animate-in fade-in duration-200">
          <TicketTrackerCard complaint={complaint} />
        </div>
      )}
    </div>
  );
}
