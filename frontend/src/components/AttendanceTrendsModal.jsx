import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { X, TrendingDown, TrendingUp, Minus, Calendar, AlertTriangle, CheckCircle } from 'lucide-react';
import { aerp as aerpApi } from '../services/api';

/* ── Helpers ─────────────────────────────────────────────────── */
function getWeekLabel(dateStr) {
  const d = new Date(dateStr);
  const weekNum = Math.ceil(d.getDate() / 7);
  return `${d.toLocaleString('default', { month: 'short' })} W${weekNum}`;
}

function getMonthLabel(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleString('default', { month: 'short', year: '2-digit' });
}

/* ── Custom Tooltip ──────────────────────────────────────────── */
const CustomTooltip = ({ active, payload, label, view }) => {
  if (!active || !payload?.length) return null;
  const val = payload[0].value;
  const isDaily = view === 'daily';

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-3 shadow-xl text-sm">
      <p className="font-black text-gray-700 mb-1">{label}</p>
      {isDaily ? (
        <p className={`font-bold ${val === 1 ? 'text-emerald-600' : 'text-rose-600'}`}>
          {val === 1 ? '✓ Present' : '✗ Absent'}
        </p>
      ) : (
        <p className="font-bold text-blue-600">{val}% Attendance</p>
      )}
    </div>
  );
};

