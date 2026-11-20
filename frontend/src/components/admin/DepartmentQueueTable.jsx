import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  GitFork, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  UserCheck, 
  Building2, 
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { DepartmentBadge, UrgencyBadge, StatusBadge, LanguageBadge } from '../common/Badge';

const DEPARTMENTS = ["All", "Plumbing", "Electrical", "Wi-Fi", "Mess", "Academic", "Other"];
const STATUS_OPTIONS = ["Submitted", "In Review", "In Progress", "Resolved", "Rejected"];

export default function DepartmentQueueTable({
  complaints = [],
  isLoading,
  onStatusChange,
  onOpenTriage,
  onOpenCluster,
  onRefresh
}) {
  const [selectedDept, setSelectedDept] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [onlyNeedsReview, setOnlyNeedsReview] = useState(false);

  // Filter complaints
  const filtered = complaints.filter((c) => {
    if (selectedDept !== "All" && c.department !== selectedDept) return false;
    if (statusFilter !== "All" && c.status !== statusFilter) return false;
    if (onlyNeedsReview && !c.needs_human_review) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTicket = (c.ticket_id || '').toLowerCase().includes(q);
      const matchText = (c.raw_text || '').toLowerCase().includes(q);
      const matchBuilding = (c.building || '').toLowerCase().includes(q);
      const matchStudent = (c.student_name || '').toLowerCase().includes(q);
      if (!matchTicket && !matchText && !matchBuilding && !matchStudent) return false;
    }

    return true;
  });

  const needsReviewCount = complaints.filter(c => c.needs_human_review).length;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Department Tabs Bar */}
      <div className="border-b border-slate-200 bg-slate-50/70 p-3 sm:p-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {DEPARTMENTS.map((dept) => {
            const count = dept === "All" ? complaints.length : complaints.filter(c => c.department === dept).length;
            const isSelected = selectedDept === dept;
            return (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                <span>{dept}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-brand-700 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="p-4 border-b border-slate-200 bg-white flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tickets, student name, building, or text..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:ring-1 focus:ring-brand-500 text-slate-800 placeholder:text-slate-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Needs Review Filter Toggle */}
          <button
            type="button"
            onClick={() => setOnlyNeedsReview(!onlyNeedsReview)}
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
              onlyNeedsReview
                ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                : 'bg-white text-amber-700 border-amber-200 hover:bg-amber-50'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Needs Review</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-600 text-white">
              {needsReviewCount}
            </span>
          </button>

          {/* Status Filter Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 focus:ring-1 focus:ring-brand-500 bg-white"
          >
            <option value="All">All Statuses</option>
            {STATUS_OPTIONS.map((st) => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">Ticket</th>
              <th className="py-3 px-4">Issue Description</th>
              <th className="py-3 px-4">Dept & Urgency</th>
              <th className="py-3 px-4">Location</th>
              <th className="py-3 px-4">Group / Triage</th>
              <th className="py-3 px-4">Status Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                    <span>Loading department queues...</span>
                  </div>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  No complaints match the current filter criteria.
                </td>
              </tr>
            ) : (
              filtered.map((item) => {
                const isReviewRequired = item.needs_human_review;
                return (
                  <tr 
                    key={item.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isReviewRequired ? 'bg-amber-50/40' : ''
                    }`}
                  >
                    {/* Ticket ID & Lang */}
                    <td className="py-3.5 px-4 font-mono font-bold whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="text-brand-700">{item.ticket_id}</span>
                      </div>
                      <div className="mt-1 flex items-center gap-1">
                        <LanguageBadge lang={item.detected_language} />
                        <span className="text-[10px] text-slate-400">
                          {new Date(item.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </td>

                    {/* Complaint Text */}
                    <td className="py-3.5 px-4 max-w-xs md:max-w-md">
                      <p className="font-semibold text-slate-800 line-clamp-2" title={item.raw_text}>
                        "{item.raw_text}"
                      </p>
                      {item.english_translation && (
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1 italic">
                          Summary: {item.english_translation}
                        </p>
                      )}
                      <div className="mt-1 text-[11px] text-slate-400 flex items-center gap-2">
                        {item.student_name && <span>By: {item.student_name}</span>}
                        {item.duration && <span>· Duration: {item.duration}</span>}
                      </div>
                      {item.preferred_time_slot && (
                        <div className="mt-1.5 inline-flex items-center gap-1 bg-brand-50 border border-brand-200 text-brand-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          <Clock className="w-3 h-3" />
                          <span>{item.preferred_time_slot}</span>
                        </div>
                      )}
                    </td>

                    {/* Department & Urgency */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="space-y-1.5">
                        <DepartmentBadge dept={item.department} />
                        <div>
                          <UrgencyBadge level={item.urgency} />
                        </div>
                      </div>
                    </td>

                    {/* Location */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-800 flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.building || 'Not specified'}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {item.floor || ''} {item.specific_location ? `· ${item.specific_location}` : ''}
                      </div>
                    </td>

                    {/* Cluster / Triage Action */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="space-y-1.5">
                        {item.cluster_id ? (
                          <button
                            type="button"
                            onClick={() => onOpenCluster(item.cluster_id)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-purple-50 text-purple-700 hover:bg-purple-100 font-semibold border border-purple-200 text-[11px] transition-colors"
                          >
                            <GitFork className="w-3 h-3 text-purple-600" />
                            <span>Cluster #{item.cluster_id}</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400">Standalone</span>
                        )}

                        {isReviewRequired && (
                          <div>
                            <button
                              type="button"
                              onClick={() => onOpenTriage(item)}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold border border-amber-300 text-[11px] transition-colors"
                            >
                              <UserCheck className="w-3 h-3 text-amber-700" />
                              <span>Review Triage</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Status Action: Dropdown + Quick Approve */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1.5">
                        <select
                          value={item.status}
                          onChange={(e) => onStatusChange(item.ticket_id, e.target.value)}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-800 focus:ring-1 focus:ring-brand-500 bg-white shadow-sm"
                        >
                          {STATUS_OPTIONS.map((st) => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>
                        {/* Quick Approve Button */}
                        {item.status !== 'Resolved' && item.status !== 'Rejected' && (
                          <button
                            type="button"
                            onClick={() => onStatusChange(item.ticket_id, 'In Progress')}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold transition-colors shadow-sm"
                            title="Quick approve — mark as In Progress"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Approve Work</span>
                          </button>
                        )}
                        {item.status === 'Resolved' && (
                          <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                            <CheckCircle2 className="w-3 h-3" /> Resolved
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
