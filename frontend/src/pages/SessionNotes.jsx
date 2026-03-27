import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, User, Calendar, ClipboardList,
  Stethoscope, Download, Save, CheckCircle2,
  ChevronDown, Search, X, Plus, ArrowLeft,
  AlertCircle, Loader2
} from 'lucide-react';
import jsPDF from 'jspdf';
import { counselor as counselorApi, sessionNotes as notesApi } from '../services/api';

/* ── Helpers ─────────────────────────────────────────────── */
function formatDate(date) {
  return new Date(date).toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
}
function formatDateShort(date) {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
}
function formatTime(date) {
  return new Date(date).toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
  });
}

/* ── Generate PDF (shared utility) ──────────────────────── */
function generatePDF(note, studentName, studentDepartment, studentCollegeId) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const margin = 18;
  const lineW = W - margin * 2;
  let y = 0;

  // Header band
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, W, 38, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('BAYMAX', margin, 16);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Mental Health Counseling Portal', margin, 23);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('SESSION PRESCRIPTION', margin, 33);
  y = 48;

  // Student info block
  doc.setFillColor(238, 243, 255);
  doc.roundedRect(margin, y, lineW, 28, 3, 3, 'F');
  doc.setTextColor(30, 58, 138);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('STUDENT', margin + 4, y + 7);
  doc.setTextColor(17, 24, 39);
  doc.setFontSize(13);
  doc.text(studentName || '—', margin + 4, y + 15);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(75, 85, 99);
  doc.text(`Department: ${studentDepartment || 'N/A'}   ·   College ID: ${studentCollegeId || 'N/A'}`, margin + 4, y + 22);
  y += 36;

  // Date / Time row
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, lineW / 2 - 3, 16, 3, 3, 'F');
  doc.roundedRect(margin + lineW / 2 + 3, y, lineW / 2 - 3, 16, 3, 3, 'F');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 58, 138);
  doc.text('DATE', margin + 4, y + 6);
  doc.text('TIME', margin + lineW / 2 + 7, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(17, 24, 39);
  doc.text(formatDate(note.session_date || note.sessionDate), margin + 4, y + 13);
  doc.text(formatTime(note.session_date || note.sessionDate), margin + lineW / 2 + 7, y + 13);
  y += 24;

  const writeSection = (title, content, colorRGB) => {
    doc.setFillColor(...colorRGB);
    doc.roundedRect(margin, y, lineW, 9, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(title, margin + 4, y + 6.2);
    y += 13;
    const lines = doc.splitTextToSize(content || '(No content provided)', lineW - 8);
    const boxH = lines.length * 5.5 + 8;
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, y, lineW, boxH, 3, 3, 'F');
    doc.setDrawColor(220, 234, 255);
    doc.roundedRect(margin, y, lineW, boxH, 3, 3, 'S');
    doc.setTextColor(31, 41, 55);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.text(lines, margin + 4, y + 7);
    y += boxH + 8;
  };

  writeSection('PROBLEM DESCRIPTION', note.problem_description, [16, 185, 129]);
  writeSection('DIAGNOSTICS & ADVICES', note.diagnostics_advices, [99, 102, 241]);

  // Footer
  doc.setFillColor(37, 99, 235);
  const pageH = doc.internal.pageSize.getHeight();
  doc.rect(0, pageH - 14, W, 14, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'italic');
  doc.text('This prescription is auto-generated from the Baymax Mental Health Counseling Portal.', margin, pageH - 5);
  doc.text(`Generated: ${formatDate(new Date())} ${formatTime(new Date())}`, W - margin, pageH - 5, { align: 'right' });

  doc.save(`session_note_${(studentName || 'unknown').replace(/\s+/g, '_')}_${new Date(note.session_date || note.sessionDate).toISOString().slice(0, 10)}.pdf`);
}

