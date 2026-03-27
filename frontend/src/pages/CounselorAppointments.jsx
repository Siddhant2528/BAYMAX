import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarDays, Clock, Search, X,
  Link2, Video, RefreshCw, AlertCircle,
  CheckCircle2, Building2, Shield, Loader2
} from 'lucide-react';
import { appointments } from '../services/api';

/* ── Helpers ─────────────────────────────────────────────── */
const parseUTC = (str) => new Date(str && !str.endsWith('Z') ? str + 'Z' : str);

function formatDateTime(str) {
  const d = parseUTC(str);
  return {
    date: d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
    time: d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
  };
}

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
      {type}: {score ?? '—'} <span className="font-medium opacity-70">({m.label})</span>
    </span>
  );
}

/* ── Appointment Card ────────────────────────────────────── */
function AppointmentCard({ appt, index }) {
  const { date, time } = formatDateTime(appt.appointment_date);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className='bg-white rounded-2xl border-2 border-[#DCEAFF] shadow-sm hover:border-emerald-300 hover:shadow-md transition-all overflow-hidden'
    >
      {/* top stripe */}
      <div className='h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500' />

      <div className='p-5 space-y-4'>
        {/* Student identity row */}
        <div className='flex items-start justify-between gap-3'>
          <div className='flex items-center gap-3 min-w-0'>
            <div className='w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 font-black text-base flex-shrink-0'>
              {appt.student_name?.[0]?.toUpperCase() || '?'}
            </div>
            <div className='min-w-0'>
              <p className='font-black text-gray-900 text-base truncate'>
                {appt.student_name || `Student #${String(appt.student_id).slice(0, 6)}`}
              </p>
              <p className='text-sm text-gray-400 font-medium truncate'>{appt.student_email || ''}</p>
              {appt.department && (
                <div className='flex items-center gap-1 mt-0.5'>
                  <Building2 className='w-3 h-3 text-emerald-400 flex-shrink-0' />
                  <p className='text-xs text-emerald-600 font-semibold truncate'>{appt.department}</p>
                </div>
              )}
            </div>
          </div>
          <span className='flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-black uppercase tracking-widest rounded-full flex-shrink-0'>
            <CheckCircle2 className='w-3.5 h-3.5' />
            Confirmed
          </span>
        </div>

        {/* Scores */}
        <div className='flex gap-2 flex-wrap'>
          <SeverityBadge type="PHQ9" score={appt.phq9_score} severity={appt.phq9_severity} />
          <SeverityBadge type="GAD7" score={appt.gad7_score} severity={appt.gad7_severity} />
        </div>

        {/* Guardian */}
        {appt.guardian_phone && (
          <div className='flex items-center gap-2 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2'>
            <Shield className='w-3.5 h-3.5 text-rose-500 flex-shrink-0' />
            <span className='text-xs font-black text-rose-800'>Guardian: {appt.guardian_phone}</span>
          </div>
        )}

        {/* Date/time block */}
        <div className='flex items-center gap-3 bg-[#EEF3FF] border-2 border-[#DCEAFF] rounded-xl px-4 py-3'>
          <Clock className='w-4 h-4 text-blue-500 flex-shrink-0' />
          <div>
            <p className='text-xs text-blue-400 font-semibold uppercase tracking-wide'>Session Scheduled</p>
            <p className='text-sm font-black text-blue-900'>{date} at {time}</p>
          </div>
        </div>

        {/* Mode badge */}
        {appt.mode && (
          <span className={`inline-flex items-center text-xs font-bold px-3 py-1 rounded-full ${
            appt.mode === 'online' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
          }`}>
            {appt.mode === 'online' ? '🖥 Online Session' : '🏢 In-Person Session'}
          </span>
        )}

        {/* Meeting link */}
        {appt.meeting_link && (
          <a
            href={appt.meeting_link}
            target='_blank'
            rel='noopener noreferrer'
            className='flex items-center gap-2.5 bg-indigo-50 border-2 border-indigo-100 text-indigo-700 rounded-xl px-4 py-2.5 hover:bg-indigo-100 hover:border-indigo-200 transition-all group'
          >
            {appt.meeting_link.includes('meet.google') ? (
              <Video className='w-4 h-4 text-indigo-500 flex-shrink-0 group-hover:scale-110 transition-transform' />
            ) : (
              <Link2 className='w-4 h-4 text-indigo-500 flex-shrink-0 group-hover:scale-110 transition-transform' />
            )}
            <span className='text-sm font-bold truncate'>{appt.meeting_link}</span>
          </a>
        )}
      </div>
    </motion.div>
  );
}

