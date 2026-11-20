/**
 * API service for communicating with the FastAPI backend.
 * Uses relative URL '/api' so it works seamlessly both via Vite proxy and in production.
 */

const API_BASE = '/api';

async function handleResponse(response) {
  if (!response.ok) {
    let errorDetail = 'An unexpected error occurred.';
    try {
      const errorData = await response.json();
      if (errorData.detail) {
        if (typeof errorData.detail === 'string') {
          errorDetail = errorData.detail;
        } else if (Array.isArray(errorData.detail)) {
          errorDetail = errorData.detail.map(d => `${d.loc?.slice(-1)[0] || 'Field'}: ${d.msg}`).join(', ');
        }
      }
    } catch (e) {
      errorDetail = `HTTP ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorDetail);
  }
  return await response.json();
}

export const api = {
  // Public Complaint endpoints
  async submitComplaint(data) {
    const res = await fetch(`${API_BASE}/complaints/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async previewComplaint(rawText) {
    const res = await fetch(`${API_BASE}/complaints/preview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ raw_text: rawText }),
    });
    return handleResponse(res);
  },

  async trackComplaint(ticketId) {
    const res = await fetch(`${API_BASE}/complaints/track/${encodeURIComponent(ticketId)}`);
    return handleResponse(res);
  },

  // Admin endpoints
  async getComplaints(filters = {}) {
    const params = new URLSearchParams();
    if (filters.department && filters.department !== 'All') params.append('department', filters.department);
    if (filters.status && filters.status !== 'All') params.append('status', filters.status);
    if (filters.urgency && filters.urgency !== 'All') params.append('urgency', filters.urgency);
    if (filters.needs_review !== undefined && filters.needs_review !== null) params.append('needs_review', filters.needs_review);
    if (filters.cluster_id) params.append('cluster_id', filters.cluster_id);
    if (filters.search) params.append('search', filters.search);

    const res = await fetch(`${API_BASE}/admin/complaints?${params.toString()}`);
    return handleResponse(res);
  },

  async getComplaintDetail(ticketId) {
    const res = await fetch(`${API_BASE}/admin/complaints/${encodeURIComponent(ticketId)}`);
    return handleResponse(res);
  },

  async updateComplaintStatus(ticketId, status, adminNotes = '', performedBy = 'Admin') {
    const res = await fetch(`${API_BASE}/admin/complaints/${encodeURIComponent(ticketId)}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, admin_notes: adminNotes, performed_by: performedBy }),
    });
    return handleResponse(res);
  },

  async humanTriageComplaint(ticketId, triageData) {
    const res = await fetch(`${API_BASE}/admin/complaints/${encodeURIComponent(ticketId)}/triage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(triageData),
    });
    return handleResponse(res);
  },

  async getClusters() {
    const res = await fetch(`${API_BASE}/admin/clusters`);
    return handleResponse(res);
  },

  async updateClusterStatus(clusterId, status, performedBy = 'Admin') {
    const res = await fetch(`${API_BASE}/admin/clusters/${clusterId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, performed_by: performedBy }),
    });
    return handleResponse(res);
  },

  async getDepartments() {
    const res = await fetch(`${API_BASE}/admin/departments`);
    return handleResponse(res);
  },

  // Analytics & Heatmap endpoints
  async getHeatmap() {
    const res = await fetch(`${API_BASE}/analytics/heatmap`);
    return handleResponse(res);
  },

  async getAnalyticsOverview() {
    const res = await fetch(`${API_BASE}/analytics/overview`);
    return handleResponse(res);
  },
};
