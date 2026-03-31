import React, { useState, useEffect, useCallback } from 'react';
import {
  Search, User, X, Phone, Building2, Calendar,
  ChevronRight, AlertCircle, TrendingUp, Activity, Shield,
  Heart, Mail, Hash, ArrowLeft, RefreshCw, BarChart2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { counselor } from '../services/api';
import AttendanceTrendsModal from './AttendanceTrendsModal';

/* ─── Severity Helpers ──────────────────────────────────────────── */
const SEVERITY_META = {
  minimal:           { label: 'Minimal',            color: '#10b981', bg: '#d1fae5', text: '#065f46', ring: '#a7f3d0' },
  mild:              { label: 'Mild',                color: '#f59e0b', bg: '#fef3c7', text: '#78350f', ring: '#fde68a' },
  moderate:          { label: 'Moderate',            color: '#f97316', bg: '#ffedd5', text: '#7c2d12', ring: '#fed7aa' },
  moderately_severe: { label: 'Mod. Severe',         color: '#ef4444', bg: '#fee2e2', text: '#7f1d1d', ring: '#fecaca' },
  severe:            { label: 'Severe',              color: '#dc2626', bg: '#fecdd3', text: '#881337', ring: '#fda4af' },
};

function getSeverityMeta(sev) {
  return SEVERITY_META[sev] || { label: 'N/A', color: '#9ca3af', bg: '#f3f4f6', text: '#374151', ring: '#e5e7eb' };
}

/* ─── PHQ9 / GAD7 max scores ─────────────────────────────────────── */
const MAX_SCORE = { PHQ9: 27, GAD7: 21 };

/* ─── Score Ring ─────────────────────────────────────────────────── */
function ScoreRing({ type, score, severity }) {
  const meta = getSeverityMeta(severity);
  const max  = MAX_SCORE[type] || 27;
  const pct  = score != null ? Math.min(score / max, 1) : 0;
  const r = 44;
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

/* ─── Info Card ──────────────────────────────────────────────────── */
function InfoCard({ icon, label, value, accent }) {
  const accentMap = {
    blue:   'bg-blue-50 border-blue-100',
    purple: 'bg-purple-50 border-purple-100',
    emerald:'bg-emerald-50 border-emerald-100',
    amber:  'bg-amber-50  border-amber-100',
    rose:   'bg-rose-50   border-rose-100',
    slate:  'bg-slate-50  border-slate-100',
  };
  const iconMap = {
    blue:   'text-blue-500',
    purple: 'text-purple-500',
    emerald:'text-emerald-500',
    amber:  'text-amber-500',
    rose:   'text-rose-500',
    slate:  'text-slate-400',
  };
  return (
    <div className={`flex items-start gap-3 p-4 rounded-2xl border ${accentMap[accent] || accentMap.slate}`}>
      <div className={`mt-0.5 flex-shrink-0 ${iconMap[accent] || iconMap.slate}`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
        <p className="text-sm font-bold text-gray-800 truncate">{value || 'Not provided'}</p>
      </div>
    </div>
  );
}

/* ─── Student Detail Panel ───────────────────────────────────────── */
function StudentDetailPanel({ student, onBack }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTrends, setShowTrends] = useState(false);

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

  const latestPHQ = history.find(h => h.test_type === 'PHQ9');
  const latestGAD = history.find(h => h.test_type === 'GAD7');
  const phqHistory = history.filter(h => h.test_type === 'PHQ9');
  const gadHistory = history.filter(h => h.test_type === 'GAD7');

  const isCrisis =
    (latestPHQ?.severity && ['moderately_severe', 'severe'].includes(latestPHQ.severity)) ||
    (latestGAD?.severity && latestGAD.severity === 'severe');

  return (
    <>
    <motion.div
      key="detail"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.25 }}
      className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
    >
      {/* ── Top Header Bar ── */}
      <div
        className="relative px-6 py-5 flex items-center gap-4"
        style={{
          background: isCrisis
            ? 'linear-gradient(135deg, #7f1d1d 0%, #dc2626 100%)'
            : 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #4f46e5 100%)'
        }}
      >
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors flex-shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Avatar */}
        <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0 ring-2 ring-white/30">
          <User className="w-7 h-7 text-white" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl font-black text-white">{student.name}</h2>
            {isCrisis && (
              <span className="text-xs font-black px-2.5 py-1 rounded-full bg-white/20 text-white animate-pulse">
                ⚠ HIGH RISK
              </span>
            )}
          </div>
          <p className="text-blue-100 text-sm mt-0.5 truncate">{student.email}</p>
          <p className="text-blue-200 text-xs mt-0.5">{student.department || 'No department'} • {student.college_id || 'N/A'}</p>
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

        {/* ── Current Score Cards ── */}
        <div className="px-6 pt-6 pb-4">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Activity className="w-3.5 h-3.5" /> Current Assessment Scores
          </h3>

          {loading ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            </div>
          ) : (
            <div className="flex justify-around items-start gap-4 py-4 bg-gray-50 rounded-3xl border border-gray-100">
              {/* PHQ9 */}
              <div className="flex flex-col items-center gap-1">
                <ScoreRing
                  type="PHQ9"
                  score={latestPHQ?.score}
                  severity={latestPHQ?.severity || 'minimal'}
                />
                <p className="text-xs text-gray-400 text-center mt-1 font-medium">
                  Patient Health<br />Questionnaire
                </p>
              </div>

              {/* Divider */}
              <div className="w-px bg-gray-200 self-stretch mx-2" />

              {/* GAD7 */}
              <div className="flex flex-col items-center gap-1">
                <ScoreRing
                  type="GAD7"
                  score={latestGAD?.score}
                  severity={latestGAD?.severity || 'minimal'}
                />
                <p className="text-xs text-gray-400 text-center mt-1 font-medium">
                  Generalized Anxiety<br />Disorder
                </p>
              </div>
            </div>
          )}

          {!loading && !latestPHQ && !latestGAD && (
            <div className="text-center py-4 text-gray-400 text-sm font-medium">
              No assessments taken yet
            </div>
          )}
        </div>

        {/* ── Personal Information ── */}
        <div className="px-6 pb-4">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <User className="w-3.5 h-3.5" /> Personal Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InfoCard icon={<Building2 className="w-4 h-4" />} label="Department" value={student.department} accent="blue" />
            <InfoCard icon={<Hash className="w-4 h-4" />}      label="College ID"  value={student.college_id}  accent="purple" />
            <InfoCard icon={<Mail className="w-4 h-4" />}       label="Email"         value={student.email}             accent="slate" />
            <InfoCard icon={<Phone className="w-4 h-4" />}      label="Student Contact" value={student.student_contact}  accent="emerald" />
            <InfoCard
              icon={<Shield className="w-4 h-4" />}
              label="Guardian's Phone"
              value={student.guardian_phone}
              accent="rose"
            />
            <InfoCard
              icon={<Calendar className="w-4 h-4" />}
              label="Registered On"
              value={student.created_at
                ? new Date(student.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'long', year: 'numeric'
                  })
                : undefined
              }
              accent="amber"
            />
          </div>
        </div>

        {/* ── Academic Context (AERP Simulation) ── */}
        <div className="px-6 pb-4">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Activity className="w-3.5 h-3.5" /> Academic Context (AERP)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <InfoCard 
              icon={<Building2 className="w-4 h-4" />} 
              label="Attendance" 
              value={student.attendance_percentage ? `${student.attendance_percentage}%` : 'No Record'} 
              accent={student.attendance_percentage < 75 ? 'rose' : 'emerald'} 
            />
            <InfoCard 
              icon={<Activity className="w-4 h-4" />} 
              label="Current CGPA" 
              value={student.current_cgpa || 'No Record'} 
              accent="blue" 
            />
            <InfoCard 
              icon={<AlertCircle className="w-4 h-4" />} 
              label="Failed Subjects" 
              value={student.failed_subjects_count !== undefined && student.failed_subjects_count !== null ? student.failed_subjects_count : 'No Record'} 
              accent={student.failed_subjects_count > 0 ? 'amber' : 'emerald'} 
            />
            <InfoCard 
              icon={<Shield className="w-4 h-4" />} 
              label="Warning Status" 
              value={student.academic_warning ? "Academic Warning" : "Clear"} 
              accent={student.academic_warning ? 'rose' : 'slate'} 
            />
          </div>
          {student.college_id && (
            <button
              onClick={() => setShowTrends(true)}
              className="mt-3 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-bold py-2.5 px-4 rounded-2xl transition-all shadow-md shadow-blue-500/20"
            >
              <BarChart2 className="w-4 h-4" />
              View Detailed Attendance Trends
            </button>
          )}
        </div>

        {/* ── Assessment History ── */}
        <div className="px-6 pb-6">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5" /> Full Assessment History
          </h3>

          {loading ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-2xl border border-gray-100">
              <AlertCircle className="w-10 h-10 text-gray-200 mx-auto mb-2" />
              <p className="text-gray-400 font-medium">No assessments taken yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* PHQ9 History */}
              {phqHistory.length > 0 && (
                <div>
                  <p className="text-xs font-black text-blue-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Heart className="w-3 h-3" /> PHQ-9 History
                  </p>
                  <div className="space-y-2">
                    {phqHistory.map((item, i) => (
                      <HistoryRow key={`phq-${i}`} item={item} index={i} />
                    ))}
                  </div>
                </div>
              )}

              {/* GAD7 History */}
              {gadHistory.length > 0 && (
                <div>
                  <p className="text-xs font-black text-indigo-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Activity className="w-3 h-3" /> GAD-7 History
                  </p>
                  <div className="space-y-2">
                    {gadHistory.map((item, i) => (
                      <HistoryRow key={`gad-${i}`} item={item} index={i} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </motion.div>

      {showTrends && (
        <AttendanceTrendsModal
          student={student}
          onClose={() => setShowTrends(false)}
        />
      )}
    </>
  );
}

/* ─── Student List Card ──────────────────────────────────────────── */
function StudentCard({ student, onClick }) {
  const phqSev = student.phq9_severity;
  const gadSev = student.gad7_severity;
  const isCrisis =
    ['moderately_severe', 'severe'].includes(phqSev) ||
    gadSev === 'severe';

  const phqMeta = getSeverityMeta(phqSev);
  const gadMeta = getSeverityMeta(gadSev);

  return (
    <motion.button
      whileHover={{ scale: 1.01, y: -1 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-left group ${
        isCrisis
          ? 'bg-rose-50 border-rose-200 hover:border-rose-400 hover:bg-rose-100'
          : 'bg-gray-50 border-gray-100 hover:bg-blue-50 hover:border-blue-200'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        {/* Avatar */}
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
          isCrisis ? 'bg-rose-100' : 'bg-blue-100'
        }`}>
          <User className={`w-5 h-5 ${isCrisis ? 'text-rose-600' : 'text-blue-600'}`} />
        </div>

        {/* Name + department */}
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className={`font-bold text-sm truncate ${
              isCrisis ? 'text-rose-900 group-hover:text-rose-700' : 'text-gray-800 group-hover:text-blue-700'
            }`}>
              {student.name}
            </p>
            {isCrisis && (
              <span className="text-xs font-black px-1.5 py-0.5 rounded-md bg-rose-200 text-rose-800">
                HIGH RISK
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 font-medium truncate">
            {student.department || 'No department'} • {student.college_id || student.email}
          </p>
          <div className="flex gap-2 mt-1.5 flex-wrap">
            {student.attendance_percentage && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${student.attendance_percentage < 75 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                {student.attendance_percentage}% Att.
              </span>
            )}
            {student.current_cgpa && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-700">
                {student.current_cgpa} CGPA
              </span>
            )}
          </div>
          {student.student_contact && (
            <div className="flex items-center gap-1 mt-1">
              <Phone className={`w-3 h-3 flex-shrink-0 ${isCrisis ? 'text-rose-400' : 'text-blue-400'}`} />
              <p className={`text-xs font-semibold truncate ${isCrisis ? 'text-rose-600' : 'text-blue-600'}`}>
                {student.student_contact}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Severity badges + arrow */}
      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
        {student.phq9_score != null && (
          <div className="flex flex-col items-center min-w-[44px]">
            <span className="text-xs font-black text-gray-600">{student.phq9_score}</span>
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded-md whitespace-nowrap"
              style={{ background: phqMeta.bg, color: phqMeta.text }}
            >
              PHQ9
            </span>
          </div>
        )}
        {student.gad7_score != null && (
          <div className="flex flex-col items-center min-w-[44px]">
            <span className="text-xs font-black text-gray-600">{student.gad7_score}</span>
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded-md whitespace-nowrap"
              style={{ background: gadMeta.bg, color: gadMeta.text }}
            >
              GAD7
            </span>
          </div>
        )}
        <ChevronRight className={`w-4 h-4 ${isCrisis ? 'text-rose-400' : 'text-gray-300 group-hover:text-blue-500'} transition-colors`} />
      </div>
    </motion.button>
  );
}

/* ─── Main StudentsSection ───────────────────────────────────────── */
export default function StudentsSection() {
  const [students, setStudents] = useState([]);
  const [search, setSearch]     = useState('');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  const fetchStudents = useCallback(() => {
    setLoading(true);
    setError(null);
    counselor.getAllStudents()
      .then(res => {
        const data = res.data.data || res.data || [];
        setStudents(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        const msg = err.response?.data?.message || err.message || 'Failed to load students';
        setError(msg);
        console.error('[StudentsSection] API error:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.email      || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.department || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.college_id || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AnimatePresence mode="wait">
      {selected ? (
        <StudentDetailPanel
          key="detail"
          student={selected}
          onBack={() => setSelected(null)}
        />
      ) : (
        <motion.div
          key="list"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100 px-6 py-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Registered Students</h2>
              <p className="text-xs text-gray-400 font-medium mt-0.5">
                Click on any student to view their full profile &amp; assessment scores
              </p>
            </div>
            <span className="text-sm font-bold bg-white text-gray-500 py-1.5 px-4 rounded-full border border-gray-200 shadow-sm">
              {students.length} Total
            </span>
          </div>

          {/* Search */}
          <div className="px-6 pt-5 pb-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name, email, department or college ID..."
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-lg transition"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>
          </div>

          {/* Legend */}
          <div className="px-6 pb-3 flex items-center gap-4 flex-wrap">
            <span className="text-xs text-gray-400 font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
              PHQ9 = Depression Screen
            </span>
            <span className="text-xs text-gray-400 font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-400 inline-block" />
              GAD7 = Anxiety Screen
            </span>
            <span className="text-xs text-gray-400 font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
              High Risk students
            </span>
          </div>

          {/* Student List */}
          <div className="px-6 pb-6 max-h-[62vh] overflow-y-auto space-y-2">
            {loading ? (
              <div className="flex items-center justify-center py-14">
                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
              </div>
            ) : error ? (
              <div className="text-center py-14">
                <AlertCircle className="w-12 h-12 text-rose-300 mx-auto mb-3" />
                <p className="text-rose-600 font-bold mb-1">Failed to load students</p>
                <p className="text-gray-400 text-sm mb-4">{error}</p>
                <button
                  onClick={fetchStudents}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition"
                >
                  Try Again
                </button>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-14">
                <User className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400 font-medium">
                  {search ? 'No students match your search' : 'No students found'}
                </p>
              </div>
            ) : (
              filtered.map(s => (
                <StudentCard
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