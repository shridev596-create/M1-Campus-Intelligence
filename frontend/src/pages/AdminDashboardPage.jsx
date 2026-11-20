import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  GitFork, 
  ShieldCheck, 
  Clock 
} from 'lucide-react';
import { api } from '../services/api';
import DepartmentQueueTable from '../components/admin/DepartmentQueueTable';
import TriageModal from '../components/admin/TriageModal';
import ClusterDetailsModal from '../components/admin/ClusterDetailsModal';

export default function AdminDashboardPage() {
  const [complaints, setComplaints] = useState([]);
  const [clusters, setClusters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  // Modals state
  const [triageComplaint, setTriageComplaint] = useState(null);
  const [selectedCluster, setSelectedCluster] = useState(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [compList, clusterList] = await Promise.all([
        api.getComplaints(),
        api.getClusters(),
      ]);
      setComplaints(compList || []);
      setClusters(clusterList || []);
    } catch (err) {
      showNotification('error', err.message || 'Failed to load queues.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      await api.updateComplaintStatus(ticketId, newStatus, `Status updated to ${newStatus} by admin.`);
      showNotification('success', `Ticket ${ticketId} status updated to ${newStatus}.`);
      fetchData();
    } catch (err) {
      showNotification('error', err.message || 'Failed to update status.');
    }
  };

  const handleTriageSubmitted = async (ticketId, triageData) => {
    try {
      await api.humanTriageComplaint(ticketId, triageData);
      showNotification('success', `Ticket ${ticketId} successfully triaged and routed to ${triageData.department}!`);
      fetchData();
    } catch (err) {
      showNotification('error', err.message || 'Triage reclassification failed.');
    }
  };

  const handleClusterStatusUpdate = async (clusterId, newStatus) => {
    try {
      await api.updateClusterStatus(clusterId, newStatus);
      showNotification('success', `Cluster #${clusterId} and all grouped tickets updated to ${newStatus}!`);
      fetchData();
    } catch (err) {
      showNotification('error', err.message || 'Cluster update failed.');
    }
  };

  const handleOpenClusterModal = (clusterId) => {
    const found = clusters.find(c => c.id === clusterId);
    if (found) {
      setSelectedCluster(found);
    } else {
      // Fallback: assemble cluster object from complaints
      const related = complaints.filter(c => c.cluster_id === clusterId);
      if (related.length > 0) {
        setSelectedCluster({
          id: clusterId,
          cluster_title: `Cluster #${clusterId}`,
          department_code: related[0].department,
          building_name: related[0].building,
          status: related[0].status,
          complaints: related
        });
      }
    }
  };

  // Metric counts
  const total = complaints.length;
  const inProgress = complaints.filter(c => c.status === 'In Progress').length;
  const needsReview = complaints.filter(c => c.needs_human_review).length;
  const totalClusters = clusters.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <LayoutDashboard className="w-7 h-7 text-brand-600" />
            <span>Admin Operations & Department Queues</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time complaint triage, department workload distribution, and duplicate cluster resolution.
          </p>
        </div>

        <button
          onClick={fetchData}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-brand-600' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className={`p-4 rounded-xl border text-xs font-semibold flex items-center justify-between animate-in fade-in duration-200 ${
          notification.type === 'success'
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
            : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>
      )}

      {/* Quick Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Complaints</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">{total}</span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Across 6 departments</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">In Progress</span>
          <span className="text-2xl font-black text-indigo-600 mt-1 block">{inProgress}</span>
          <span className="text-[11px] text-indigo-700 mt-0.5 block">Work orders assigned</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Needs Human Triage</span>
          <span className="text-2xl font-black text-amber-600 mt-1 block">{needsReview}</span>
          <span className="text-[11px] text-amber-700 mt-0.5 block">Low confidence &lt; 75%</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Active Clusters</span>
          <span className="text-2xl font-black text-purple-600 mt-1 block">{totalClusters}</span>
          <span className="text-[11px] text-purple-700 mt-0.5 block">Grouped duplicate issues</span>
        </div>
      </div>

      {/* Department Queues Table */}
      <DepartmentQueueTable
        complaints={complaints}
        isLoading={isLoading}
        onStatusChange={handleStatusChange}
        onOpenTriage={(comp) => setTriageComplaint(comp)}
        onOpenCluster={handleOpenClusterModal}
        onRefresh={fetchData}
      />

      {/* Human Triage Modal */}
      {triageComplaint && (
        <TriageModal
          complaint={triageComplaint}
          isOpen={!!triageComplaint}
          onClose={() => setTriageComplaint(null)}
          onTriageSubmitted={handleTriageSubmitted}
        />
      )}

      {/* Cluster Details Modal */}
      {selectedCluster && (
        <ClusterDetailsModal
          cluster={selectedCluster}
          isOpen={!!selectedCluster}
          onClose={() => setSelectedCluster(null)}
          onUpdateClusterStatus={handleClusterStatusUpdate}
        />
      )}
    </div>
  );
}
