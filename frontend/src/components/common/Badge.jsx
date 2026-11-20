import React from 'react';
import { 
  AlertTriangle, 
  Flame, 
  CheckCircle2, 
  Clock, 
  Wrench, 
  Zap, 
  Wifi, 
  UtensilsCrossed, 
  GraduationCap, 
  HelpCircle 
} from 'lucide-react';

export function UrgencyBadge({ level }) {
  const configs = {
    Critical: {
      bg: 'bg-red-50 text-red-700 border-red-200 ring-red-500/20',
      dot: 'bg-red-500 animate-pulse',
      icon: Flame,
    },
    High: {
      bg: 'bg-orange-50 text-orange-700 border-orange-200 ring-orange-500/20',
      dot: 'bg-orange-500',
      icon: AlertTriangle,
    },
    Medium: {
      bg: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/20',
      dot: 'bg-amber-500',
      icon: Clock,
    },
    Low: {
      bg: 'bg-slate-100 text-slate-700 border-slate-200',
      dot: 'bg-slate-400',
      icon: null,
    },
  };

  const config = configs[level] || configs.Medium;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.bg}`}>
      {config.dot && <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />}
      {Icon && <Icon className="w-3 h-3" />}
      {level}
    </span>
  );
}

export function DepartmentBadge({ dept }) {
  const configs = {
    Plumbing: { bg: 'bg-sky-50 text-sky-700 border-sky-200', icon: Wrench },
    Electrical: { bg: 'bg-amber-50 text-amber-700 border-amber-200', icon: Zap },
    'Wi-Fi': { bg: 'bg-purple-50 text-purple-700 border-purple-200', icon: Wifi },
    Mess: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: UtensilsCrossed },
    Academic: { bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: GraduationCap },
    Other: { bg: 'bg-slate-100 text-slate-700 border-slate-200', icon: HelpCircle },
  };

  const config = configs[dept] || configs.Other;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${config.bg}`}>
      <Icon className="w-3.5 h-3.5" />
      {dept}
    </span>
  );
}

export function StatusBadge({ status }) {
  const configs = {
    Submitted: { bg: 'bg-blue-50 text-blue-700 border-blue-200' },
    'In Review': { bg: 'bg-amber-50 text-amber-700 border-amber-200' },
    'In Progress': { bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    Resolved: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    Rejected: { bg: 'bg-rose-50 text-rose-700 border-rose-200' },
  };

  const config = configs[status] || configs.Submitted;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.bg}`}>
      {status === 'Resolved' && <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />}
      {status}
    </span>
  );
}

export function LanguageBadge({ lang }) {
  const configs = {
    Hinglish: 'bg-violet-50 text-violet-700 border-violet-200',
    Hindi: 'bg-orange-50 text-orange-700 border-orange-200',
    English: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold border uppercase tracking-wider ${configs[lang] || 'bg-slate-100 text-slate-700'}`}>
      {lang}
    </span>
  );
}
