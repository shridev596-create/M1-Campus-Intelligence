import React, { useState } from 'react';
import { X, GitFork, CheckCircle2, Clock, Building2, AlertCircle } from 'lucide-react';
import { DepartmentBadge, StatusBadge, UrgencyBadge } from '../common/Badge';

export default function ClusterDetailsModal({ cluster, isOpen, onClose, onUpdateClusterStatus }) {
  if (!isOpen || !cluster) return null;

  const [newStatus, setNewStatus] = useState(cluster.status || 'Open');
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);

  const handleUpdate = async () => {
    setIsUpdating(true);
    setError(null);
    try {
      await onUpdateClusterStatus(cluster.id, newStatus);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update cluster status.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-purple-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitFork className="w-5 h-5 text-purple-300" />
            <div>
              <h3 className="font-bold text-base">Master Incident Cluster #{cluster.id}</h3>
              <p className="text-xs text-purple-200">{cluster.cluster_title}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-purple-300 hover:text-white p-1 rounded-lg hover:bg-purple-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Metadata bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3">
              <DepartmentBadge dept={cluster.department_code} />
              <div className="flex items-center gap-1 text-xs font-bold text-slate-700">
                <Building2 className="w-4 h-4 text-slate-400" />
                <span>{cluster.building_name || 'Campus Wide'}</span>
              </div>
            </div>
            <StatusBadge status={cluster.status} />
          </div>

          {/* Grouped Complaints List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Grouped Student Complaints ({cluster.complaints ? cluster.complaints.length : 0})
              </h4>
              <span className="text-xs text-purple-700 font-semibold bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                Similarity Clustered
              </span>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2.5 pr-1">
              {cluster.complaints && cluster.complaints.length > 0 ? (
                cluster.complaints.map((c) => (
                  <div key={c.id} className="p-3 bg-white rounded-lg border border-slate-200 shadow-sm text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono font-bold text-brand-600">{c.ticket_id}</span>
                      <div className="flex items-center gap-2">
                        <UrgencyBadge level={c.urgency} />
                        <StatusBadge status={c.status} />
                      </div>
                    </div>
                    <p className="text-slate-800 font-medium">"{c.raw_text}"</p>
                    <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                      <span>By: {c.student_name || 'Anonymous Student'}</span>
                      <span>{c.building} {c.floor ? `· ${c.floor}` : ''}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 py-3 text-center">No individual complaints loaded.</p>
              )}
            </div>
          </div>

          {/* Bulk Action Controls */}
          <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-100 space-y-3">
            <label className="text-xs font-bold text-purple-900 block">
              Bulk Status Action (Applies to Cluster & All {cluster.complaints?.length || 0} Grouped Tickets)
            </label>
            <div className="flex items-center gap-3">
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-800 focus:ring-1 focus:ring-purple-500 bg-white"
              >
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved (Close All)</option>
              </select>

              <button
                type="button"
                onClick={handleUpdate}
                disabled={isUpdating}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isUpdating ? 'Updating Group...' : 'Apply Bulk Update'}</span>
              </button>
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
              {error}
            </p>
          )}

          {/* Footer */}
          <div className="flex justify-end pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
