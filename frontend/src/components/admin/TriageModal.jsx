import React, { useState } from 'react';
import { X, CheckCircle2, AlertTriangle, ShieldCheck, UserCheck } from 'lucide-react';
import { DepartmentBadge, UrgencyBadge, LanguageBadge } from '../common/Badge';

const DEPARTMENTS = ["Plumbing", "Electrical", "Wi-Fi", "Mess", "Academic", "Other"];
const URGENCIES = ["Low", "Medium", "High", "Critical"];

export default function TriageModal({ complaint, isOpen, onClose, onTriageSubmitted }) {
  if (!isOpen || !complaint) return null;

  const [department, setDepartment] = useState(complaint.department || 'Other');
  const [urgency, setUrgency] = useState(complaint.urgency || 'Medium');
  const [building, setBuilding] = useState(complaint.building || '');
  const [floor, setFloor] = useState(complaint.floor || '');
  const [specificLocation, setSpecificLocation] = useState(complaint.specific_location || '');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const payload = {
        department,
        urgency,
        building: building.trim() || null,
        floor: floor.trim() || null,
        specific_location: specificLocation.trim() || null,
        notes: notes.trim() || 'Verified by Human Triage admin.',
        performed_by: 'Staff Admin',
      };
      await onTriageSubmitted(complaint.ticket_id, payload);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit triage reclassification.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-brand-400" />
            <h3 className="font-bold text-base">Human Triage Review · {complaint.ticket_id}</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* AI Reason for Review */}
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Flagged for Uncertain AI Prediction</p>
              <p className="mt-0.5">
                AI Confidence: <strong>{Math.round(complaint.confidence_score * 100)}%</strong>. 
                {complaint.confidence_reason ? ` Reason: ${complaint.confidence_reason}` : ' Ambiguous phrasing or department detected.'}
              </p>
            </div>
          </div>

          {/* Student Original Input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Raw Student Text
              </label>
              <LanguageBadge lang={complaint.detected_language} />
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 font-medium">
              "{complaint.raw_text}"
            </div>
          </div>

          {/* Department Selection */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              Assign Correct Department <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {DEPARTMENTS.map((dept) => (
                <button
                  type="button"
                  key={dept}
                  onClick={() => setDepartment(dept)}
                  className={`py-2 px-3 text-xs font-bold rounded-lg border text-center transition-all ${
                    department === dept
                      ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>
          </div>

          {/* Urgency & Building */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">Urgency Level</label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium text-slate-800 focus:ring-1 focus:ring-brand-500"
              >
                {URGENCIES.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">Building Location</label>
              <input
                type="text"
                value={building}
                onChange={(e) => setBuilding(e.target.value)}
                placeholder="e.g. Hostel 3 (Girls)"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Floor & Specific Location */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">Floor</label>
              <input
                type="text"
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                placeholder="e.g. 2nd Floor"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">Specific Room/Area</label>
              <input
                type="text"
                value={specificLocation}
                onChange={(e) => setSpecificLocation(e.target.value)}
                placeholder="e.g. Room 214 washroom"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Admin Verification Notes */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              Triage Verification Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="e.g. Verified with hostel warden. Issue is related to electrical power supply."
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 focus:ring-1 focus:ring-brand-500"
            />
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
              {error}
            </p>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Routing...' : 'Confirm & Route to Queue'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
