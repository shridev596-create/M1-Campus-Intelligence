import React, { useState } from 'react';
import { 
  Send, 
  Sparkles, 
  AlertCircle, 
  Building2, 
  Clock, 
  MapPin, 
  AlertTriangle, 
  User, 
  Mail, 
  Phone,
  HelpCircle,
  CheckCircle2
} from 'lucide-react';
import { api } from '../../services/api';
import { DepartmentBadge, UrgencyBadge, LanguageBadge } from '../common/Badge';

const SAMPLE_CHIPS = [
  {
    label: "🚰 Hinglish: Hostel 3 Water Issue",
    text: "Hostel 3 2nd floor washroom me paani nahi aa raha 2 din se, taps are dry please fix urgently."
  },
  {
    label: "⚡ Hinglish: Dangerous Switchboard Spark",
    text: "Hostel 1 room 14 mein switchboard me current aa raha hai shock laga danger emergency!"
  },
  {
    label: "🍛 Hindi: Mess Quality Issue",
    text: "मेस 2 में रात का खाना बहुत ही ठंडा और बासी था, कई छात्रों का पेट खराब हुआ है।"
  },
  {
    label: "📶 English: Wi-Fi Downtime",
    text: "Girls Hostel 4 Wi-Fi router red light is blinking and not connecting since morning."
  },
  {
    label: "❓ Vague Complaint (Needs Human Triage)",
    text: "College me kuch bhi sahi se kaam nahi kar raha sab bekaar hai"
  }
];

const TIME_SLOTS = [
  { id: "Morning (9 AM - 12 PM)", label: "🌅 Morning", time: "9:00 AM – 12:00 PM" },
  { id: "Afternoon (2 PM - 5 PM)", label: "☀️ Afternoon", time: "2:00 PM – 5:00 PM" },
  { id: "Evening (5 PM - 8 PM)", label: "🌆 Evening", time: "5:00 PM – 8:00 PM" },
  { id: "Anytime / Emergency", label: "⚡ Anytime", time: "Urgent visit" },
];

