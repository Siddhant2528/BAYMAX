import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  CalendarClock, User, Clock, Check, X, Calendar,
  ChevronDown, RefreshCw, AlertCircle, Building2, Shield, Link2, Video, Phone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { appointments } from '../services/api';

/* ─── Severity Helpers ───────────────────────────────────────────── */
const SEVERITY_META = {
  minimal:           { label: 'Minimal',    bg: '#d1fae5', text: '#065f46', dot: '#10b981' },
  mild:              { label: 'Mild',        bg: '#fef3c7', text: '#78350f', dot: '#f59e0b' },
  moderate:          { label: 'Moderate',    bg: '#ffedd5', text: '#7c2d12', dot: '#f97316' },
  moderately_severe: { label: 'Mod. Severe', bg: '#fee2e2', text: '#7f1d1d', dot: '#ef4444' },
  severe:            { label: 'Severe',      bg: '#fecdd3', text: '#881337', dot: '#dc2626' },
};
function getSev(sev) {
  return SEVERITY_META[sev] || { label: 'N/A', bg: '#f3f4f6', text: '#374151', dot: '#9ca3af' };
}

function SeverityBadge({ type, score, severity }) {
  const m = getSev(severity);
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black"
      style={{ background: m.bg, color: m.text }}
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: m.dot }} />
      {type}: {score ?? '—'}
      <span className="font-medium opacity-70">({m.label})</span>
    </span>
  );
}

/* ─── Date/Time helpers ──────────────────────────────────────────── */
const getNextDays = () => {
  const dates = [];
  for (let i = 1; i <= 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const yyyy = d.getFullYear();
    const mm   = String(d.getMonth() + 1).padStart(2, '0');
    const dd   = String(d.getDate()).padStart(2, '0');
    dates.push(`${yyyy}-${mm}-${dd}`);
  }
  return dates;
};
const TIMES = ['09:00 AM','10:00 AM','11:00 AM','12:00 PM','01:00 PM','02:00 PM','03:00 PM','04:00 PM'];
const to24h = (t12) => {
  const [time, period] = t12.split(' ');
  let [h, m] = time.split(':');
  if (h === '12' && period === 'AM') h = '00';
  if (h !== '12' && period === 'PM') h = String(Number(h) + 12);
  return `${h}:${m}:00`;
};

/* ─── Meeting Link Input ─────────────────────────────────────────── */
function MeetingLinkInput({ value, onChange }) {
  const isGoogle = value?.includes('meet.google');
  const isZoom   = value?.includes('zoom.us');
  const isValid  = value && (isGoogle || isZoom || value.startsWith('https://'));

  return (
    <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3">
      <p className="text-xs font-black text-indigo-700 mb-2 flex items-center gap-1.5">
        <Video className="w-3.5 h-3.5" />
        Meeting Link (Google Meet / Zoom)
      </p>
      <div className="relative">
        <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
        <input
          type="url"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="https://meet.google.com/... or https://zoom.us/j/..."
          className="w-full pl-9 pr-3 py-2 rounded-lg border border-indigo-200 text-sm font-medium bg-white outline-none focus:ring-2 focus:ring-indigo-400 placeholder-gray-400"
        />
      </div>
      {value && (
        <p className={`text-xs mt-1.5 font-semibold ${isValid ? 'text-emerald-600' : 'text-amber-600'}`}>
          {isGoogle ? '✅ Google Meet link detected'
            : isZoom ? '✅ Zoom link detected'
            : isValid ? '✅ Custom meeting URL'
            : '⚠️ Please paste a valid https:// link'}
        </p>
      )}
    </div>
  );
}

