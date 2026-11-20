import React from 'react';
import { 
  BarChart3, 
  RotateCcw, 
  Languages, 
  AlertCircle, 
  TrendingUp, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';
import { DepartmentBadge, UrgencyBadge } from '../common/Badge';

export default function RepeatAnalytics({ overviewData, isLoading }) {
  if (isLoading || !overviewData) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm text-center py-16">
        <span className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin inline-block mb-3" />
        <p className="text-sm text-slate-500 font-medium">Computing repeat analytics and department metrics...</p>
      </div>
    );
  }

  const {
    total_complaints = 0,
    open_complaints = 0,
    resolved_complaints = 0,
    needs_human_review_count = 0,
    active_clusters_count = 0,
    department_stats = [],
    urgency_distribution = {},
    language_distribution = {},
    top_repeat_issues = [],
    recent_activity_trend = []
  } = overviewData;

  const totalLanguages = Object.values(language_distribution).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="space-y-6">
      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Filed</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">{total_complaints}</span>
          <span className="text-[11px] text-slate-500 font-medium mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-brand-600" />
            All campus channels
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Active Open</span>
          <span className="text-2xl font-black text-amber-600 mt-1 block">{open_complaints}</span>
          <span className="text-[11px] text-amber-700 font-medium mt-1">Pending resolution</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Resolved</span>
          <span className="text-2xl font-black text-emerald-600 mt-1 block">{resolved_complaints}</span>
          <span className="text-[11px] text-emerald-700 font-medium mt-1">Closed successfully</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Needs Triage</span>
          <span className="text-2xl font-black text-rose-600 mt-1 block">{needs_human_review_count}</span>
          <span className="text-[11px] text-rose-700 font-medium mt-1">Uncertain AI predictions</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm col-span-2 lg:col-span-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Master Clusters</span>
          <span className="text-2xl font-black text-purple-600 mt-1 block">{active_clusters_count}</span>
          <span className="text-[11px] text-purple-700 font-medium mt-1">Duplicate groups merged</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Repeat Problem Spots */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-brand-600" />
              <span>Top Recurring Problem Spots (Repeat Analytics)</span>
            </h4>
            <span className="text-xs text-slate-400 font-medium">Auto-detected</span>
          </div>

          <div className="space-y-3">
            {top_repeat_issues.length > 0 ? (
              top_repeat_issues.map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-slate-900">{item.building}</span>
                      <DepartmentBadge dept={item.department} />
                    </div>
                    <p className="text-slate-600 italic">"{item.sample_complaint}"</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-800 font-black text-xs block">
                      {item.count} reports
                    </span>
                    <span className="text-[10px] text-slate-400 mt-1 block">Recurring spot</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">No recurring complaint spikes detected yet.</p>
            )}
          </div>
        </div>

        {/* Department Workload Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-brand-600" />
              <span>Department Workload & Queue Distribution</span>
            </h4>
          </div>

          <div className="space-y-3.5">
            {department_stats.map((dept) => {
              const maxTotal = Math.max(...department_stats.map(d => d.total), 1);
              const percentage = Math.round((dept.total / maxTotal) * 100);

              return (
                <div key={dept.department} className="text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-800">{dept.department}</span>
                    <span className="text-slate-500 font-medium">
                      {dept.open} Open · {dept.resolved} Resolved · <strong>{dept.total} Total</strong>
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
                    <div
                      style={{ width: `${percentage}%` }}
                      className="bg-brand-500 h-full rounded-full transition-all duration-500"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Language & Urgency Distributions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Language Distribution */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4">
            <Languages className="w-4 h-4 text-brand-600" />
            <span>Complaint Ingestion Language Breakdown</span>
          </h4>

          <div className="space-y-3 text-xs">
            {Object.entries(language_distribution).map(([lang, count]) => {
              const pct = Math.round((count / totalLanguages) * 100);
              const color = lang === 'Hinglish' ? 'bg-violet-500' : lang === 'Hindi' ? 'bg-orange-500' : 'bg-cyan-500';

              return (
                <div key={lang}>
                  <div className="flex justify-between font-semibold text-slate-700 mb-1">
                    <span>{lang}</span>
                    <span>{count} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div style={{ width: `${pct}%` }} className={`h-full ${color}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Urgency Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4">
            <AlertCircle className="w-4 h-4 text-brand-600" />
            <span>Urgency Level Breakdown</span>
          </h4>

          <div className="grid grid-cols-2 gap-3 text-xs">
            {["Critical", "High", "Medium", "Low"].map((u) => {
              const count = urgency_distribution[u] || 0;
              return (
                <div key={u} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="mb-1.5">
                    <UrgencyBadge level={u} />
                  </div>
                  <span className="text-xl font-black text-slate-900">{count}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Complaints filed</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
