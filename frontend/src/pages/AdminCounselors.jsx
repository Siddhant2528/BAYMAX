import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, Plus, Trash2, Loader2, AlertCircle, RefreshCw,
  Mail, Calendar, IdCard, X, CheckCircle2, Eye, EyeOff
} from 'lucide-react';
import { admin } from '../services/api';

/* ── Add Counselor Form ───────────────────────────────────────────── */
function AddCounselorForm({ onAdded }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', collegeId: '' });
  const [status, setStatus] = useState(null); // null | 'loading' | 'success' | 'error'
  const [errMsg, setErrMsg] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      await admin.addCounselor(form);
      setStatus('success');
      setForm({ name: '', email: '', password: '', collegeId: '' });
      setTimeout(() => { setStatus(null); setOpen(false); onAdded(); }, 1500);
    } catch (err) {
      setStatus('error');
      setErrMsg(err.response?.data?.message || 'Failed to add counselor.');
    }
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition shadow-lg shadow-indigo-500/25 text-sm"
      >
        <Plus className="w-4 h-4" /> Add Counselor
      </button>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white border-2 border-indigo-100 rounded-2xl p-6 shadow-lg mb-6"
    >
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-extrabold text-gray-900 flex items-center gap-2">
          <Plus className="w-5 h-5 text-indigo-500" /> Add New Counselor
        </h3>
        <button onClick={() => { setOpen(false); setStatus(null); }}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition">
          <X className="w-4 h-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Name */}
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Full Name *</label>
          <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="e.g. Dr. Priya Sharma"
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Email Address *</label>
          <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            placeholder="e.g. priya@college.edu"
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50"
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Temporary Password *</label>
          <div className="relative">
            <input required type={showPwd ? 'text' : 'password'} value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              placeholder="Min. 8 characters"
              className="w-full px-3 py-2.5 pr-10 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50"
            />
            <button type="button" onClick={() => setShowPwd(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* College ID */}
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">College ID *</label>
          <input required value={form.collegeId} onChange={e => setForm(f => ({ ...f, collegeId: e.target.value }))}
            placeholder="e.g. COUN-2024-001"
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50"
          />
        </div>

        {/* Status + Submit Row */}
        <div className="sm:col-span-2 flex flex-col gap-3">
          <AnimatePresence>
            {status === 'error' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2 text-sm font-semibold">
                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {errMsg}
              </motion.div>
            )}
            {status === 'success' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 text-sm font-semibold">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> Counselor added successfully!
              </motion.div>
            )}
          </AnimatePresence>

          <button type="submit" disabled={status === 'loading' || status === 'success'}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 text-sm"
          >
            {status === 'loading' ? <><Loader2 className="w-4 h-4 animate-spin" /> Adding Counselor...</> : <><Plus className="w-4 h-4" /> Add Counselor</>}
          </button>
        </div>
      </form>
    </motion.div>
  );
}

/* ── Main Counselor Management Page ───────────────────────────────── */
export default function AdminCounselors() {
  const [counselors, setCounselors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [removing, setRemoving] = useState({}); // { [id]: true }

  const fetchCounselors = useCallback(() => {
    setLoading(true);
    setError(null);
    admin.getCounselors()
      .then(res => setCounselors(res.data?.data || []))
      .catch(err => setError(err.response?.data?.message || 'Failed to load counselors.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchCounselors(); }, [fetchCounselors]);

  const handleRemove = async (counselor) => {
    if (!window.confirm(`Remove "${counselor.name}" from the platform?\nThis cannot be undone.`)) return;
    setRemoving(r => ({ ...r, [counselor.id]: true }));
    try {
      await admin.removeCounselor(counselor.id);
      setCounselors(list => list.filter(c => c.id !== counselor.id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove counselor.');
      setRemoving(r => ({ ...r, [counselor.id]: false }));
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-20">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-100 rounded-2xl">
              <ShieldCheck className="w-7 h-7 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Counselor Management</h1>
              <p className="text-gray-500 font-medium text-sm">Add or remove mental health counselors from the platform</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchCounselors}
              className="p-2.5 rounded-xl border border-gray-200 bg-white text-gray-500 hover:text-indigo-600 hover:border-indigo-300 transition shadow-sm">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stats Banner */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
        className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-6 mb-8 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden"
      >
        <div className="absolute right-0 top-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="relative z-10">
          <p className="text-xs font-black uppercase tracking-widest text-indigo-200 mb-1">Platform Counselors</p>
          <p className="text-5xl font-black mb-1">{loading ? '—' : counselors.length}</p>
          <p className="text-indigo-200 text-sm font-medium">Mental health professionals registered on Baymax</p>
        </div>
      </motion.div>

      {/* Add Form */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.12 }}>
        <AddCounselorForm onAdded={fetchCounselors} />
      </motion.div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            <p className="text-gray-400 font-medium text-sm">Loading counselors...</p>
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-rose-100">
          <AlertCircle className="w-12 h-12 text-rose-300 mx-auto mb-3" />
          <p className="text-rose-600 font-bold mb-1">Failed to load counselors</p>
          <p className="text-gray-400 text-sm mb-4">{error}</p>
          <button onClick={fetchCounselors} className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl text-sm hover:bg-indigo-700 transition">Try Again</button>
        </div>
      ) : counselors.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200">
          <ShieldCheck className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-semibold">No counselors registered yet.</p>
          <p className="text-gray-400 text-sm mt-1">Use the form above to add the first counselor.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
            {counselors.length} Counselor{counselors.length !== 1 ? 's' : ''} on Platform
          </p>
          <AnimatePresence>
            {counselors.map((counselor, i) => (
              <motion.div
                key={counselor.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ delay: i * 0.03 }}
                className="bg-white rounded-2xl border-2 border-gray-100 p-5 flex items-center gap-4 shadow-sm hover:border-indigo-100 hover:shadow-md transition"
              >
                {/* Avatar */}
                <div className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center font-extrabold text-lg text-white bg-gradient-to-br from-indigo-500 to-purple-600">
                  {counselor.name?.charAt(0)?.toUpperCase() || 'C'}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-sm truncate mb-0.5">{counselor.name}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-500 font-medium">
                    <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{counselor.email}</span>
                    {counselor.college_id && <span className="flex items-center gap-1"><IdCard className="w-3 h-3" />{counselor.college_id}</span>}
                    {counselor.created_at && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Added {new Date(counselor.created_at).toLocaleDateString()}</span>}
                  </div>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => handleRemove(counselor)}
                  disabled={removing[counselor.id]}
                  className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 rounded-xl font-bold text-sm transition flex-shrink-0 disabled:opacity-50"
                >
                  {removing[counselor.id]
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Removing...</>
                    : <><Trash2 className="w-4 h-4" /> Remove</>
                  }
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