/* ─── Single Request Card ────────────────────────────────────────── */
function RequestCard({ req, onConfirm, onReschedule, isProcessing }) {
  const [showReschedule, setShowReschedule] = useState(false);
  const [meetingLink, setMeetingLink]       = useState('');
  const [newDate, setNewDate]               = useState('');
  const [newTime, setNewTime]               = useState('');

  // PostgreSQL returns TIMESTAMP WITHOUT TIME ZONE without 'Z' suffix.
  // Appending 'Z' ensures the browser treats it as UTC and converts to local IST correctly.
  const parseUTC = (str) => new Date(str && !str.endsWith('Z') ? str + 'Z' : str);
  const reqDate = parseUTC(req.appointment_date);

  const handleAccept = () => {
    onConfirm(req.id, meetingLink.trim() || null);
  };

  const handleRescheduleSubmit = () => {
    if (!newDate || !newTime) {
      alert('Please select both a date and a time slot.');
      return;
    }
    const pad = (n) => String(n).padStart(2, '0');
    const [hh, mm] = to24h(newTime).split(':');
    const iso = `${newDate}T${pad(hh)}:${pad(mm)}:00+05:30`;
    onReschedule(req.id, iso, meetingLink.trim() || null);
    setShowReschedule(false);
    setNewDate('');
    setNewTime('');
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="bg-white border border-gray-200 shadow-sm rounded-2xl overflow-hidden"
    >
      {/* top accent */}
      <div className="h-1.5 bg-gradient-to-r from-purple-500 to-indigo-500" />

      <div className="p-5 space-y-4">

        {/* Student identity row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="bg-purple-100 p-2.5 rounded-xl flex-shrink-0">
              <User className="w-5 h-5 text-purple-600" />
            </div>
            <div className="min-w-0">
              <p className="font-black text-gray-900 text-base truncate">
                {req.student_name || `Student #${String(req.student_id).slice(0, 6)}`}
              </p>
              <p className="text-sm text-gray-500 font-medium truncate">{req.student_email || ''}</p>
              {req.department && (
                <div className="flex items-center gap-1 mt-0.5">
                  <Building2 className="w-3 h-3 text-purple-400 flex-shrink-0" />
                  <p className="text-xs text-purple-600 font-semibold truncate">{req.department}</p>
                </div>
              )}
            </div>
          </div>
          <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-black uppercase tracking-widest rounded-full flex-shrink-0">
            Pending
          </span>
        </div>

        {/* Assessment scores */}
        <div className="flex gap-2 flex-wrap">
          <SeverityBadge type="PHQ9" score={req.phq9_score} severity={req.phq9_severity} />
          <SeverityBadge type="GAD7" score={req.gad7_score} severity={req.gad7_severity} />
        </div>

        {/* Guardian phone */}
        {req.guardian_phone && (
          <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
            <Shield className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
            <span className="text-xs font-black text-rose-800">
              Guardian: {req.guardian_phone}
            </span>
          </div>
        )}

        {/* Student contact */}
        {req.student_contact && (
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-3 py-2">
            <Phone className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
            <span className="text-xs font-black text-blue-800">
              Student: {req.student_contact}
            </span>
          </div>
        )}

        {/* Requested time */}
        <div className="flex items-center gap-3 bg-purple-50 border border-purple-100 rounded-xl px-4 py-3">
          <Clock className="w-4 h-4 text-purple-500 flex-shrink-0" />
          <div>
            <p className="text-xs text-purple-400 font-semibold uppercase tracking-wide">Requested Slot</p>
            <p className="text-sm font-black text-purple-800">
              {reqDate.toLocaleDateString('en-IN', {
                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
              })}{' '}
              at {reqDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>

        {/* Mode */}
        {req.mode && (
          <span className={`inline-flex items-center text-xs font-bold px-3 py-1 rounded-full ${
            req.mode === 'online' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
          }`}>
            {req.mode === 'online' ? '🖥 Online Session' : '🏢 In-Person Session'}
          </span>
        )}

        {/* ── Meeting Link Input (always visible for online sessions) ── */}
        <MeetingLinkInput value={meetingLink} onChange={setMeetingLink} />

        {/* Reschedule panel */}
        <AnimatePresence>
          {showReschedule && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: 'hidden' }}
            >
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <div className="flex justify-between items-center mb-3">
                  <p className="font-bold text-blue-900 flex items-center gap-2 text-sm">
                    <ChevronDown className="w-4 h-4" /> Pick a new time slot
                  </p>
                  <button onClick={() => setShowReschedule(false)} className="text-blue-400 hover:text-blue-600 transition">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <select
                  value={newDate}
                  onChange={e => setNewDate(e.target.value)}
                  className="w-full mb-3 p-2.5 rounded-xl border border-blue-200 outline-none font-medium text-sm bg-white"
                >
                  <option value="">Select date…</option>
                  {getNextDays().map(d => (
                    <option key={d} value={d}>
                      {new Date(d).toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })}
                    </option>
                  ))}
                </select>

                <select
                  value={newTime}
                  onChange={e => setNewTime(e.target.value)}
                  className="w-full mb-4 p-2.5 rounded-xl border border-blue-200 outline-none font-medium text-sm bg-white"
                >
                  <option value="">Select time…</option>
                  {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>

                <button
                  onClick={handleRescheduleSubmit}
                  disabled={isProcessing}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-2 text-sm"
                >
                  {isProcessing
                    ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <Check className="w-4 h-4" />}
                  Confirm &amp; Notify Student
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action buttons */}
        {!showReschedule && (
          <div className="flex gap-2 pt-1 border-t border-gray-100">
            <button
              onClick={handleAccept}
              disabled={isProcessing}
              className="flex-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 py-2.5 rounded-xl font-bold transition flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
            >
              {isProcessing
                ? <div className="w-4 h-4 border-2 border-emerald-300 border-t-emerald-700 rounded-full animate-spin" />
                : <Check className="w-4 h-4" />}
              Accept &amp; Notify
            </button>
            <button
              onClick={() => setShowReschedule(true)}
              disabled={isProcessing}
              className="flex-1 bg-white text-blue-700 hover:bg-blue-50 border border-blue-200 py-2.5 rounded-xl font-bold transition flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
            >
              <Clock className="w-4 h-4" /> Reschedule
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ─── Main RequestsSection ───────────────────────────────────────── */
export default function RequestsSection({ onUpdate }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [processing, setProcessing] = useState(null);

  const onUpdateRef = useRef(onUpdate);
  useEffect(() => { onUpdateRef.current = onUpdate; });

  const fetchRequests = useCallback(() => {
    setLoading(true);
    setError(null);
    appointments.getCounselorAppointments()
      .then(res => {
        const data = res.data?.data || [];
        const pending = Array.isArray(data) ? data.filter(a => a.status === 'pending') : [];
        setRequests(pending);
        onUpdateRef.current?.(pending.length);
      })
      .catch(err => {
        const msg = err.response?.data?.message || err.message || 'Failed to load requests';
        setError(msg);
        console.error('[RequestsSection]', err);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const handleConfirm = async (id, meetingLink) => {
    try {
      setProcessing(id);
      await appointments.updateStatus(id, { status: 'confirmed', meetingLink });
      fetchRequests();
    } catch (e) {
      console.error(e);
      alert('Could not confirm. Please try again.');
    } finally {
      setProcessing(null);
    }
  };

  const handleReschedule = async (id, newDateISO, meetingLink) => {
    try {
      setProcessing(id);
      await appointments.updateStatus(id, { status: 'confirmed', appointmentDate: newDateISO, meetingLink });
      fetchRequests();
    } catch (e) {
      console.error(e);
      alert('Could not reschedule. Please try again.');
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">

      {/* ── Header ── */}
      <div
        className="px-6 py-5 flex items-center justify-between border-b border-purple-100"
        style={{ background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)' }}
      >
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-purple-600" />
            Session Requests
          </h2>
          <p className="text-xs text-purple-400 font-medium mt-0.5">
            Incoming appointment requests — attach a meeting link, then accept or reschedule
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchRequests}
            className="p-2 rounded-xl bg-white border border-purple-200 text-purple-500 hover:bg-purple-50 transition"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <span className={`text-sm font-bold py-1.5 px-4 rounded-full border shadow-sm flex items-center gap-1.5 ${
            requests.length > 0
              ? 'bg-amber-100 text-amber-700 border-amber-200 animate-pulse'
              : 'bg-white text-gray-500 border-gray-200'
          }`}>
            {requests.length > 0 && <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />}
            {requests.length} Pending
          </span>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="p-6 max-h-[72vh] overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-14">
            <AlertCircle className="w-12 h-12 text-rose-300 mx-auto mb-3" />
            <p className="text-rose-600 font-bold mb-1">Failed to load requests</p>
            <p className="text-gray-400 text-sm mb-4">{error}</p>
            <button
              onClick={fetchRequests}
              className="px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-bold hover:bg-purple-700 transition"
            >
              Try Again
            </button>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-16">
            <Calendar className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-bold text-lg mb-1">No Pending Requests</p>
            <p className="text-gray-300 text-sm">No student appointment requests at the moment.</p>
          </div>
        ) : (
          <div className="space-y-5">
            <AnimatePresence>
              {requests.map(req => (
                <RequestCard
                  key={req.id}
                  req={req}
                  onConfirm={handleConfirm}
                  onReschedule={handleReschedule}
                  isProcessing={processing === req.id}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
