import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldAlert, Phone, Building2, User, AlertTriangle,
  ChevronRight, Activity, TrendingUp, ArrowLeft,
  RefreshCw, Heart, Hash, Mail, AlertCircle, Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { counselor } from '../services/api';

/* ─── Severity Helpers ──────────────────────────────────────────── */
const SEVERITY_META = {
  minimal:           { label: 'Minimal',      color: '#10b981', bg: '#d1fae5', text: '#065f46', ring: '#a7f3d0' },
  mild:              { label: 'Mild',          color: '#f59e0b', bg: '#fef3c7', text: '#78350f', ring: '#fde68a' },
  moderate:          { label: 'Moderate',      color: '#f97316', bg: '#ffedd5', text: '#7c2d12', ring: '#fed7aa' },
  moderately_severe: { label: 'Mod. Severe',   color: '#ef4444', bg: '#fee2e2', text: '#7f1d1d', ring: '#fecaca' },
  severe:            { label: 'Severe',        color: '#dc2626', bg: '#fecdd3', text: '#881337', ring: '#fda4af' },
};

function getSeverityMeta(sev) {
  return SEVERITY_META[sev] || { label: 'N/A', color: '#9ca3af', bg: '#f3f4f6', text: '#374151', ring: '#e5e7eb' };
}

const MAX_SCORE = { PHQ9: 27, GAD7: 21 };

/* ─── Score Ring ─────────────────────────────────────────────────── */
function ScoreRing({ type, score, severity }) {
  const meta = getSeverityMeta(severity);
  const max  = MAX_SCORE[type] || 27;
  const pct  = score != null ? Math.min(score / max, 1) : 0;
  const r    = 44;
  const circ = 2 * Math.PI * r;
  const dash = pct * circ;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-28 h-28">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={r} fill="none" stroke="#f1f5f9" strokeWidth="10" />
          <circle
            cx="50" cy="50" r={r} fill="none"
            stroke={meta.color}
            strokeWidth="10"
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 0.8s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black text-gray-800">
            {score != null ? score : '—'}
          </span>
          <span className="text-xs text-gray-400 font-semibold">/{max}</span>
        </div>
      </div>
      <div>
        <p className="text-center text-sm font-black text-gray-700">{type}</p>
        <span
          className="block text-center text-xs font-bold px-2.5 py-0.5 rounded-full mt-1"
          style={{ background: meta.bg, color: meta.text }}
        >
          {meta.label}
        </span>
      </div>
    </div>
  );
}

/* ─── History Row ────────────────────────────────────────────────── */
function HistoryRow({ item, index }) {
  const meta = getSeverityMeta(item.severity);
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      className="flex items-center justify-between p-3.5 rounded-2xl border"
      style={{ background: meta.bg + '66', borderColor: meta.ring }}
    >
      <div className="flex items-center gap-3">
        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: meta.color }} />
        <div>
          <p className="font-bold text-gray-800 text-sm">{item.test_type}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {new Date(item.created_at).toLocaleDateString('en-IN', {
              day: 'numeric', month: 'short', year: 'numeric',
              hour: '2-digit', minute: '2-digit'
            })}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-2xl font-black" style={{ color: meta.color }}>{item.score}</span>
        <span
          className="text-xs font-bold px-2.5 py-1 rounded-xl"
          style={{ background: meta.bg, color: meta.text }}
        >
          {meta.label}
        </span>
      </div>
    </motion.div>
  );
}

/* ─── Emergency Contact Card ─────────────────────────────────────── */
function EmergencyCard({ icon, label, value, urgent }) {
  return (
    <div className={`flex items-start gap-3 p-4 rounded-2xl border ${
      urgent
        ? 'bg-rose-100 border-rose-300'
        : 'bg-rose-50 border-rose-200'
    }`}>
      <div className={`mt-0.5 p-2 rounded-xl flex-shrink-0 ${urgent ? 'bg-rose-200' : 'bg-rose-100'}`}>
        <div className="text-rose-600">{icon}</div>
      </div>
      <div className="min-w-0">
        <p className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-0.5">{label}</p>
        <p className={`text-sm font-bold truncate ${urgent ? 'text-rose-900' : 'text-gray-800'}`}>
          {value || 'Not provided'}
        </p>
      </div>
    </div>
  );
}

