import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { ShieldAlert, Users, CalendarClock, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { counselor as counselorApi } from '../services/api';

import StudentsSection from '../components/StudentsSection';
import CrisisAlertSection from '../components/CrisisAlertSection';
import RequestsSection from '../components/RequestsSection';

const TABS = [
  { id: 'students',  label: 'Students',   icon: Users,       accent: 'blue'   },
  { id: 'crisis',    label: 'CRI Alerts', icon: ShieldAlert, accent: 'rose'   },
  { id: 'requests',  label: 'Requests',   icon: CalendarClock, accent: 'purple' },
];

function TabButton({ tab, active, onClick, badge }) {
  const Icon = tab.icon;
  const accentMap = {
    blue:   { active: 'bg-blue-600 text-white shadow-blue-300',   hover: 'hover:bg-blue-50 hover:text-blue-700',   badge: 'bg-blue-100 text-blue-700'   },
    rose:   { active: 'bg-rose-600 text-white shadow-rose-300',   hover: 'hover:bg-rose-50 hover:text-rose-700',   badge: 'bg-rose-100 text-rose-700 animate-pulse'   },
    purple: { active: 'bg-purple-600 text-white shadow-purple-300', hover: 'hover:bg-purple-50 hover:text-purple-700', badge: 'bg-purple-100 text-purple-700' },
  };
  const a = accentMap[tab.accent];

  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl font-black text-sm transition-all shadow-sm ${
        active ? `${a.active} shadow-lg` : `bg-white text-gray-500 border-2 border-[#DCEAFF] ${a.hover}`
      }`}
    >
      <Icon className='w-4 h-4' />
      {tab.label}
      {badge > 0 && (
        <span className={`text-xs font-black px-2 py-0.5 rounded-full ${active ? 'bg-white/20 text-white' : a.badge}`}>
          {badge}
        </span>
      )}
    </motion.button>
  );
}

export default function CounselorDashboard() {
  const [activeTab, setActiveTab] = useState('students');
  const [socket, setSocket] = useState(null);
  const [liveAlerts, setLiveAlerts] = useState([]);

  // Live stats
  const [stats, setStats] = useState({ totalStudents: 0, crisisStudents: 0, pendingRequests: 0 });
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    // Fetch dashboard stats
    counselorApi.getDashboard()
      .then(res => {
        const d = res.data.data || {};
        setStats({
          totalStudents: d.totalStudents || 0,
          crisisStudents: d.crisisStudents || 0,
          pendingRequests: d.pendingRequests || 0,
        });
        setPendingCount(Number(d.pendingRequests) || 0);
      })
      .catch(console.error);

    // Socket for live emergency alerts
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    newSocket.on('connect', () => newSocket.emit('join_counselor'));
    newSocket.on('emergency_alert', (data) => {
      setLiveAlerts(prev => [data, ...prev]);
      if (Notification.permission === 'granted') {
        new Notification('CRITICAL RISK ALERT', {
          body: `High risk detected: ${data.message}`,
          icon: '/favicon.ico'
        });
      }
    });

    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => newSocket.close();
  }, []);

  const tabBadges = {
    students: Number(stats.totalStudents),
    crisis:   Number(stats.crisisStudents) + liveAlerts.length,
    requests: pendingCount,
  };

  return (
    <div className='max-w-7xl mx-auto'>

      {/* ── Page Header ── */}
      <div className='flex justify-between items-center mb-8 flex-wrap gap-4'>
        <div className='flex items-center gap-4'>
          <img
            src='/images/baymax_armor.png'
            alt='Baymax counselor'
            className='w-16 h-auto object-contain baymax-float-slow hidden sm:block'
          />
          <div>
            <h1 className='text-3xl font-black text-gray-900 tracking-tight'>Counselor Command Center</h1>
            <p className='text-gray-400 font-semibold mt-0.5'>Monitoring your students in real-time.</p>
          </div>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border-2 font-bold text-sm ${
          socket?.connected
            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
            : 'bg-gray-50 border-gray-200 text-gray-500'
        }`}>
          <div className={`w-3 h-3 rounded-full ${socket?.connected ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
          {socket?.connected ? 'System Live' : 'Reconnecting...'}
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-5 mb-8'>
        <motion.div
          whileHover={{ scale: 1.02, y: -3 }}
          className='bg-white p-6 rounded-3xl border-2 border-[#DCEAFF] shadow-sm cursor-pointer hover:border-blue-300 hover:shadow-md hover:shadow-blue-50 transition-all'
          onClick={() => setActiveTab('students')}
        >
          <div className='flex items-center gap-4'>
            <div className='bg-blue-50 p-4 rounded-2xl text-blue-600 border-2 border-blue-100'>
              <Users className='w-7 h-7' />
            </div>
            <div>
              <p className='text-xs font-black text-gray-400 uppercase tracking-wider mb-1'>Total Students</p>
              <p className='text-4xl font-black text-gray-900'>{stats.totalStudents}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02, y: -3 }}
          className='bg-rose-50 p-6 rounded-3xl border-2 border-rose-200 shadow-sm cursor-pointer hover:border-rose-400 hover:shadow-md hover:shadow-rose-100 transition-all'
          onClick={() => setActiveTab('crisis')}
        >
          <div className='flex items-center gap-4'>
            <div className='bg-rose-100 p-4 rounded-2xl text-rose-600 border-2 border-rose-200'>
              <ShieldAlert className='w-7 h-7' />
            </div>
            <div>
              <p className='text-xs font-black text-rose-600/70 uppercase tracking-wider mb-1'>CRI Alerts</p>
              <p className='text-4xl font-black text-rose-800'>{tabBadges.crisis}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02, y: -3 }}
          className='bg-purple-50 p-6 rounded-3xl border-2 border-purple-200 shadow-sm cursor-pointer hover:border-purple-400 hover:shadow-md hover:shadow-purple-100 transition-all'
          onClick={() => setActiveTab('requests')}
        >
          <div className='flex items-center gap-4'>
            <div className='bg-purple-100 p-4 rounded-2xl text-purple-600 border-2 border-purple-200'>
              <CalendarClock className='w-7 h-7' />
            </div>
            <div>
              <p className='text-xs font-black text-purple-600/70 uppercase tracking-wider mb-1'>Pending Requests</p>
              <p className='text-4xl font-black text-purple-900'>{pendingCount}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Live Alert Banner ── */}
      <AnimatePresence>
        {liveAlerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className='bg-rose-600 text-white rounded-2xl px-5 py-4 mb-6 flex items-center gap-3 shadow-xl shadow-rose-500/30'
          >
            <Activity className='w-5 h-5 animate-pulse flex-shrink-0' />
            <span className='font-black text-sm'>
              🚨 {liveAlerts.length} new live emergency alert{liveAlerts.length > 1 ? 's' : ''} received.
            </span>
            <button
              onClick={() => setActiveTab('crisis')}
              className='ml-auto text-xs bg-white text-rose-700 font-black px-3 py-1 rounded-xl hover:bg-rose-100 transition-colors'
            >
              View CRI Alerts →
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Tab Navigation ── */}
      <div className='flex gap-3 mb-6 flex-wrap'>
        {TABS.map(tab => (
          <TabButton
            key={tab.id}
            tab={tab}
            active={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            badge={tabBadges[tab.id]}
          />
        ))}
      </div>

      {/* ── Tab Content ── */}
      <AnimatePresence mode='wait'>
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'students' && <StudentsSection />}
          {activeTab === 'crisis'   && <CrisisAlertSection />}
          {activeTab === 'requests' && (
            <RequestsSection
              onUpdate={(count) => {
                setPendingCount(count);
                setStats(prev => ({ ...prev, pendingRequests: count }));
              }}
            />
          )}
        </motion.div>
      </AnimatePresence>

    </div>
  );
}