/* ── Main Modal ──────────────────────────────────────────────── */
export default function AttendanceTrendsModal({ student, onClose }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState('daily'); // 'daily' | 'weekly' | 'monthly'

  useEffect(() => {
    if (!student?.college_id) return;
    setLoading(true);
    setError(null);
    aerpApi.getAttendanceLogs(student.college_id)
      .then(res => setLogs(res.data?.data || []))
      .catch(() => setError('Failed to load attendance logs.'))
      .finally(() => setLoading(false));
  }, [student]);

  /* ── Data transforms ── */
  const dailyData = useMemo(() => {
    // Show only last 30 days
    return logs.slice(-30).map(l => ({
      date: new Date(l.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      value: l.status === 'present' ? 1 : 0,
      status: l.status,
    }));
  }, [logs]);

  const weeklyData = useMemo(() => {
    const map = {};
    logs.forEach(l => {
      const key = getWeekLabel(l.date);
      if (!map[key]) map[key] = { present: 0, total: 0 };
      map[key].total++;
      if (l.status === 'present') map[key].present++;
    });
    return Object.entries(map).slice(-12).map(([week, { present, total }]) => ({
      date: week,
      value: total ? Math.round((present / total) * 100) : 0,
    }));
  }, [logs]);

  const monthlyData = useMemo(() => {
    const map = {};
    logs.forEach(l => {
      const key = getMonthLabel(l.date);
      if (!map[key]) map[key] = { present: 0, total: 0 };
      map[key].total++;
      if (l.status === 'present') map[key].present++;
    });
    return Object.entries(map).slice(-6).map(([month, { present, total }]) => ({
      date: month,
      value: total ? Math.round((present / total) * 100) : 0,
    }));
  }, [logs]);

  const chartData = view === 'daily' ? dailyData : view === 'weekly' ? weeklyData : monthlyData;

  /* ── Summary Stats ── */
  const stats = useMemo(() => {
    const total = logs.length;
    const present = logs.filter(l => l.status === 'present').length;
    const absent = total - present;
    const pct = total ? Math.round((present / total) * 100) : 0;

    // Trend: compare last 14 days vs previous 14 days
    const recent = logs.slice(-14);
    const prev = logs.slice(-28, -14);
    const recentPct = recent.length ? Math.round((recent.filter(l => l.status === 'present').length / recent.length) * 100) : 0;
    const prevPct = prev.length ? Math.round((prev.filter(l => l.status === 'present').length / prev.length) * 100) : 0;
    const trend = recentPct - prevPct;

    return { total, present, absent, pct, trend, recentPct };
  }, [logs]);

  const isAtRisk = stats.pct < 75 || stats.trend < -10;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 20 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden"
          style={{ maxHeight: '90vh' }}
        >
          {/* ── Header ── */}
          <div
            className="px-6 py-5 flex items-center justify-between"
            style={{
              background: isAtRisk
                ? 'linear-gradient(135deg, #7f1d1d 0%, #dc2626 100%)'
                : 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #4f46e5 100%)'
            }}
          >
            <div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-white/80" />
                <h2 className="text-lg font-black text-white">Attendance Trends</h2>
              </div>
              <p className="text-white/70 text-sm font-medium mt-0.5">
                {student?.name} · {student?.college_id}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 80px)' }}>
            {/* ── Summary Cards ── */}
            {!loading && !error && (
              <div className="px-6 pt-5 pb-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Overall % */}
                <div className={`rounded-2xl p-4 border ${stats.pct < 75 ? 'bg-rose-50 border-rose-200' : 'bg-emerald-50 border-emerald-200'}`}>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Overall</p>
                  <p className={`text-2xl font-black ${stats.pct < 75 ? 'text-rose-600' : 'text-emerald-600'}`}>{stats.pct}%</p>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">{stats.present}/{stats.total} days</p>
                </div>

                {/* Absences */}
                <div className="rounded-2xl p-4 border bg-amber-50 border-amber-200">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Absences</p>
                  <p className="text-2xl font-black text-amber-600">{stats.absent}</p>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">days missed</p>
                </div>

                {/* Last 14 Days */}
                <div className={`rounded-2xl p-4 border ${stats.recentPct < 75 ? 'bg-rose-50 border-rose-200' : 'bg-blue-50 border-blue-200'}`}>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Last 14 Days</p>
                  <p className={`text-2xl font-black ${stats.recentPct < 75 ? 'text-rose-600' : 'text-blue-600'}`}>{stats.recentPct}%</p>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">attendance</p>
                </div>

                {/* Trend */}
                <div className={`rounded-2xl p-4 border ${stats.trend < -10 ? 'bg-rose-50 border-rose-200' : stats.trend > 5 ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-200'}`}>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">2-Week Trend</p>
                  <div className="flex items-center gap-1">
                    {stats.trend < -5
                      ? <TrendingDown className="w-5 h-5 text-rose-500" />
                      : stats.trend > 5
                        ? <TrendingUp className="w-5 h-5 text-emerald-500" />
                        : <Minus className="w-5 h-5 text-gray-400" />
                    }
                    <p className={`text-2xl font-black ${stats.trend < -5 ? 'text-rose-600' : stats.trend > 5 ? 'text-emerald-600' : 'text-gray-500'}`}>
                      {stats.trend > 0 ? '+' : ''}{stats.trend}%
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">vs prev 2 weeks</p>
                </div>
              </div>
            )}

            {/* ── Risk Banner ── */}
            {!loading && !error && isAtRisk && (
              <div className="mx-6 mb-3 rounded-2xl bg-rose-50 border border-rose-200 px-4 py-3 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-black text-rose-700">Risk Pattern Detected</p>
                  <p className="text-xs text-rose-600 font-medium mt-0.5">
                    {stats.pct < 75 && `Overall attendance is below 75% threshold. `}
                    {stats.trend < -10 && `Attendance has sharply dropped by ${Math.abs(stats.trend)}% in the last 2 weeks — this may indicate academic disengagement or mental health concerns.`}
                  </p>
                </div>
              </div>
            )}
            {!loading && !error && !isAtRisk && (
              <div className="mx-6 mb-3 rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-3 flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <p className="text-sm font-bold text-emerald-700">Attendance pattern looks healthy. No major drop-off detected.</p>
              </div>
            )}

            {/* ── View Toggle ── */}
            <div className="px-6 pb-3 flex items-center gap-2">
              {['daily', 'weekly', 'monthly'].map(v => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                    view === v
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {v}
                </button>
              ))}
              <span className="ml-auto text-xs text-gray-400 font-medium">
                {view === 'daily' ? 'Last 30 working days' : view === 'weekly' ? 'Last 12 weeks' : 'Last 6 months'}
              </span>
            </div>

            {/* ── Chart ── */}
            <div className="px-6 pb-6">
              {loading ? (
                <div className="flex items-center justify-center h-48">
                  <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                </div>
              ) : error ? (
                <div className="text-center py-12 text-rose-500 font-semibold">{error}</div>
              ) : chartData.length === 0 ? (
                <div className="text-center py-12 text-gray-400 font-medium">No data available</div>
              ) : (
                <div className="bg-gray-50 rounded-2xl border border-gray-100 p-4">
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={chartData} barCategoryGap={view === 'daily' ? '15%' : '25%'}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 10, fontWeight: 600, fill: '#9ca3af' }}
                        axisLine={false}
                        tickLine={false}
                        interval={view === 'daily' ? 4 : 0}
                      />
                      <YAxis
                        domain={view === 'daily' ? [0, 1] : [0, 100]}
                        tickFormatter={v => view === 'daily' ? (v === 1 ? '✓' : '✗') : `${v}%`}
                        tick={{ fontSize: 10, fontWeight: 600, fill: '#9ca3af' }}
                        axisLine={false}
                        tickLine={false}
                        width={36}
                      />
                      <Tooltip content={<CustomTooltip view={view} />} cursor={{ fill: 'rgba(99,102,241,0.06)' }} />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={36}>
                        {chartData.map((entry, index) => {
                          let fill;
                          if (view === 'daily') {
                            fill = entry.value === 1 ? '#10b981' : '#f43f5e';
                          } else {
                            fill = entry.value < 75 ? '#f43f5e' : entry.value < 85 ? '#f59e0b' : '#10b981';
                          }
                          return <Cell key={`cell-${index}`} fill={fill} />;
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>

                  {/* Legend */}
                  <div className="flex items-center justify-center gap-5 mt-3">
                    {view === 'daily' ? (
                      <>
                        <span className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold">
                          <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" /> Present
                        </span>
                        <span className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold">
                          <span className="w-3 h-3 rounded-sm bg-rose-500 inline-block" /> Absent
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold">
                          <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" /> ≥85%
                        </span>
                        <span className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold">
                          <span className="w-3 h-3 rounded-sm bg-amber-400 inline-block" /> 75–85%
                        </span>
                        <span className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold">
                          <span className="w-3 h-3 rounded-sm bg-rose-500 inline-block" /> &lt;75%
                        </span>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}