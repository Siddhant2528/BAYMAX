import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { screening, appointments } from '../services/api';
import { CalendarHeart, Clock, User, FileText, CheckCircle2, ChevronRight, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';

export default function Appointments() {
  const [counselors, setCounselors] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  // Form state
  const [selectedCounselor, setSelectedCounselor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [bookingStatus, setBookingStatus] = useState(null); // 'loading', 'success', 'error'

  // Counselor Availability: 10 AM to 3 PM
  const availableTimes = ['10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM'];

  // Generate next 7 days using LOCAL date (not UTC) so IST users don't get off-by-one dates
  const getNextDays = () => {
    const dates = [];
    for(let i=1; i<=7; i++) {
        const d = new Date();
        d.setDate(d.getDate() + i);
        const yyyy = d.getFullYear();
        const mm   = String(d.getMonth() + 1).padStart(2, '0');
        const dd   = String(d.getDate()).padStart(2, '0');
        dates.push(`${yyyy}-${mm}-${dd}`);
    }
    return dates;
  };

  useEffect(() => {
    Promise.all([
      appointments.getCounselors(),
      screening.history()
    ]).then(([resCounselors, resHistory]) => {
      setCounselors(resCounselors.data.data || []);
      setHistory(resHistory.data.data || []);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const handleBook = async () => {
    if(!selectedCounselor || !selectedDate || !selectedTime) return;
    
    setBookingStatus('loading');
    
    // Parse time into full JS date logically
    const timeTo24h = (time12) => {
      const [time, period] = time12.split(' ');
      let [hours, minutes] = time.split(':');
      if (hours === '12' && period === 'AM') hours = '00';
      if (hours !== '12' && period === 'PM') hours = String(Number(hours) + 12);
      return `${hours}:${minutes}:00`;
    };

    // Build a timezone-aware ISO string using the local IST offset (+05:30).
    const [year, month, day] = selectedDate.split('-').map(Number);
    const time24 = timeTo24h(selectedTime);

    const pad = (n) => String(n).padStart(2, '0');
    const [hh, mm] = time24.split(':');
    const appointmentDate = `${year}-${pad(month)}-${pad(day)}T${pad(hh)}:${pad(mm)}:00+05:30`;

    try {
      await appointments.book({
        counselorId: selectedCounselor,
        appointmentDate: appointmentDate,
        mode: 'online'
      });
      setBookingStatus('success');
    } catch(err) {
      console.error(err);
      setBookingStatus('error');
    }
  };

  const getSeverityStyle = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'severe':
      case 'moderately_severe': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'moderate': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    }
  };

  const recentPHQ9 = history.find(h => h.test_type === 'PHQ9');
  const recentGAD7 = history.find(h => h.test_type === 'GAD7');

  if (loading) return (
    <div className='p-12 text-center'>
      <img src='/images/baymax_stand.png' alt='Baymax loading' className='w-20 h-auto mx-auto mb-4 baymax-float opacity-60' />
      <p className='text-gray-400 font-bold'>{t('layout_loading')}</p>
    </div>
  );

  if (bookingStatus === 'success') {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className='max-w-3xl mx-auto text-center py-16 bg-white rounded-3xl border-2 border-[#DCEAFF] shadow-sm'>
        <img
          src='/images/baymax_wave.png'
          alt='Baymax celebrating'
          className='w-36 h-auto object-contain mx-auto mb-6 baymax-float drop-shadow-lg'
        />
        <div className='w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4'>
          <CheckCircle2 className='w-9 h-9 text-emerald-500' />
        </div>
        <h2 className='text-3xl font-black text-gray-900 mb-4'>Request Sent! 🎉</h2>
        <p className='text-gray-500 text-lg mb-8 max-w-lg mx-auto font-semibold leading-relaxed'>
          Your appointment request has been submitted. The counselor will review and confirm or reschedule your time slot based on their availability.
        </p>
        <button onClick={() => window.location.reload()} className='bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black py-3.5 px-8 rounded-2xl shadow-lg shadow-blue-500/30 hover:shadow-xl transition-all'>
          Submit Another Request
        </button>
      </motion.div>
    );
  }

  return (
    <div className='max-w-6xl mx-auto pb-20'>
      {/* ── Back Button ── */}
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate('/student/dashboard')}
        className='flex items-center gap-2 mb-6 text-sm font-black text-gray-500 hover:text-purple-600 transition-colors group'
      >
        <span className='w-8 h-8 rounded-xl bg-white border-2 border-[#DCEAFF] flex items-center justify-center group-hover:border-purple-300 group-hover:bg-purple-50 transition-all shadow-sm'>
          <ArrowLeft className='w-4 h-4' />
        </span>
        Back to Dashboard
      </motion.button>
      {/* Page header */}
      <div className='mb-8 flex items-center gap-4'>
        <div className='p-3 bg-purple-100 rounded-2xl'>
          <CalendarHeart className='text-purple-600 w-8 h-8' />
        </div>
        <div>
          <h1 className='text-3xl font-black text-gray-900'>{t('appt_title')}</h1>
          <p className='text-gray-500 font-semibold mt-1'>{t('appt_bookNew')}</p>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        
        {/* Left Column: Recent Results */}
        <div className='lg:col-span-1 space-y-4'>
          <div className='bg-white p-6 rounded-3xl border-2 border-[#DCEAFF] shadow-sm'>
            <div className='flex items-center gap-2 mb-5 border-b-2 border-[#EEF3FF] pb-4'>
              <FileText className='text-gray-400 w-5 h-5' />
              <h3 className='font-black text-gray-900'>Recent Diagnostics</h3>
            </div>
            
            {recentPHQ9 ? (
              <div className='mb-4 p-4 bg-[#EEF3FF] rounded-2xl border-2 border-[#DCEAFF]'>
                <p className='text-sm text-gray-500 font-black mb-2'>PHQ-9 Depression</p>
                <div className='flex items-center justify-between'>
                  <span className='text-3xl font-black text-gray-900'>{recentPHQ9.score}</span>
                  <span className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-wide border ${getSeverityStyle(recentPHQ9.severity)}`}>
                    {recentPHQ9.severity.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ) : <p className='text-sm text-gray-400 mb-4 font-semibold'>No PHQ-9 record found.</p>}

            {recentGAD7 ? (
              <div className='p-4 bg-[#EEF3FF] rounded-2xl border-2 border-[#DCEAFF]'>
                <p className='text-sm text-gray-500 font-black mb-2'>GAD-7 Anxiety</p>
                <div className='flex items-center justify-between'>
                  <span className='text-3xl font-black text-gray-900'>{recentGAD7.score}</span>
                  <span className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-wide border ${getSeverityStyle(recentGAD7.severity)}`}>
                    {recentGAD7.severity.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ) : <p className='text-sm text-gray-400 font-semibold'>No GAD-7 record found.</p>}

            <div className='mt-5 pt-4 border-t-2 border-[#EEF3FF]'>
              <p className='text-xs text-gray-400 font-semibold leading-relaxed'>
                These scores are automatically shared with the counselor to guide your therapy session.
              </p>
            </div>
          </div>

          {/* Baymax care card */}
          <div className='bg-white p-5 rounded-3xl border-2 border-[#DCEAFF] shadow-sm flex items-center gap-4'>
            <img src='/images/baymax_stand.png' alt='Baymax' className='w-16 h-auto object-contain flex-shrink-0 baymax-float-slow' />
            <div>
              <p className='font-black text-gray-800 text-sm mb-1'>BAYMAX is here 🤍</p>
              <p className='text-xs text-gray-400 font-semibold leading-relaxed'>Seeking help is a sign of strength. You're taking great care of yourself!</p>
            </div>
          </div>
        </div>

        {/* Right Column: Booking Interface */}
        <div className='lg:col-span-2 space-y-5'>
          <div className='bg-white p-8 rounded-3xl border-2 border-[#DCEAFF] shadow-sm'>
            <h3 className='text-xl font-black text-gray-900 mb-5'>1. Select a Campus Counselor</h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {counselors.map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCounselor(c.id)}
                  className={`flex flex-col items-start p-5 rounded-2xl border-2 transition-all text-left ${
                    selectedCounselor === c.id
                      ? 'border-purple-500 bg-purple-50 shadow-md shadow-purple-100'
                      : 'border-[#DCEAFF] hover:border-purple-300 hover:bg-[#EEF3FF]'
                  }`}
                >
                  <div className='w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mb-3'>
                    <User className='w-5 h-5 text-purple-600'/>
                  </div>
                  <p className='font-black text-gray-900 mb-1'>{c.name}</p>
                  <p className='text-sm text-gray-400 font-semibold'>{c.email}</p>
                </button>
              ))}
            </div>
          </div>

          <motion.div
            initial={false}
            animate={{ opacity: selectedCounselor ? 1 : 0.5, pointerEvents: selectedCounselor ? 'auto' : 'none' }}
            className='bg-white p-8 rounded-3xl border-2 border-[#DCEAFF] shadow-sm'
          >
            <h3 className='text-xl font-black text-gray-900 mb-5'>2. Choose Date & Time</h3>
            
            <div className='mb-6'>
              <label className='block text-sm font-black text-gray-600 mb-3'>Select Available Date</label>
              <div className='flex gap-3 overflow-x-auto pb-3'>
                {getNextDays().map(dateStr => {
                  const d = new Date(dateStr);
                  const isSelected = selectedDate === dateStr;
                  return (
                    <button
                      key={dateStr}
                      onClick={() => setSelectedDate(dateStr)}
                      className={`flex-shrink-0 flex flex-col items-center justify-center w-20 py-3.5 rounded-2xl transition-all border-2 ${
                        isSelected
                          ? 'bg-gray-900 text-white border-gray-900 shadow-md scale-105'
                          : 'bg-white border-[#DCEAFF] text-gray-600 hover:border-gray-400'
                      }`}
                    >
                      <span className='text-xs font-black uppercase tracking-wider mb-1'>{d.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                      <span className='text-2xl font-black'>{d.getDate()}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <motion.div animate={{ opacity: selectedDate ? 1 : 0.4, pointerEvents: selectedDate ? 'auto' : 'none' }}>
              <label className='block text-sm font-black text-gray-600 mb-3'>Select 1-Hour Time Slot (10 AM - 3 PM)</label>
              <div className='grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8'>
                {availableTimes.map(time => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black transition-all border-2 text-sm ${
                      selectedTime === time
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                        : 'bg-[#EEF3FF] border-[#DCEAFF] text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    <Clock className='w-4 h-4' /> {time}
                  </button>
                ))}
              </div>

              <div className='pt-5 border-t-2 border-[#EEF3FF] flex flex-col sm:flex-row justify-between items-center gap-4'>
                <p className='text-sm text-gray-400 font-semibold'>
                  {!selectedTime ? 'Please select a time slot to continue.' : `Requesting session for ${selectedTime}`}
                </p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleBook}
                  disabled={!selectedTime || bookingStatus === 'loading'}
                  className='w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 disabled:opacity-50 transition-all flex items-center justify-center gap-2'
                >
                  {bookingStatus === 'loading' ? t('appt_submitting') : t('appt_submit')} <ChevronRight className='w-5 h-5' />
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </div>

      </div>
    </div>
  );
}
