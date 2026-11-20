import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  MapPin, 
  Clock, 
  Building2, 
  GitFork, 
  ShieldAlert, 
  ExternalLink,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { DepartmentBadge, UrgencyBadge, StatusBadge, LanguageBadge } from '../common/Badge';
import StatusTimeline from '../common/StatusTimeline';

export default function TicketTrackerCard({ complaint }) {
  const [copied, setCopied] = useState(false);

  if (!complaint) return null;

  const handleCopyTicket = () => {
    navigator.clipboard.writeText(complaint.ticket_id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const createdFormatted = new Date(complaint.created_at).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block mb-1">
            Grievance Tracking
          </span>
          <div className="flex items-center gap-3">
            <h3 className="text-2xl font-black tracking-tight font-mono text-brand-300">
              {complaint.ticket_id}
            </h3>
            <button
              onClick={handleCopyTicket}
              className="p-1.5 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Copy Ticket ID"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-1">Submitted on {createdFormatted}</p>
        </div>

        <div className="flex items-center gap-2">
          <StatusBadge status={complaint.status} />
          <UrgencyBadge level={complaint.urgency} />
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-6">
        {/* Master Cluster Notice if clustered */}
        {complaint.cluster_id && (
          <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 flex items-start gap-3 text-purple-900 text-sm">
            <GitFork className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Grouped with Similar Campus Issue (Cluster #{complaint.cluster_id})</p>
              <p className="text-xs text-purple-700 mt-0.5">
                Multiple students reported this problem. Campus maintenance has grouped them to resolve in a single work order.
              </p>
            </div>
          </div>
        )}

        {/* AI Router Metadata Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-0">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs text-slate-500 font-medium block mb-1">Assigned Department</span>
            <DepartmentBadge dept={complaint.department} />
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs text-slate-500 font-medium block mb-1">Building Location</span>
            <div className="flex items-center gap-1.5 font-bold text-slate-800 text-sm">
              <Building2 className="w-4 h-4 text-slate-500" />
              <span className="truncate">{complaint.building || 'Campus General'}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs text-slate-500 font-medium block mb-1">Floor & Area</span>
            <div className="flex items-center gap-1.5 font-bold text-slate-800 text-sm">
              <MapPin className="w-4 h-4 text-slate-500" />
              <span className="truncate">
                {complaint.floor || ''} {complaint.specific_location ? `· ${complaint.specific_location}` : (complaint.floor ? '' : 'Campus')}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs text-slate-500 font-medium block mb-1">Reported Duration</span>
            <div className="flex items-center gap-1.5 font-bold text-slate-800 text-sm">
              <Clock className="w-4 h-4 text-slate-500" />
              <span>{complaint.duration || 'Recently'}</span>
            </div>
          </div>
        </div>

        {/* Preferred Time Slot */}
        {complaint.preferred_time_slot && (
          <div className="p-3.5 rounded-xl bg-brand-50 border border-brand-200 flex items-center gap-3">
            <Clock className="w-5 h-5 text-brand-600 flex-shrink-0" />
            <div>
              <span className="text-xs text-brand-700 font-semibold uppercase tracking-wider block">Preferred Visit Time Slot</span>
              <span className="font-bold text-brand-900 text-sm">{complaint.preferred_time_slot}</span>
              <span className="text-xs text-brand-600 block mt-0.5">The technician will try to visit during this window.</span>
            </div>
          </div>
        )}

        {/* Original Complaint and AI Summary */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Original Student Complaint
              </span>
              <LanguageBadge lang={complaint.detected_language} />
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm font-medium leading-relaxed">
              "{complaint.raw_text}"
            </div>
          </div>

          {complaint.english_translation && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-500" />
                <span>Normalized AI English Summary</span>
              </div>
              <div className="p-3 rounded-lg bg-brand-50/50 border border-brand-100 text-brand-900 text-xs">
                {complaint.english_translation}
              </div>
            </div>
          )}
        </div>

        {/* Human Review Note if applicable */}
        {complaint.needs_human_review && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-800">
            <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Under Review by Triage Team:</span> Because the complaint had an ambiguous department or low confidence ({Math.round(complaint.confidence_score * 100)}%), our staff is manually confirming the routing.
            </div>
          </div>
        )}

        {/* Resolution Notes if present */}
        {complaint.admin_notes && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block mb-1">
              Department Operations Note
            </span>
            <p className="text-sm text-emerald-900 font-medium">
              {complaint.admin_notes}
            </p>
          </div>
        )}

        {/* Timeline */}
        <div className="pt-4 border-t border-slate-200">
          <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" />
            <span>Audit & Resolution Timeline</span>
          </h4>
          <StatusTimeline logs={complaint.logs} currentStatus={complaint.status} />
        </div>
      </div>
    </div>
  );
}
