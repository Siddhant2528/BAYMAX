import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Headphones, PlayCircle, HeartPulse, Music,
  Plus, Trash2, Link2, Youtube, CheckCircle2, AlertCircle,
  Loader2, ChevronDown, LayoutDashboard, PackageOpen
} from 'lucide-react';
import { resources } from '../services/api';

/* ─── Module Config ───────────────────────────────────────────────── */
const MODULES = [
  { id: 'Self Help books',      label: 'Self Help Books',      icon: BookOpen,    color: 'text-orange-500', bg: 'bg-orange-50',  border: 'border-orange-200', accent: '#f97316' },
  { id: 'Motivational Podcasts',label: 'Motivational Podcasts',icon: Headphones,  color: 'text-blue-500',   bg: 'bg-blue-50',    border: 'border-blue-200',   accent: '#3b82f6' },
  { id: 'Meditation Videos',    label: 'Meditation Videos',    icon: PlayCircle,  color: 'text-emerald-500',bg: 'bg-emerald-50', border: 'border-emerald-200',accent: '#10b981' },
  { id: 'Therapy Videos',       label: 'Therapy Videos',       icon: HeartPulse,  color: 'text-rose-500',   bg: 'bg-rose-50',    border: 'border-rose-200',   accent: '#f43f5e' },
  { id: 'Relaxation Music',     label: 'Relaxation Music',     icon: Music,       color: 'text-purple-500', bg: 'bg-purple-50',  border: 'border-purple-200', accent: '#a855f7' },
];

/* ─── Extract YouTube video ID ────────────────────────────────────── */
const getYouTubeId = (url = '') => {
  const m = url.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
};
const getThumb = (url) => {
  const id = getYouTubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : null;
};

