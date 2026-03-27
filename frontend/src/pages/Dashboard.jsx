import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardCheck, MessageSquare, CalendarHeart, BookOpen, Activity, Clock, ShieldAlert, CalendarClock, Bell, Video, ExternalLink, X } from 'lucide-react';
import { screening, appointments, notifications } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem('baymax_user') || '{}');
  const [history, setHistory] = useState([]);
  const [appointmentsList, setAppointmentsList] = useState([]);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [showApptBlocker, setShowApptBlocker] = useState(false);
  const [notifList, setNotifList] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef(null);
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    // Fetch History
    screening.history()
      .then(res => setHistory(res.data?.data || []))
      .catch(err => console.error("Could not fetch history", err));

    // Fetch Appointments
    appointments.getMine()
      .then(res => setAppointmentsList(res.data?.data || []))
      .catch(err => console.error("Could not fetch appointments", err));

    // Fetch Notifications
    notifications.getMine()
      .then(res => {
        const list = res.data?.data || [];
        setNotifList(list);
        const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000);
        setUnreadCount(list.filter(n => new Date(n.created_at) > cutoff).length);
      })
      .catch(err => console.error("Could not fetch notifications", err));
  }, []);

  // Close notif dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const upcomingSession = appointmentsList.find(a => a.status === 'pending' || a.status === 'confirmed');

  const hasTakenRecently = history.length > 0 &&
    (new Date().getTime() - new Date(history[0].created_at).getTime()) < 7 * 24 * 60 * 60 * 1000;

  const hasBookedRecently = appointmentsList.length > 0 &&
    (new Date().getTime() - new Date(appointmentsList[0].created_at).getTime()) < 7 * 24 * 60 * 60 * 1000;

  const cards = [
    { id: 'screening', to: '/student/screening', icon: ClipboardCheck, titleKey: 'dash_takeScreening', descKey: 'dash_screeningDesc', gradient: 'from-blue-500 to-indigo-500', glow: 'shadow-blue-200' },
    { id: 'chat', to: '/student/chat', icon: MessageSquare, titleKey: 'dash_chatBaymax', descKey: 'dash_chatDesc', gradient: 'from-teal-400 to-emerald-500', glow: 'shadow-emerald-200' },
    { id: 'appointments', to: '/student/appointments', icon: CalendarHeart, titleKey: 'dash_bookCounselor', descKey: 'dash_bookDesc', gradient: 'from-purple-500 to-pink-500', glow: 'shadow-purple-200' },
    { id: 'resources', to: '/student/resources', icon: BookOpen, titleKey: 'dash_selfHelp', descKey: 'dash_selfHelpDesc', gradient: 'from-amber-400 to-orange-500', glow: 'shadow-amber-200' },
  ];

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  const getSeverityStyle = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'severe':
      case 'moderately_severe':
        return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'moderate':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      default:
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <div className='max-w-6xl mx-auto pb-10'>
      {/* ── Header ── */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className='mb-10'>
        <div className='flex items-center justify-between gap-4'>
          {/* Welcome text */}
          <div className='flex-1'>
            <p className='text-sm font-black text-blue-500 uppercase tracking-widest mb-1'>{t('dash_greeting')}</p>
            <h1 className='text-4xl font-black text-gray-900 tracking-tight mb-2'>
              {user.name || 'Friend'} <span className='text-red-500'>❤️</span>
            </h1>
            <p className='text-lg text-gray-500 font-semibold'>{t('dash_companionQuestion')}</p>
          </div>

          <div className='flex items-center gap-3'>
            {/* Baymax floating character */}
            <div className='hidden sm:block'>
              <img
                src='/images/baymax_stand.png'
                alt='Baymax'
                className='w-24 h-auto baymax-float drop-shadow-lg'
              />
            </div>

            {/* Notifications Bell */}
            <div className='relative flex-shrink-0' ref={notifRef}>
              <button
                onClick={() => { setShowNotifs(v => !v); setUnreadCount(0); }}
                className='relative p-3 bg-white rounded-2xl border-2 border-[#DCEAFF] shadow-sm hover:bg-[#EEF3FF] transition'
              >
                <Bell className='w-5 h-5 text-blue-600' />
                {unreadCount > 0 && (
                  <span className='absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow baymax-pulse-glow'>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showNotifs && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    className='absolute right-0 top-14 w-80 bg-white rounded-3xl border-2 border-[#DCEAFF] shadow-xl z-50 overflow-hidden'
                  >
                    <div className='p-4 border-b border-[#EEF3FF] bg-[#EEF3FF] flex justify-between items-center'>
                       <p className='font-black text-gray-800 text-sm flex items-center gap-2'>
                        <Bell className='w-4 h-4 text-blue-600' /> {t('dash_notifications')}
                      </p>
                      <button onClick={() => setShowNotifs(false)} className='text-gray-400 hover:text-gray-600'>
                        <X className='w-4 h-4' />
                      </button>
                    </div>
                    <div className='max-h-72 overflow-y-auto divide-y divide-gray-50'>
                      {notifList.length === 0 ? (
                        <div className='text-center py-8'>
                          <img src='/images/baymax_stand.png' alt='Baymax' className='w-12 h-12 object-contain mx-auto mb-2 opacity-30'/>
                          <p className='text-gray-400 text-sm font-semibold'>{t('dash_noNotifications')}</p>
                        </div>
                      ) : notifList.map((n, i) => (
                        <div key={n.id || i} className='px-4 py-3 hover:bg-[#EEF3FF] transition'>
                          <p className='text-xs font-black text-blue-600 uppercase tracking-wider mb-1'>
                            {n.type?.replace('_', ' ')}
                          </p>
                          <p className='text-sm text-gray-700 font-semibold leading-snug whitespace-pre-line'>{n.message}</p>
                          <p className='text-xs text-gray-400 mt-1 font-medium'>
                            {new Date(n.created_at).toLocaleString('en-IN', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}
                          </p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Quick Action Cards ── */}
      <motion.div variants={containerVariants} initial='hidden' animate='show' className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10'>
        {cards.map(card => {
          const Icon = card.icon;
          const isScreening = card.id === 'screening';
          const isAppointments = card.id === 'appointments';

          const InnerContent = (
            <>
              <div className={`absolute top-0 right-0 w-28 h-28 bg-gradient-to-br ${card.gradient} opacity-10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-125 duration-500`} />
              <div className={`w-13 h-13 w-14 h-14 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center text-white mb-5 shadow-lg ${card.glow}`}>
                <Icon size={26} />
              </div>
              <h3 className='text-lg font-black text-gray-800 mb-1.5'>{t(card.titleKey)}</h3>
              <p className='text-gray-400 text-sm font-semibold'>{t(card.descKey)}</p>
            </>
          );

          return (
            <motion.div key={card.to} variants={itemVariants} whileHover={{ scale: 1.04, y: -4 }} whileTap={{ scale: 0.97 }}>
              {isScreening ? (
                <button onClick={() => setShowDisclaimer(true)} className='block w-full text-left h-full relative overflow-hidden bg-white rounded-3xl p-6 border-2 border-[#DCEAFF] hover:border-blue-300 hover:shadow-lg hover:shadow-blue-100 transition-all group'>
                  {InnerContent}
                </button>
              ) : isAppointments && hasBookedRecently ? (
                <button onClick={() => setShowApptBlocker(true)} className='block w-full text-left h-full relative overflow-hidden bg-white rounded-3xl p-6 border-2 border-[#DCEAFF] hover:border-purple-300 hover:shadow-lg hover:shadow-purple-100 transition-all group'>
                  {InnerContent}
                </button>
              ) : (
                <Link to={card.to} className='block h-full relative overflow-hidden bg-white rounded-3xl p-6 border-2 border-[#DCEAFF] hover:border-blue-300 hover:shadow-lg hover:shadow-blue-100 transition-all group'>
                  {InnerContent}
                </Link>
              )}
            </motion.div>
          );
        })}
      </motion.div>

      {/* ── Upcoming Session ── */}
      {upcomingSession && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className='mb-8 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-6 sm:p-8 shadow-xl shadow-purple-500/20 flex flex-col sm:flex-row items-center justify-between gap-6 overflow-hidden relative'
        >
          <div className='absolute right-0 top-0 opacity-10 transform scale-150 -translate-y-10 translate-x-10'>
            <CalendarClock className='w-48 h-48 text-white' />
          </div>
          <div className='relative z-10 text-white'>
            <div className='flex items-center gap-3 mb-2'>
              <CalendarHeart className='text-pink-200' />
              <h2 className='text-2xl font-black'>{upcomingSession.status === 'confirmed' ? t('dash_sessionConfirmed') : t('dash_sessionRequested')}</h2>
            </div>
            <p className='text-purple-100 font-semibold mb-3 max-w-lg'>
              {upcomingSession.status === 'confirmed'
                ? t('dash_sessionConfirmedMsg')
                : t('dash_sessionRequestedMsg')}
            </p>
            <div className='inline-flex items-center gap-2 bg-black/20 px-4 py-2 rounded-xl backdrop-blur-sm'>
              <Clock className='w-4 h-4 text-purple-200' />
              <span className='font-black tracking-wide'>
                {new Date(upcomingSession.appointment_date && !upcomingSession.appointment_date.endsWith('Z') ? upcomingSession.appointment_date + 'Z' : upcomingSession.appointment_date).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
          <div className='relative z-10 w-full sm:w-auto flex flex-col items-center sm:items-end gap-3'>
            <span className={`inline-block px-5 py-2.5 rounded-2xl font-black uppercase tracking-widest text-sm shadow-inner ${upcomingSession.status === 'confirmed' ? 'bg-emerald-400 text-emerald-900' : 'bg-amber-400 text-amber-900'}`}>
              {upcomingSession.status}
            </span>
            {upcomingSession.status === 'confirmed' && upcomingSession.meeting_link && (
              <a
                href={upcomingSession.meeting_link}
                target='_blank'
                rel='noopener noreferrer'
                className='inline-flex items-center gap-2 bg-white text-indigo-700 font-black px-5 py-2.5 rounded-2xl shadow-md hover:bg-indigo-50 transition text-sm'
              >
                <Video className='w-4 h-4' />
                {t('dash_joinSession')}
                <ExternalLink className='w-3.5 h-3.5 opacity-60' />
              </a>
            )}
          </div>
        </motion.div>
      )}

      {/* ── Assessment History ── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className='bg-white rounded-3xl overflow-hidden border-2 border-[#DCEAFF] shadow-sm'>
        <div className='bg-[#EEF3FF] px-8 py-5 border-b border-[#DCEAFF] flex items-center justify-between'>
          <h2 className='text-xl font-black text-gray-800 flex items-center gap-2'>
            <Activity className='text-blue-500 w-5 h-5' /> {t('dash_assessmentHistory')}
          </h2>
          <span className='bg-white text-blue-600 px-3 py-1 rounded-full text-xs font-black border-2 border-[#DCEAFF] shadow-sm flex items-center gap-1'>
            <Clock className='w-3 h-3'/> {history.length} {t('dash_records')}
          </span>
        </div>

        <div className='p-6 sm:p-8'>
          {history.length === 0 ? (
            <div className='text-center py-10'>
              <img src='/images/baymax_stand.png' alt='Baymax' className='w-24 h-auto object-contain mx-auto mb-4 opacity-40 baymax-float-slow' />
              <p className='text-gray-400 font-semibold text-lg mb-4'>{t('dash_noScreenings')}</p>
              <button onClick={() => setShowDisclaimer(true)} className='inline-flex bg-blue-50 text-blue-700 px-6 py-2.5 rounded-2xl font-black hover:bg-blue-100 transition-colors border-2 border-blue-100'>
                {t('dash_firstTest')}
              </button>
            </div>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <AnimatePresence>
                {history.map((record, idx) => (
                  <motion.div
                    key={record.id || idx}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className='flex items-center justify-between p-5 rounded-2xl border-2 border-[#EEF3FF] hover:border-blue-200 hover:shadow-md hover:shadow-blue-50 transition-all group'
                  >
                    <div>
                      <p className='text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5'>
                        <Clock className='w-3 h-3'/> {new Date(record.created_at).toLocaleDateString()} at {new Date(record.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <h4 className='text-xl font-black text-gray-800 mb-1'>{record.test_type} {t('dash_assessment')}</h4>
                      <p className='text-sm text-gray-400 font-semibold'>{t('dash_score')} <span className='text-gray-900 font-black'>{record.score}</span></p>
                    </div>
                    <div className='text-right'>
                      <div className={`px-4 py-2 rounded-2xl border font-black text-xs uppercase tracking-wide inline-block ${getSeverityStyle(record.severity)}`}>
                        {record.severity?.replace('_', ' ')}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.div>

      {/* ── Disclaimer Modal ── */}
      <AnimatePresence>
        {showDisclaimer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl relative border-2 border-[#DCEAFF]"
            >
              {hasTakenRecently ? (
                <>
                  <div className="flex flex-col items-center mb-6">
                    <img src='/images/baymax_stand.png' alt='Baymax' className='w-20 h-auto object-contain baymax-float mb-3' />
                    <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center shadow-inner">
                      <ShieldAlert className="w-6 h-6" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-black text-center text-gray-900 mb-3">{t('dash_weSorry')}</h3>
                  <p className="text-center text-gray-500 mb-8 font-semibold leading-relaxed">
                    {t('dash_takenRecently')} {new Date(history[0].created_at).toLocaleDateString()}{t('dash_checkBackLater')}
                  </p>
                  <button
                    onClick={() => setShowDisclaimer(false)}
                    className="w-full py-3.5 px-4 rounded-2xl font-black text-white bg-rose-500 hover:bg-rose-600 shadow-md shadow-rose-500/20 transition-all"
                  >
                    {t('dash_close')}
                  </button>
                </>
              ) : (
                <>
                  <div className="flex flex-col items-center mb-6">
                    <img src='/images/baymax_stand.png' alt='Baymax' className='w-20 h-auto object-contain baymax-float mb-3'/>
                    <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center shadow-inner">
                      <ShieldAlert className="w-6 h-6" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-black text-center text-gray-900 mb-3">{t('dash_importantNotice')}</h3>
                  <p className="text-center text-gray-500 mb-8 font-semibold leading-relaxed">
                    {t('dash_disclaimerMsg')}
                  </p>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setShowDisclaimer(false)}
                      className="flex-1 py-3.5 px-4 rounded-2xl font-black text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                      {t('dash_cancel')}
                    </button>
                    <button
                      onClick={() => navigate('/student/screening')}
                      className="flex-1 py-3.5 px-4 rounded-2xl font-black text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all"
                    >
                      {t('dash_okProceed')}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Appointment Blocker Modal ── */}
      <AnimatePresence>
        {showApptBlocker && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl relative border-2 border-[#DCEAFF]"
            >
              <div className="flex flex-col items-center mb-6">
                <img src='/images/baymax_stand.png' alt='Baymax' className='w-20 h-auto object-contain baymax-float mb-3' />
                <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center shadow-inner">
                  <ShieldAlert className="w-6 h-6" />
                </div>
              </div>
              <h3 className="text-2xl font-black text-center text-gray-900 mb-3">{t('dash_weSoSorry')}</h3>
              <p className="text-center text-gray-500 mb-8 font-semibold leading-relaxed">
                {t('dash_apptBlockMsg')} {new Date(appointmentsList[0].created_at).toLocaleDateString()}{t('dash_checkNextWeek')}
              </p>
              <button
                onClick={() => setShowApptBlocker(false)}
                className="w-full py-3.5 px-4 rounded-2xl font-black text-white bg-rose-500 hover:bg-rose-600 shadow-md shadow-rose-500/20 transition-all"
              >
                {t('dash_close')}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