export default function ComplaintForm({ onComplaintSubmitted }) {
  const [rawText, setRawText] = useState('');
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentPhone, setStudentPhone] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('Evening (5 PM - 8 PM)');
  const [showOptionalFields, setShowOptionalFields] = useState(false);

  // Preview state
  const [preview, setPreview] = useState(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handlePreview = async () => {
    if (rawText.trim().length < 5) {
      setError('Please type at least 5 characters to analyze.');
      return;
    }
    setError(null);
    setIsPreviewLoading(true);
    try {
      const result = await api.previewComplaint(rawText);
      setPreview(result);
    } catch (err) {
      setError(err.message || 'Failed to analyze text.');
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rawText.trim().length < 5) {
      setError('Please provide a complaint description of at least 5 characters.');
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      const payload = {
        raw_text: rawText.trim(),
        student_name: studentName.trim() || null,
        student_email: studentEmail.trim() || null,
        student_phone: studentPhone.trim() || null,
        preferred_time_slot: selectedTimeSlot,
      };
      const createdComplaint = await api.submitComplaint(payload);
      onComplaintSubmitted(createdComplaint);
    } catch (err) {
      setError(err.message || 'Submission failed. Please check network or try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const applySampleChip = (sample) => {
    setRawText(sample.text);
    setError(null);
    // Auto-trigger preview
    setIsPreviewLoading(true);
    api.previewComplaint(sample.text)
      .then(res => setPreview(res))
      .catch(() => {})
      .finally(() => setIsPreviewLoading(false));
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
      <div className="mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <span>Campus Grievance Portal</span>
          <span className="text-xs bg-brand-100 text-brand-800 font-semibold px-2.5 py-0.5 rounded-full">
            AI Routed
          </span>
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          Submit your issue in <strong>Hinglish, Hindi, or English</strong>. Our AI automatically extracts department, urgency, and location.
        </p>
      </div>

      {/* Quick Test Samples */}
      <div className="mb-6">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
          Try Quick Examples:
        </label>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_CHIPS.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => applySampleChip(chip)}
              className="text-xs font-medium bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-slate-700 border border-slate-200 hover:border-brand-200 px-3 py-1.5 rounded-lg transition-colors text-left"
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Unable to proceed</p>
            <p className="text-xs mt-0.5">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Complaint Text Area */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
              <span>Describe your issue</span>
              <span className="text-red-500">*</span>
            </label>
            <span className="text-xs text-slate-400 font-medium">
              {rawText.length} characters
            </span>
          </div>

          <textarea
            value={rawText}
            onChange={(e) => {
              setRawText(e.target.value);
              if (preview) setPreview(null); // Reset preview on edit
            }}
            rows={4}
            placeholder="e.g. 'Hostel 3 2nd floor washroom me paani nahi aa raha 2 din se, please solve immediately' ya 'Library AC is not working'..."
            className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-slate-900 placeholder:text-slate-400 text-sm transition-all shadow-inner"
            required
          />

          <div className="mt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={handlePreview}
              disabled={isPreviewLoading || rawText.trim().length < 5}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {isPreviewLoading ? 'Analyzing Hinglish...' : 'Preview AI Routing'}
            </button>
            <span className="text-xs text-slate-400">
              Works in Hinglish, Hindi & English
            </span>
          </div>
        </div>

        {/* Live AI Preview Card */}
        {preview && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-slate-50 to-brand-50/30 border border-brand-200/80 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-600" />
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  AI Real-Time Extraction
                </span>
              </div>
              <div className="flex items-center gap-2">
                <LanguageBadge lang={preview.detected_language} />
                <span className="text-xs font-semibold text-slate-500">
                  Confidence: {Math.round(preview.confidence_score * 100)}%
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-3">
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-400 font-medium block">Department</span>
                <div className="mt-1">
                  <DepartmentBadge dept={preview.department} />
                </div>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-400 font-medium block">Urgency</span>
                <div className="mt-1">
                  <UrgencyBadge level={preview.urgency} />
                </div>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-400 font-medium block">Building & Floor</span>
                <span className="font-semibold text-slate-800 block mt-1 truncate">
                  {preview.building || 'Not specified'} {preview.floor ? `(${preview.floor})` : ''}
                </span>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-400 font-medium block">Duration</span>
                <span className="font-semibold text-slate-800 block mt-1">
                  {preview.duration || 'Not specified'}
                </span>
              </div>
            </div>

            {preview.english_summary && (
              <p className="text-xs text-slate-600 bg-white/70 p-2 rounded border border-slate-200/60 mb-2">
                <span className="font-semibold text-slate-700">Admin Summary:</span> {preview.english_summary}
              </p>
            )}

            {preview.needs_human_review && (
              <div className="flex items-center gap-2 text-[11px] text-amber-700 bg-amber-50 p-2 rounded border border-amber-200">
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Low confidence prediction ({Math.round(preview.confidence_score * 100)}%). This will be reviewed by human triage staff.</span>
              </div>
            )}
          </div>
        )}

        {/* Optional Student Contact Details Toggle */}
        <div className="pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setShowOptionalFields(!showOptionalFields)}
            className="text-xs font-semibold text-slate-600 hover:text-slate-800 flex items-center gap-1"
          >
            <span>{showOptionalFields ? '− Hide' : '+ Add'} student contact info for updates (optional)</span>
          </button>

          {showOptionalFields && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">Your Name</label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">Email</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                    placeholder="student@campus.edu"
                    className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">Phone</label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={studentPhone}
                    onChange={(e) => setStudentPhone(e.target.value)}
                    placeholder="+91 9876543210"
                    className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Time Slot Picker */}
        <div className="pt-4 border-t border-slate-100">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 mb-3">
            <Clock className="w-3.5 h-3.5 text-brand-500" />
            <span>When can the technician visit?</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {TIME_SLOTS.map((slot) => (
              <button
                type="button"
                key={slot.id}
                onClick={() => setSelectedTimeSlot(slot.id)}
                className={`py-2.5 px-3 rounded-xl border text-xs font-semibold text-center transition-all focus:outline-none ${
                  selectedTimeSlot === slot.id
                    ? 'bg-brand-600 text-white border-brand-700 shadow-sm ring-2 ring-brand-400 ring-offset-1'
                    : 'bg-slate-50 hover:bg-brand-50 hover:border-brand-200 text-slate-700 border-slate-200'
                }`}
              >
                <span className="block text-lg mb-0.5">{slot.label.split(' ')[0]}</span>
                <span className="block font-bold">{slot.label.split(' ').slice(1).join(' ')}</span>
                <span className="block text-[10px] opacity-70 mt-0.5">{slot.time}</span>
              </button>
            ))}
          </div>
          {selectedTimeSlot && (
            <p className="text-[11px] text-brand-600 font-semibold mt-2 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Preferred slot: <span className="font-bold">{selectedTimeSlot}</span>
            </p>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end pt-2">
          <button
            type="submit"
            disabled={isSubmitting || rawText.trim().length < 5}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-md shadow-brand-500/20 transition-all disabled:opacity-50 hover:shadow-lg"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Submitting & Routing...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Submit Complaint</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