/* ─── Add Form ────────────────────────────────────────────────────── */
function AddResourceForm({ moduleId, onAdded }) {
  const [form, setForm] = useState({ title: '', description: '', url: '' });
  const [status, setStatus] = useState(null); // null | 'loading' | 'success' | 'error'
  const [errMsg, setErrMsg] = useState('');
  const thumb = getThumb(form.url);
  const ytId  = getYouTubeId(form.url);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!ytId) { setStatus('error'); setErrMsg('Please enter a valid YouTube URL.'); return; }
    setStatus('loading');
    try {
      await resources.add({ ...form, type: moduleId });
      setStatus('success');
      setForm({ title: '', description: '', url: '' });
      setTimeout(() => { setStatus(null); onAdded(); }, 1500);
    } catch (err) {
      setStatus('error');
      setErrMsg(err.response?.data?.message || 'Failed to add resource.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-[#EEF3FF] border-2 border-[#DCEAFF] rounded-2xl p-5 shadow-sm space-y-4">
      <h4 className="font-black text-gray-800 flex items-center gap-2 text-sm">
        <Plus className="w-4 h-4 text-blue-500" /> Add New Content
      </h4>

      {/* URL + Thumbnail preview */}
      <div>
        <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">YouTube URL *</label>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="url"
              required
              value={form.url}
              onChange={e => { setForm(f => ({ ...f, url: e.target.value })); setStatus(null); }}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border-2 border-[#DCEAFF] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
            />
          </div>
          {thumb && (
            <div className="w-20 h-12 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0 bg-black">
              <img src={thumb} alt="thumb" className="w-full h-full object-cover" />
            </div>
          )}
        </div>
        {form.url && !ytId && (
          <p className="text-xs text-rose-500 font-semibold mt-1">⚠ Not a valid YouTube URL</p>
        )}
        {ytId && (
          <p className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <Youtube className="w-3 h-3" /> Valid YouTube video detected
          </p>
        )}
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Title *</label>
        <input
          type="text"
          required
          value={form.title}
          onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          placeholder="e.g. Guided Meditation for Stress"
          className="w-full px-3 py-2.5 rounded-xl border-2 border-[#DCEAFF] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
        />
      </div>

      <div>
        <label className="block text-xs font-black text-gray-400 mb-1.5 uppercase tracking-wider">Description / Subtitle</label>
        <input
          type="text"
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          placeholder="e.g. By Dr. Jane Smith · No Copyright"
          className="w-full px-3 py-2.5 rounded-xl border-2 border-[#DCEAFF] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
        />
      </div>

      {/* Status feedback */}
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
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> Resource added successfully!
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="submit"
        disabled={status === 'loading' || status === 'success'}
        className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60 text-white font-black rounded-2xl transition flex items-center justify-center gap-2 text-sm shadow-md shadow-blue-500/20"
      >
        {status === 'loading'
          ? <><Loader2 className="w-4 h-4 animate-spin" /> Adding...</>
          : <><Plus className="w-4 h-4" /> Add to {MODULES.find(m => m.id === moduleId)?.label}</>}
      </button>
    </form>
  );
}

/* ─── Resource Card (admin view) ──────────────────────────────────── */
function AdminResourceCard({ item, accent, onDelete }) {
  const [deleting, setDeleting] = useState(false);
  const thumb = getThumb(item.url);

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${item.title}"?`)) return;
    setDeleting(true);
    try { await resources.remove(item.id); onDelete(item.id); }
    catch { setDeleting(false); alert('Delete failed. Try again.'); }
  };

  return (
    <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }}
      className="flex items-start gap-3 bg-white border-2 border-[#DCEAFF] rounded-2xl p-4 shadow-sm group hover:shadow-md hover:border-blue-200 transition"
    >
      {/* Thumbnail */}
      <div className="w-20 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 border border-gray-200">
        {thumb
          ? <img src={thumb} alt={item.title} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center"><Youtube className="w-6 h-6 text-gray-300" /></div>
        }
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-bold text-gray-900 text-sm truncate">{item.title}</p>
        {item.description && <p className="text-xs text-gray-500 font-medium truncate">{item.description}</p>}
        <a href={item.url} target="_blank" rel="noreferrer"
          className="text-xs font-semibold truncate block mt-0.5"
          style={{ color: accent }}>
          {item.url}
        </a>
      </div>

      {/* Delete */}
      <button onClick={handleDelete} disabled={deleting}
        className="p-2 rounded-xl hover:bg-rose-50 text-gray-300 hover:text-rose-500 transition flex-shrink-0 disabled:opacity-50">
        {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
      </button>
    </motion.div>
  );
}

