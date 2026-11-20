import React, { useState } from 'react';
import { 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  Search, 
  FileText, 
  ShieldCheck,
  Building2,
  Clock
} from 'lucide-react';
import ComplaintForm from '../components/student/ComplaintForm';
import TicketTrackerCard from '../components/student/TicketTrackerCard';
import { DepartmentBadge, UrgencyBadge } from '../components/common/Badge';

export default function StudentSubmitPage({ onNavigateToTrack }) {
  const [submittedComplaint, setSubmittedComplaint] = useState(null);

  const handleSubmitted = (complaint) => {
    setSubmittedComplaint(complaint);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Hero Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 text-brand-600" />
          <span>Multilingual Campus Router · Hinglish · Hindi · English</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
          Report Campus Issues in Your Own Words
        </h1>
        <p className="text-sm md:text-base text-slate-600 max-w-2xl mx-auto">
          No need to figure out which department to contact. Write your problem naturally, and our AI will classify, prioritize, and route it to the right team instantly.
        </p>
      </div>

      {/* Submission Success Banner */}
      {submittedComplaint ? (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-6 text-center space-y-3 shadow-sm">
            <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-md shadow-emerald-500/20">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-emerald-900">
                Complaint Successfully Registered!
              </h3>
              <p className="text-xs text-emerald-700 mt-1">
                Your ticket has been generated and queued for operational resolution.
              </p>
            </div>

            <div className="inline-block bg-white px-6 py-3 rounded-xl border border-emerald-200 shadow-inner">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Your Unique Tracking ID
              </span>
              <span className="text-2xl font-black font-mono text-brand-700">
                {submittedComplaint.ticket_id}
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => onNavigateToTrack(submittedComplaint.ticket_id)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-500/20 transition-all"
              >
                <Search className="w-4 h-4" />
                <span>Track Live Progress</span>
              </button>
              <button
                onClick={() => setSubmittedComplaint(null)}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-300 transition-colors"
              >
                Submit Another Complaint
              </button>
            </div>
          </div>

          {/* Render Full Ticket Card preview */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Generated Ticket Summary
            </h4>
            <TicketTrackerCard complaint={submittedComplaint} />
          </div>
        </div>
      ) : (
        <ComplaintForm onComplaintSubmitted={handleSubmitted} />
      )}
    </div>
  );
}