/* ── Student Search Dropdown ─────────────────────────────── */
function StudentDropdown({ students, selected, onSelect }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = students.filter(s =>
    `${s.name} ${s.department || ''}`.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div ref={ref} className='relative'>
      <button
        type='button'
        onClick={() => setOpen(v => !v)}
        className='w-full flex items-center justify-between gap-3 px-4 py-3.5 bg-[#EEF3FF] border-2 border-[#DCEAFF] rounded-2xl text-left font-semibold text-gray-700 hover:border-blue-400 transition-all focus:outline-none focus:ring-2 focus:ring-blue-300'
      >
        <div className='flex items-center gap-2.5'>
          <User className='w-4 h-4 text-blue-500 flex-shrink-0' />
          {selected
            ? <span className='text-gray-900 font-bold'>{selected.name} <span className='text-blue-500 font-semibold text-sm'>· {selected.department || 'No department'}</span></span>
            : <span className='text-gray-400'>Search and select a student…</span>
          }
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className='absolute z-50 top-full mt-2 w-full bg-white rounded-2xl border-2 border-[#DCEAFF] shadow-xl overflow-hidden'
          >
            <div className='flex items-center gap-2 px-4 py-3 border-b border-[#EEF3FF]'>
              <Search className='w-4 h-4 text-gray-400 flex-shrink-0' />
              <input
                autoFocus
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder='Type to filter…'
                className='flex-1 bg-transparent text-sm font-semibold outline-none text-gray-700 placeholder-gray-400'
              />
              {query && <button onClick={() => setQuery('')}><X className='w-3.5 h-3.5 text-gray-400 hover:text-gray-600' /></button>}
            </div>
            <div className='max-h-56 overflow-y-auto'>
              {filtered.length === 0
                ? <p className='text-center text-sm text-gray-400 font-semibold py-6'>No students found</p>
                : filtered.map(s => (
                  <button
                    key={s.id}
                    type='button'
                    onClick={() => { onSelect(s); setOpen(false); setQuery(''); }}
                    className='w-full flex items-center gap-3 px-4 py-3 hover:bg-[#EEF3FF] transition-colors text-left'
                  >
                    <div className='w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 font-black text-sm flex-shrink-0'>
                      {s.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <p className='font-bold text-gray-800 text-sm'>{s.name}</p>
                      <p className='text-xs text-gray-400 font-semibold'>{s.department || 'No department'} · {s.college_id || '—'}</p>
                    </div>
                  </button>
                ))
              }
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Prescription List Card ──────────────────────────────── */
function PrescriptionCard({ note, index }) {
  const handleDownload = () => {
    generatePDF(
      note,
      note.student_name,
      note.student_department,
      note.student_college_id
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className='bg-white rounded-2xl border-2 border-[#DCEAFF] shadow-sm hover:border-blue-300 hover:shadow-md transition-all overflow-hidden'
    >
      {/* Card top stripe */}
      <div className='h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500' />

      <div className='p-5'>
        {/* Header row */}
        <div className='flex items-start justify-between gap-3 mb-4'>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 font-black text-base flex-shrink-0'>
              {note.student_name?.[0]?.toUpperCase() || '?'}
            </div>
            <div>
              <p className='font-black text-gray-900 text-sm'>{note.student_name || '—'}</p>
              <p className='text-xs text-gray-400 font-semibold'>{note.student_department || 'No department'}</p>
            </div>
          </div>
          <div className='flex items-center gap-2 flex-shrink-0'>
            <div className='flex items-center gap-1.5 bg-[#EEF3FF] text-blue-700 text-xs font-bold px-3 py-1.5 rounded-xl'>
              <Calendar className='w-3 h-3' />
              {formatDateShort(note.session_date)}
            </div>
            <button
              onClick={handleDownload}
              title='Download PDF'
              className='flex items-center gap-1.5 bg-indigo-50 border-2 border-indigo-100 text-indigo-700 text-xs font-black px-3 py-1.5 rounded-xl hover:bg-indigo-100 hover:border-indigo-200 transition-all'
            >
              <Download className='w-3.5 h-3.5' />
              PDF
            </button>
          </div>
        </div>

        {/* Problem Description preview */}
        <div className='mb-3'>
          <p className='text-xs font-black text-emerald-600 uppercase tracking-widest mb-1.5 flex items-center gap-1'>
            <ClipboardList className='w-3 h-3' /> Problem Description
          </p>
          <p className='text-sm text-gray-600 font-medium leading-relaxed line-clamp-2 bg-[#F0FDF4] border border-emerald-100 rounded-xl px-3 py-2'>
            {note.problem_description || '—'}
          </p>
        </div>

        {/* Diagnostics preview */}
        <div>
          <p className='text-xs font-black text-indigo-600 uppercase tracking-widest mb-1.5 flex items-center gap-1'>
            <Stethoscope className='w-3 h-3' /> Diagnostics & Advices
          </p>
          <p className='text-sm text-gray-600 font-medium leading-relaxed line-clamp-2 bg-[#EEF2FF] border border-indigo-100 rounded-xl px-3 py-2'>
            {note.diagnostics_advices || '—'}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Create Prescription Form ────────────────────────────── */
function CreateForm({ students, onSaved, onCancel }) {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [problemDesc, setProblemDesc] = useState('');
  const [diagnostics, setDiagnostics] = useState('');
  const [now, setNow] = useState(new Date());
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savedNote, setSavedNote] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSave = async () => {
    if (!selectedStudent) return setError('Please select a student.');
    if (!problemDesc.trim()) return setError('Problem Description cannot be empty.');
    if (!diagnostics.trim()) return setError('Diagnostics & Advices cannot be empty.');
    setError('');
    setSaving(true);
    try {
      const res = await notesApi.create({
        studentId: selectedStudent.id,
        problemDescription: problemDesc,
        diagnosticsAdvices: diagnostics,
        sessionDate: now.toISOString(),
      });
      setSavedNote({ ...res.data.data, sessionDate: now });
      setSaved(true);
      onSaved(); // refresh list
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save note. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadPDF = () => {
    const note = savedNote
      ? { ...savedNote, session_date: savedNote.sessionDate || now }
      : { session_date: now, problem_description: problemDesc, diagnostics_advices: diagnostics };
    generatePDF(note, selectedStudent?.name, selectedStudent?.department, selectedStudent?.college_id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className='bg-white rounded-3xl border-2 border-[#DCEAFF] shadow-sm overflow-hidden'
    >
      {/* Prescription header strip */}
      <div className='bg-gradient-to-r from-blue-600 to-indigo-600 px-7 py-4 flex items-center justify-between'>
        <div>
          <p className='text-xs font-black text-white/70 uppercase tracking-widest'>Baymax</p>
          <p className='text-lg font-black text-white'>Mental Health Session Prescription</p>
        </div>
        <div className='w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center'>
          <Stethoscope className='w-5 h-5 text-white' />
        </div>
      </div>

      <div className='p-7 space-y-7'>
        {/* 1 — Student selector */}
        <section>
          <label className='flex items-center gap-2 text-xs font-black text-blue-600 uppercase tracking-widest mb-2.5'>
            <User className='w-3.5 h-3.5' /> Patient (Student)
          </label>
          <StudentDropdown students={students} selected={selectedStudent} onSelect={setSelectedStudent} />
        </section>

        {/* 2 — Date & Time */}
        <section>
          <label className='flex items-center gap-2 text-xs font-black text-blue-600 uppercase tracking-widest mb-2.5'>
            <Calendar className='w-3.5 h-3.5' /> Session Date & Time
          </label>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
            <div className='flex items-center gap-3 bg-[#EEF3FF] border-2 border-[#DCEAFF] rounded-2xl px-4 py-3'>
              <Calendar className='w-4 h-4 text-blue-500 flex-shrink-0' />
              <span className='font-bold text-gray-800 text-sm'>{formatDate(now)}</span>
            </div>
            <div className='flex items-center gap-3 bg-[#EEF3FF] border-2 border-[#DCEAFF] rounded-2xl px-4 py-3'>
              <span className='font-mono font-black text-blue-600 text-base tracking-wider'>{formatTime(now)}</span>
            </div>
          </div>
        </section>

        {/* 3 — Problem Description */}
        <section>
          <label className='flex items-center gap-2 text-xs font-black text-emerald-600 uppercase tracking-widest mb-2.5'>
            <ClipboardList className='w-3.5 h-3.5' /> Problem Description
          </label>
          <textarea
            value={problemDesc}
            onChange={e => setProblemDesc(e.target.value)}
            rows={5}
            placeholder={"Describe the student's reported problems, symptoms, and concerns in detail…"}
            className='w-full bg-[#F0FDF4] border-2 border-emerald-200 rounded-2xl px-4 py-3.5 text-sm font-semibold text-gray-800 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition-all leading-relaxed'
          />
        </section>

        {/* 4 — Diagnostics & Advices */}
        <section>
          <label className='flex items-center gap-2 text-xs font-black text-indigo-600 uppercase tracking-widest mb-2.5'>
            <Stethoscope className='w-3.5 h-3.5' /> Diagnostics & Advices
          </label>
          <textarea
            value={diagnostics}
            onChange={e => setDiagnostics(e.target.value)}
            rows={5}
            placeholder={"Write your clinical diagnosis and recommended advices for the student's mental health improvement…"}
            className='w-full bg-[#EEF2FF] border-2 border-indigo-200 rounded-2xl px-4 py-3.5 text-sm font-semibold text-gray-800 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all leading-relaxed'
          />
        </section>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className='flex items-center gap-2 text-sm font-bold text-rose-600 bg-rose-50 border border-rose-200 rounded-2xl px-4 py-3'
            >
              <AlertCircle className='w-4 h-4 flex-shrink-0' />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action buttons */}
        <div className='flex flex-col sm:flex-row gap-3 pt-1'>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSave}
            disabled={saving || saved}
            className='flex-1 flex items-center justify-center gap-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-2xl font-black text-sm shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 disabled:opacity-60 transition-all'
          >
            {saved
              ? <><CheckCircle2 className='w-5 h-5' /> Saved Successfully</>
              : saving
                ? <><Loader2 className='w-4 h-4 animate-spin' /> Saving…</>
                : <><Save className='w-5 h-5' /> Save Prescription</>
            }
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleDownloadPDF}
            disabled={!selectedStudent || (!problemDesc.trim() && !saved)}
            className='flex-1 flex items-center justify-center gap-2.5 bg-white border-2 border-[#DCEAFF] text-gray-700 py-4 rounded-2xl font-black text-sm hover:bg-[#EEF3FF] hover:border-blue-300 disabled:opacity-40 transition-all'
          >
            <Download className='w-5 h-5 text-blue-600' /> Download PDF
          </motion.button>
        </div>

        {/* Success banner */}
        <AnimatePresence>
          {saved && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className='bg-emerald-50 border-2 border-emerald-200 rounded-2xl px-5 py-4 flex items-center justify-between'
            >
              <div className='flex items-center gap-3'>
                <CheckCircle2 className='w-5 h-5 text-emerald-600' />
                <p className='font-bold text-emerald-800 text-sm'>Prescription saved to database!</p>
              </div>
              <button
                onClick={onCancel}
                className='text-xs font-black text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded-xl transition-colors'
              >
                ← Back to List
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/* ── Main Page ───────────────────────────────────────────── */
export default function SessionNotes() {
  const [view, setView] = useState('list'); // 'list' | 'create'
  const [students, setStudents] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchNotes = useCallback(() => {
    setLoadingNotes(true);
    notesApi.getAll()
      .then(res => setNotes(res.data.data || []))
      .catch(() => setNotes([]))
      .finally(() => setLoadingNotes(false));
  }, []);

  useEffect(() => {
    counselorApi.getAllStudents()
      .then(res => setStudents(res.data.data || res.data || []))
      .catch(() => setStudents([]));
    fetchNotes();
  }, [fetchNotes]);

  const filteredNotes = notes.filter(n =>
    `${n.student_name} ${n.student_department || ''}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className='max-w-3xl mx-auto pb-20'>

      {/* ── Page Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className='mb-6 rounded-3xl border-2 border-[#DCEAFF] overflow-hidden shadow-sm'
        style={{ background: 'linear-gradient(135deg, #EEF3FF 0%, #DCEAFF 50%, #C2D3F7 100%)' }}
      >
        <div className='p-6 sm:p-8 flex items-center justify-between gap-6 flex-wrap'>
          <div className='flex items-center gap-5'>
            <div className='flex-shrink-0 bg-white/60 rounded-2xl p-3 border-2 border-white shadow-sm'>
              <FileText className='w-10 h-10 text-blue-600' />
            </div>
            <div>
              <p className='text-xs font-black text-blue-600 uppercase tracking-widest mb-1'>Counselor Tool</p>
              <h1 className='text-2xl font-black text-gray-900'>Session Notes</h1>
              <p className='text-gray-600 font-semibold text-sm mt-0.5'>
                {view === 'list'
                  ? `${notes.length} prescription${notes.length !== 1 ? 's' : ''} saved`
                  : 'Write a new session prescription'}
              </p>
            </div>
          </div>

          {view === 'list' ? (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setView('create')}
              className='flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm px-5 py-3 rounded-2xl shadow-lg shadow-blue-500/25 transition-all'
            >
              <Plus className='w-4 h-4' />
              Create New Prescription
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setView('list')}
              className='flex items-center gap-2 bg-white border-2 border-[#DCEAFF] text-gray-600 font-black text-sm px-5 py-3 rounded-2xl hover:border-blue-300 hover:bg-[#EEF3FF] transition-all'
            >
              <ArrowLeft className='w-4 h-4' />
              Back to List
            </motion.button>
          )}
        </div>
      </motion.div>

      <AnimatePresence mode='wait'>

        {/* ── LIST VIEW ── */}
        {view === 'list' && (
          <motion.div
            key='list'
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Search bar */}
            <div className='flex items-center gap-3 bg-white border-2 border-[#DCEAFF] rounded-2xl px-4 py-3 mb-5 focus-within:border-blue-400 transition-all'>
              <Search className='w-4 h-4 text-gray-400 flex-shrink-0' />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder='Search by student name or department…'
                className='flex-1 bg-transparent text-sm font-semibold outline-none text-gray-700 placeholder-gray-400'
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')}>
                  <X className='w-4 h-4 text-gray-400 hover:text-gray-600' />
                </button>
              )}
            </div>

            {/* Loading */}
            {loadingNotes && (
              <div className='flex items-center justify-center py-20 gap-3'>
                <Loader2 className='w-6 h-6 animate-spin text-blue-500' />
                <p className='text-sm font-bold text-gray-400'>Loading prescriptions…</p>
              </div>
            )}

            {/* Empty state */}
            {!loadingNotes && filteredNotes.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className='text-center py-20'
              >
                <div className='w-16 h-16 bg-[#EEF3FF] rounded-3xl flex items-center justify-center mx-auto mb-4 border-2 border-[#DCEAFF]'>
                  <FileText className='w-8 h-8 text-blue-400' />
                </div>
                <p className='font-black text-gray-700 text-lg mb-1'>
                  {searchQuery ? 'No prescriptions match your search' : 'No prescriptions yet'}
                </p>
                <p className='text-sm text-gray-400 font-semibold mb-6'>
                  {searchQuery ? 'Try a different name or department.' : 'Click "Create New Prescription" to get started.'}
                </p>
                {!searchQuery && (
                  <button
                    onClick={() => setView('create')}
                    className='inline-flex items-center gap-2 bg-blue-600 text-white font-black text-sm px-5 py-3 rounded-2xl shadow-lg shadow-blue-500/25 hover:bg-blue-700 transition-all'
                  >
                    <Plus className='w-4 h-4' />
                    Create New Prescription
                  </button>
                )}
              </motion.div>
            )}

            {/* Cards */}
            {!loadingNotes && filteredNotes.length > 0 && (
              <div className='space-y-4'>
                {filteredNotes.map((note, i) => (
                  <PrescriptionCard key={note.id} note={note} index={i} />
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ── CREATE VIEW ── */}
        {view === 'create' && (
          <motion.div
            key='create'
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <CreateForm
              students={students}
              onSaved={fetchNotes}
              onCancel={() => setView('list')}
            />
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