/* ─── Module Panel ────────────────────────────────────────────────── */
function ModulePanel({ mod, allResources, onRefresh }) {
  const [open, setOpen] = useState(false);
  const items = allResources.filter(r => r.type === mod.id);
  const Icon = mod.icon;

  const handleDelete = (id) => onRefresh();

  return (
    <div className={`rounded-2xl border-2 overflow-hidden transition-all ${open ? 'border-blue-300 shadow-lg shadow-blue-50' : 'border-[#DCEAFF] shadow-sm'}`}>
      {/* Module Header */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-6 py-4 bg-white hover:bg-[#EEF3FF] transition"
      >
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${mod.bg} ${mod.color}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="text-left">
            <p className="font-bold text-gray-900">{mod.label}</p>
            <p className="text-xs text-gray-400 font-medium">{items.length} video{items.length !== 1 ? 's' : ''} uploaded</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${mod.bg} ${mod.color} border ${mod.border}`}>
            {items.length} items
          </span>
          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Expanded Content */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div className="px-6 pb-6 bg-gray-50 border-t border-gray-100 space-y-4 pt-5">
              {/* Existing items */}
              {items.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Uploaded Content</p>
                  <AnimatePresence>
                    {items.map(item => (
                      <AdminResourceCard key={item.id} item={item} accent={mod.accent} onDelete={handleDelete} />
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center gap-3 bg-white border border-dashed border-gray-200 rounded-2xl p-5 text-gray-400">
                  <PackageOpen className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm font-medium">No content uploaded yet for this module.</p>
                </div>
              )}

              {/* Add form */}
              <AddResourceForm moduleId={mod.id} onAdded={onRefresh} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Main Admin Dashboard ────────────────────────────────────────── */
export default function AdminDashboard() {
  const [allResources, setAllResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchResources = () => {
    setLoading(true);
    resources.getAll()
      .then(res => { setAllResources(res.data?.data || []); setLoading(false); })
      .catch(err => { setError(err.response?.data?.message || 'Failed to load resources.'); setLoading(false); });
  };

  useEffect(() => { fetchResources(); }, []);

  const totalVideos = allResources.length;

  return (
    <div className="max-w-4xl mx-auto pb-20">

      {/* ── Page Header ── */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-4">
          <img src='/images/baymax_wave.png' alt='Baymax Admin' className='w-16 h-auto object-contain baymax-float-slow hidden sm:block' />
          <div className="p-3 bg-[#EEF3FF] rounded-2xl border-2 border-[#DCEAFF] sm:hidden">
            <LayoutDashboard className="w-7 h-7 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Admin Dashboard</h1>
            <p className="text-gray-400 font-semibold text-sm mt-0.5">Manage self-help content delivered to students</p>
          </div>
        </div>
      </motion.div>

      {/* ── Content Management Hero Banner ── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="rounded-3xl p-6 sm:p-8 mb-8 relative overflow-hidden border-2 border-[#DCEAFF] shadow-sm"
        style={{ background: 'linear-gradient(135deg, #EEF3FF 0%, #DCEAFF 50%, #C2D3F7 100%)' }}
      >
        <div className="absolute right-0 top-0 w-48 h-48 bg-white/30 rounded-full -translate-y-1/3 translate-x-1/3" />
        <div className="relative z-10 flex items-center gap-6 flex-wrap">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Youtube className="w-5 h-5 text-red-500" />
              <span className="text-xs font-black uppercase tracking-widest text-blue-600">Content Management</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2">Self-Help Resources</h2>
            <p className="text-gray-500 font-semibold max-w-xl text-sm leading-relaxed">
              Upload non-copyright YouTube links across the 5 student resource modules.
              Content goes live on the student dashboard immediately after upload.
            </p>
            {/* Module stats row */}
            {!loading && (
              <div className="flex flex-wrap gap-2 mt-5">
                {MODULES.map(mod => {
                  const count = allResources.filter(r => r.type === mod.id).length;
                  const Icon = mod.icon;
                  return (
                    <div key={mod.id} className={`flex items-center gap-1.5 bg-white rounded-xl border-2 ${mod.border} px-3 py-1.5 text-xs font-black`}>
                      <Icon className={`w-3.5 h-3.5 ${mod.color}`} />
                      <span className="text-gray-900">{count}</span>
                      <span className={`${mod.color} hidden sm:inline`}>{mod.label}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <div className="bg-white rounded-2xl border-2 border-[#DCEAFF] px-7 py-5 text-center shadow-sm flex-shrink-0">
            <p className="text-5xl font-black text-gray-900">{loading ? '—' : totalVideos}</p>
            <p className="text-xs font-black text-gray-400 uppercase tracking-wider mt-1">Total Videos</p>
          </div>
        </div>
      </motion.div>

      {/* ── Module Panels ── */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-4">
            <img src='/images/baymax_stand.png' alt='Loading' className='w-20 h-auto baymax-float opacity-50' />
            <p className="text-gray-400 font-bold text-sm">Loading resources...</p>
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-16 bg-white rounded-3xl border-2 border-rose-100">
          <AlertCircle className="w-12 h-12 text-rose-300 mx-auto mb-3" />
          <p className="text-rose-600 font-black mb-1">Failed to load resources</p>
          <p className="text-gray-400 text-sm mb-4 font-semibold">{error}</p>
          <button onClick={fetchResources} className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black rounded-2xl text-sm hover:from-blue-700 hover:to-indigo-700 transition shadow-md shadow-blue-500/20">
            Try Again
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {MODULES.map((mod, i) => (
            <motion.div key={mod.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.07 }}>
              <ModulePanel mod={mod} allResources={allResources} onRefresh={fetchResources} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
