import React from 'react';
import {
  ShieldCheck,
  MessageSquarePlus,
  Search,
  LayoutDashboard,
  MapPin,
  Sparkles,
  GraduationCap,
  Building2,
  LogOut,
} from 'lucide-react';

// Tab definitions per role
const STUDENT_TABS = [
  { id: 'submit', label: 'Submit Complaint', icon: MessageSquarePlus },
  { id: 'track',  label: 'Track My Ticket',  icon: Search },
];

const ADMIN_TABS = [
  { id: 'admin',     label: 'Department Queues',          icon: LayoutDashboard },
  { id: 'analytics', label: 'Campus Heatmap & Analytics', icon: MapPin },
];

export default function Navbar({ activeTab, setActiveTab, role, onLogout }) {
  const tabs = role === 'admin' ? ADMIN_TABS : STUDENT_TABS;

  const roleLabel = role === 'admin' ? 'Admin / Warden' : 'Student';
  const RoleIcon  = role === 'admin' ? Building2 : GraduationCap;
  const roleBg    = role === 'admin' ? 'bg-brand-700 text-brand-100' : 'bg-emerald-600 text-emerald-50';

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm backdrop-blur-md bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">

          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 to-brand-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-slate-900 text-lg tracking-tight">M1</span>
                <span className="text-brand-600 font-bold text-lg">·</span>
                <span className="font-bold text-slate-800 text-sm tracking-wide uppercase">Campus Intelligence</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Hinglish AI Complaint Router</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1 sm:space-x-2 flex-1 justify-center">
            {tabs.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 border border-brand-200 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-brand-600' : 'text-slate-400'}`} />
                  <span className="hidden md:inline">{item.label}</span>
                  <span className="md:hidden">{item.label.split(' ')[0]}</span>
                </button>
              );
            })}
          </nav>

          {/* Right side: role badge + AI status + logout */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Role Badge */}
            <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-bold ${roleBg}`}>
              <RoleIcon className="w-3.5 h-3.5" />
              <span>{roleLabel}</span>
            </div>

            {/* AI Active Pill */}
            <div className="hidden lg:flex items-center space-x-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-semibold text-emerald-800 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                AI Active
              </span>
            </div>

            {/* Logout Button */}
            {onLogout && (
              <button
                onClick={onLogout}
                title="Logout / Switch Role"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 border border-slate-200 hover:border-red-200 transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