/* ── Main Page ───────────────────────────────────────────── */
export default function CounselorAppointments() {
  const [appts, setAppts]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [searchQuery, setSearch] = useState('');

  const fetchAppts = useCallback(() => {
    setLoading(true);
    setError(null);
    appointments.getCounselorAppointments()
      .then(res => {
        const data = res.data?.data || [];
        const confirmed = Array.isArray(data)
          ? data.filter(a => a.status === 'confirmed')
          : [];
        setAppts(confirmed);
      })
      .catch(err => setError(err.response?.data?.message || 'Failed to load appointments'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchAppts(); }, [fetchAppts]);

  const filtered = appts.filter(a =>
    `${a.student_name || ''} ${a.department || ''}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className='max-w-3xl mx-auto pb-20'>

      {/* ── Page Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className='mb-6 rounded-3xl border-2 border-[#DCEAFF] overflow-hidden shadow-sm'
        style={{ background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 50%, #a7f3d0 100%)' }}
      >
        <div className='p-6 sm:p-8 flex items-center justify-between gap-6 flex-wrap'>
          <div className='flex items-center gap-5'>
            <div className='flex-shrink-0 bg-white/60 rounded-2xl p-3 border-2 border-white shadow-sm'>
              <CalendarDays className='w-10 h-10 text-emerald-600' />
            </div>
            <div>
              <p className='text-xs font-black text-emerald-600 uppercase tracking-widest mb-1'>Counselor Portal</p>
              <h1 className='text-2xl font-black text-gray-900'>Appointments</h1>
              <p className='text-gray-600 font-semibold text-sm mt-0.5'>
                {loading ? 'Loading…' : `${appts.length} confirmed appointment${appts.length !== 1 ? 's' : ''}`}
              </p>
            </div>
          </div>
          <button
            onClick={fetchAppts}
            className='flex items-center gap-2 bg-white border-2 border-emerald-200 text-emerald-700 font-black text-sm px-4 py-2.5 rounded-2xl hover:bg-emerald-50 transition-all'
          >
            <RefreshCw className='w-4 h-4' />
            Refresh
          </button>
        </div>
      </motion.div>

      {/* ── Search ── */}
      <div className='flex items-center gap-3 bg-white border-2 border-[#DCEAFF] rounded-2xl px-4 py-3 mb-5 focus-within:border-emerald-400 transition-all'>
        <Search className='w-4 h-4 text-gray-400 flex-shrink-0' />
        <input
          value={searchQuery}
          onChange={e => setSearch(e.target.value)}
          placeholder='Search by student name or department…'
          className='flex-1 bg-transparent text-sm font-semibold outline-none text-gray-700 placeholder-gray-400'
        />
        {searchQuery && (
          <button onClick={() => setSearch('')}>
            <X className='w-4 h-4 text-gray-400 hover:text-gray-600' />
          </button>
        )}
      </div>

      {/* ── Content ── */}
      <AnimatePresence mode='wait'>
        {loading && (
          <motion.div key='loading' initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className='flex items-center justify-center py-20 gap-3'>
            <Loader2 className='w-6 h-6 animate-spin text-emerald-500' />
            <p className='text-sm font-bold text-gray-400'>Loading appointments…</p>
          </motion.div>
        )}

        {!loading && error && (
          <motion.div key='error' initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className='text-center py-16'>
            <AlertCircle className='w-12 h-12 text-rose-300 mx-auto mb-3' />
            <p className='text-rose-600 font-bold mb-1'>Failed to load appointments</p>
            <p className='text-gray-400 text-sm mb-4'>{error}</p>
            <button onClick={fetchAppts}
              className='px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition'>
              Try Again
            </button>
          </motion.div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <motion.div key='empty' initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className='text-center py-20'>
            <div className='w-16 h-16 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-4 border-2 border-emerald-100'>
              <CalendarDays className='w-8 h-8 text-emerald-400' />
            </div>
            <p className='font-black text-gray-700 text-lg mb-1'>
              {searchQuery ? 'No appointments match your search' : 'No confirmed appointments yet'}
            </p>
            <p className='text-sm text-gray-400 font-semibold'>
              {searchQuery
                ? 'Try a different name or department.'
                : 'Accept pending requests from the Student Feed dashboard to see them here.'}
            </p>
          </motion.div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <motion.div key='list' initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className='space-y-4'>
            {filtered.map((appt, i) => (
              <AppointmentCard key={appt.id} appt={appt} index={i} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
