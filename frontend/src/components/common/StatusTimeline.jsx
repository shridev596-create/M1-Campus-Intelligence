import React from 'react';
import { CheckCircle2, Clock, Wrench, AlertCircle, Users, GitFork } from 'lucide-react';

export default function StatusTimeline({ logs = [], currentStatus }) {
  if (!logs || logs.length === 0) {
    return (
      <div className="text-center py-6 text-slate-400 text-sm">
        No lifecycle events recorded yet.
      </div>
    );
  }

  const getLogIcon = (action) => {
    const act = (action || '').toLowerCase();
    if (act.includes('created')) return CheckCircle2;
    if (act.includes('cluster') || act.includes('group')) return GitFork;
    if (act.includes('triage') || act.includes('reclass')) return Users;
    if (act.includes('status')) return Clock;
    return Wrench;
  };

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {logs.map((log, idx) => {
          const Icon = getLogIcon(log.action);
          const isLast = idx === logs.length - 1;
          const formattedDate = new Date(log.timestamp).toLocaleString('en-IN', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <li key={log.id || idx}>
              <div className="relative pb-8">
                {!isLast && (
                  <span
                    className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-200"
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex space-x-3">
                  <div>
                    <span className="h-8 w-8 rounded-full bg-brand-50 border-2 border-brand-500 flex items-center justify-center ring-4 ring-white">
                      <Icon className="h-4 w-4 text-brand-600" />
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                    <div>
                      <p className="text-sm font-bold text-slate-800">
                        {log.action}
                        <span className="ml-2 font-normal text-xs text-slate-500">
                          by <span className="font-semibold text-slate-700">{log.performed_by}</span>
                        </span>
                      </p>
                      {log.note && (
                        <p className="mt-1 text-xs text-slate-600 bg-slate-50 border border-slate-100 rounded p-2">
                          {log.note}
                        </p>
                      )}
                    </div>
                    <div className="whitespace-nowrap text-right text-xs text-slate-400">
                      <time dateTime={log.timestamp}>{formattedDate}</time>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