/* ─── Crisis Detail Panel ────────────────────────────────────────── */
function CrisisDetailPanel({ student, onBack }) {
  const [history, setHistory]   = useState([]);
  const [loading, setLoading]   = useState(true);

  const fetchHistory = useCallback(() => {
    if (!student) return;
    setLoading(true);
    counselor.getStudentHistory(student.id)
      .then(res => setHistory(res.data.data || []))
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  }, [student]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  if (!student) return null;

  const phqHistory = history.filter(h => h.test_type === 'PHQ9');
  const gadHistory = history.filter(h => h.test_type === 'GAD7');

  return (
    <motion.div
      key="crisis-detail"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.25 }}
      className="bg-white rounded-3xl shadow-sm border border-rose-200 overflow-hidden"
    >
      {/* ── Header ── */}
      <div className="relative px-6 py-5 flex items-center gap-4"
        style={{ background: 'linear-gradient(135deg, #7f1d1d 0%, #be123c 50%, #dc2626 100%)' }}
      >
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors flex-shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0 ring-2 ring-white/30">
          <AlertTriangle className="w-7 h-7 text-white animate-pulse" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-rose-300 text-xs font-black uppercase tracking-widest mb-0.5">⚠ Crisis Alert</p>
          <h2 className="text-xl font-black text-white">{student.name}</h2>
          <p className="text-rose-200 text-sm truncate">{student.email}</p>
          <p className="text-rose-300 text-xs mt-0.5">{student.department || 'No dept.'} • {student.college_id || 'N/A'}</p>
        </div>

        <button
          onClick={fetchHistory}
          className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors flex-shrink-0"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 280px)' }}>

        {/* ── Current Assessment Scores ── */}
        <div className="px-6 pt-6 pb-4">
          <h3 className="text-xs font-black text-rose-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Activity className="w-3.5 h-3.5" /> Current Assessment Scores
          </h3>

          {loading ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-8 h-8 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin" />
            </div>
          ) : (
            <div className="flex justify-around items-start gap-4 py-4 bg-rose-50 rounded-3xl border border-rose-100">
              <div className="flex flex-col items-center gap-1">
                <ScoreRing type="PHQ9" score={student.phq9_score} severity={student.phq9_severity} />
                <p className="text-xs text-gray-400 text-center mt-1 font-medium">
                  Patient Health<br />Questionnaire
                </p>
              </div>
              <div className="w-px bg-rose-200 self-stretch mx-2" />
              <div className="flex flex-col items-center gap-1">
                <ScoreRing type="GAD7" score={student.gad7_score} severity={student.gad7_severity} />
                <p className="text-xs text-gray-400 text-center mt-1 font-medium">
                  Generalized Anxiety<br />Disorder
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── Emergency Contact Info ── */}
        <div className="px-6 pb-4">
          <h3 className="text-xs font-black text-rose-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            🚨 Emergency Contact Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <EmergencyCard icon={<Building2 className="w-4 h-4" />} label="Department"      value={student.department}     />
            <EmergencyCard icon={<Hash      className="w-4 h-4" />} label="College ID"      value={student.college_id}     />
            <EmergencyCard icon={<Mail      className="w-4 h-4" />} label="Email"           value={student.email}          />
            <EmergencyCard icon={<Calendar  className="w-4 h-4" />} label="Registered On"
              value={student.created_at
                ? new Date(student.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
                : undefined}
            />
            {student.student_contact && (
              <EmergencyCard
                icon={<Phone className="w-4 h-4" />}
                label="Student's Phone"
                value={student.student_contact}
              />
            )}
            <EmergencyCard
              icon={<Phone className="w-4 h-4" />}
              label="Guardian's Phone — CALL NOW"
              value={student.guardian_phone}
              urgent
            />
          </div>
        </div>

        {/* ── Assessment History ── */}
        <div className="px-6 pb-6">
          <h3 className="text-xs font-black text-rose-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5" /> Full Assessment History
          </h3>

          {loading ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-8 h-8 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin" />
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-10 bg-rose-50 rounded-2xl border border-rose-100">
              <AlertCircle className="w-10 h-10 text-rose-200 mx-auto mb-2" />
              <p className="text-gray-400 font-medium">No assessment records found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {phqHistory.length > 0 && (
                <div>
                  <p className="text-xs font-black text-rose-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Heart className="w-3 h-3" /> PHQ-9 History
                  </p>
                  <div className="space-y-2">
                    {phqHistory.map((item, i) => <HistoryRow key={`phq-${i}`} item={item} index={i} />)}
                  </div>
                </div>
              )}
              {gadHistory.length > 0 && (
                <div>
                  <p className="text-xs font-black text-rose-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Activity className="w-3 h-3" /> GAD-7 History
                  </p>
                  <div className="space-y-2">
                    {gadHistory.map((item, i) => <HistoryRow key={`gad-${i}`} item={item} index={i} />)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </motion.div>
  );
}

/* ─── Crisis Student Card ─────────────────────────────────────────── */
function CrisisCard({ student, onClick }) {
  const phqMeta = getSeverityMeta(student.phq9_severity);
  const gadMeta = getSeverityMeta(student.gad7_severity);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01, y: -1 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className="relative overflow-hidden bg-rose-50 border border-rose-200 rounded-2xl shadow-sm cursor-pointer hover:shadow-md hover:border-rose-400 transition-all group"
    >
      {/* Left accent stripe */}
      <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-rose-600 to-red-500" />

      <div className="pl-5 pr-4 py-4 flex flex-col gap-3">
        {/* Top: Name + chevron */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-rose-200 p-2.5 rounded-xl">
              <User className="w-4 h-4 text-rose-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-black text-gray-900">{student.name}</p>
                <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-rose-600 text-white animate-pulse">
                  SEVERE RISK
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Building2 className="w-3 h-3 text-rose-400" />
                <p className="text-xs text-rose-600 font-semibold">
                  {student.department || 'Dept not provided'}
                </p>
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-rose-300 group-hover:text-rose-600 transition-colors flex-shrink-0" />
        </div>

        {/* Score Badges */}
        <div className="flex gap-2 flex-wrap">
          {student.phq9_score != null && (
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black"
              style={{ background: phqMeta.bg, color: phqMeta.text }}
            >
              <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: phqMeta.color }} />
              PHQ9: {student.phq9_score}
              <span className="opacity-70">({phqMeta.label})</span>
            </span>
          )}
          {student.gad7_score != null && (
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black"
              style={{ background: gadMeta.bg, color: gadMeta.text }}
            >
              <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: gadMeta.color }} />
              GAD7: {student.gad7_score}
              <span className="opacity-70">({gadMeta.label})</span>
            </span>
          )}
        </div>

        {/* Contact row: Student + Guardian phone */}
        <div className="flex flex-col gap-1.5 pt-2 border-t border-rose-200/60">
          {student.student_contact && (
            <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 rounded-xl px-3 py-1.5">
              <Phone className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-xs font-black text-blue-800">
                Student: {student.student_contact}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-rose-100 border border-rose-300 rounded-xl px-3 py-1.5">
              <Phone className="w-3.5 h-3.5 text-rose-600" />
              <span className="text-xs font-black text-rose-800">
                Guardian: {student.guardian_phone || 'N/A'}
              </span>
            </div>
            <span className="text-xs text-rose-400 font-medium">
              {student.college_id || student.email}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Main CrisisAlertSection ─────────────────────────────────────── */
export default function CrisisAlertSection() {
  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  const fetchCrisis = useCallback(() => {
    setLoading(true);
    setError(null);
    counselor.getCrisisStudents()
      .then(res => {
        const data = res.data.data || res.data || [];
        setStudents(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        const msg = err.response?.data?.message || err.message || 'Failed to load crisis data';
        setError(msg);
        console.error('[CrisisAlertSection] API error:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchCrisis(); }, [fetchCrisis]);

  return (
    <AnimatePresence mode="wait">
      {selected ? (
        <CrisisDetailPanel
          key="crisis-detail"
          student={selected}
          onBack={() => setSelected(null)}
        />
      ) : (
        <motion.div
          key="crisis-list"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-3xl shadow-sm border border-rose-100 overflow-hidden"
        >
          {/* Header */}
          <div
            className="px-6 py-5 flex items-center justify-between border-b border-rose-100"
            style={{ background: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)' }}
          >
            <div>
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-500" />
                Crisis Alert Students
              </h2>
              <p className="text-xs text-rose-400 font-medium mt-0.5">
                Students at <strong>maximum severity (Severe)</strong> in PHQ-9 or GAD-7 — click to view full profile
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchCrisis}
                className="p-2 rounded-xl bg-white border border-rose-200 text-rose-500 hover:bg-rose-50 transition"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <span className={`text-sm font-bold py-1.5 px-4 rounded-full border shadow-sm flex items-center gap-1.5 ${
                students.length > 0
                  ? 'bg-rose-100 text-rose-700 border-rose-200 animate-pulse'
                  : 'bg-white text-gray-500 border-gray-200'
              }`}>
                {students.length > 0 && <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />}
                {students.length} Max Severity
              </span>
            </div>
          </div>

          {/* List */}
          <div className="p-6 max-h-[62vh] overflow-y-auto space-y-3">
            {loading ? (
              <div className="flex items-center justify-center py-14">
                <div className="w-8 h-8 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin" />
              </div>
            ) : error ? (
              <div className="text-center py-14">
                <AlertCircle className="w-12 h-12 text-rose-300 mx-auto mb-3" />
                <p className="text-rose-600 font-bold mb-1">Failed to load crisis data</p>
                <p className="text-gray-400 text-sm mb-4">{error}</p>
                <button
                  onClick={fetchCrisis}
                  className="px-4 py-2 bg-rose-600 text-white rounded-xl text-sm font-bold hover:bg-rose-700 transition"
                >
                  Try Again
                </button>
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-14">
                <ShieldAlert className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500 font-bold mb-1">No Maximum Severity Alerts</p>
                <p className="text-gray-300 text-sm">No students are currently at the severe risk level.</p>
              </div>
            ) : (
              students.map(s => (
                <CrisisCard
                  key={s.id}
                  student={s}
                  onClick={() => setSelected(s)}
                />
              ))
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
