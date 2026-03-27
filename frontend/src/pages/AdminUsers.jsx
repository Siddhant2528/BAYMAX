import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Search, ShieldBan, ShieldCheck, Loader2, AlertCircle,
  RefreshCw, GraduationCap, Mail, Calendar, Building2
} from 'lucide-react';
import { admin } from '../services/api';

function StatusBadge({ blocked }) {
  return blocked ? (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200">
      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block" /> Blocked
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" /> Active
    </span>
  );
}

export default function AdminUsers() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [toggling, setToggling] = useState({}); // { [id]: true } when toggling

  const fetchStudents = useCallback(() => {
    setLoading(true);
    setError(null);
    admin.getUsers()
      .then(res => setStudents(res.data?.data || []))
      .catch(err => setError(err.response?.data?.message || 'Failed to load students.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  const handleToggleBlock = async (student) => {
    const id = student.id;
    setToggling(t => ({ ...t, [id]: true }));
    try {
      if (student.is_blocked) {
        await admin.unblockUser(id);
      } else {
        await admin.blockUser(id);
      }
      // Optimistic update
      setStudents(list =>
        list.map(s => s.id === id ? { ...s, is_blocked: !s.is_blocked } : s)
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed. Try again.');
    } finally {
      setToggling(t => ({ ...t, [id]: false }));
    }
  };

  const filtered = students.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase()) ||
    s.department?.toLowerCase().includes(search.toLowerCase())
  );

  const blockedCount = students.filter(s => s.is_blocked).length;
  const activeCount = students.length - blockedCount;

  return (
    <div className="max-w-6xl mx-auto pb-20">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-3 bg-blue-100 rounded-2xl">
            <Users className="w-7 h-7 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">User Management</h1>
            <p className="text-gray-500 font-medium text-sm">Monitor and control student access to the platform</p>
          </div>
        </div>
      </motion.div>

      {/* Stats Banner */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
        className="grid grid-cols-3 gap-4 mb-8"
      >
        {[
          { label: 'Total Students', value: students.length, color: 'from-blue-500 to-indigo-600', icon: GraduationCap },
          { label: 'Active Students', value: activeCount, color: 'from-emerald-500 to-teal-600', icon: ShieldCheck },
          { label: 'Blocked Students', value: blockedCount, color: 'from-rose-500 to-red-600', icon: ShieldBan },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}
              className={`bg-gradient-to-br ${stat.color} rounded-2xl p-5 text-white shadow-lg shadow-indigo-500/10`}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-bold text-white/80 uppercase tracking-wider">{stat.label}</p>
                <Icon className="w-5 h-5 text-white/60" />
              </div>
              <p className="text-4xl font-black">{loading ? '—' : stat.value}</p>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Search + Refresh */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
        className="flex gap-3 mb-6"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search students by name, email, or department..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
          />
        </div>
        <button onClick={fetchStudents}
          className="p-2.5 rounded-xl border border-gray-200 bg-white text-gray-500 hover:text-blue-600 hover:border-blue-300 transition shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </motion.div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            <p className="text-gray-400 font-medium text-sm">Loading students...</p>
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-rose-100">
          <AlertCircle className="w-12 h-12 text-rose-300 mx-auto mb-3" />
          <p className="text-rose-600 font-bold mb-1">Failed to load students</p>
          <p className="text-gray-400 text-sm mb-4">{error}</p>
          <button onClick={fetchStudents} className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl text-sm hover:bg-blue-700 transition">Try Again</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-gray-100">
          <GraduationCap className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-semibold">{search ? 'No students match your search.' : 'No students registered yet.'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
            {filtered.length} student{filtered.length !== 1 ? 's' : ''} {search ? 'found' : 'registered'}
          </p>
          <AnimatePresence>
            {filtered.map((student, i) => (
              <motion.div
                key={student.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ delay: i * 0.02 }}
                className={`bg-white rounded-2xl border-2 p-5 flex items-center gap-4 shadow-sm transition-all ${
                  student.is_blocked ? 'border-rose-100 bg-rose-50/30' : 'border-gray-100 hover:border-blue-100 hover:shadow-md'
                }`}
              >
                {/* Avatar */}
                <div className={`w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center font-extrabold text-lg text-white ${
                  student.is_blocked ? 'bg-gradient-to-br from-rose-400 to-red-500' : 'bg-gradient-to-br from-blue-500 to-indigo-600'
                }`}>
                  {student.name?.charAt(0)?.toUpperCase() || 'S'}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-bold text-gray-900 text-sm truncate">{student.name}</p>
                    <StatusBadge blocked={student.is_blocked} />
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-500 font-medium">
                    <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{student.email}</span>
                    {student.department && <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{student.department}</span>}
                    {student.created_at && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Joined {new Date(student.created_at).toLocaleDateString()}</span>}
                  </div>
                </div>

                {/* Block/Unblock Button */}
                <button
                  onClick={() => handleToggleBlock(student)}
                  disabled={toggling[student.id]}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition flex-shrink-0 disabled:opacity-50 ${
                    student.is_blocked
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                      : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                  }`}
                >
                  {toggling[student.id] ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Wait...</>
                  ) : student.is_blocked ? (
                    <><ShieldCheck className="w-4 h-4" /> Unblock</>
                  ) : (
                    <><ShieldBan className="w-4 h-4" /> Block</>
                  )}
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
