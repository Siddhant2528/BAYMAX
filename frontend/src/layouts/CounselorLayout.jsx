import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';
import { Users, CalendarDays, FileText, CheckCircle2, Clock, Calendar } from 'lucide-react';
import { appointments } from '../services/api';

const counselorNav = [
  { name: 'Student Feed', href: '/counselor/dashboard', icon: Users },
  { name: 'Appointments', href: '/counselor/appointments', icon: CalendarDays },
  { name: 'Session Notes', href: '/counselor/notes', icon: FileText },
];

/* ── Helper: format ISO date string to a short readable form ─ */
const parseUTC = (str) => new Date(str && !str.endsWith('Z') ? str + 'Z' : str);
function shortDate(str) {
  const d = parseUTC(str);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) +
    ' · ' +
    d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

/* ── Mini appointments widget rendered inside the sidebar ────── */
function AppointmentsSidebarWidget({ appts }) {
  const navigate = useNavigate();

  return (
    <div className='rounded-2xl border border-emerald-200 bg-emerald-50 overflow-hidden'>
      {/* Header */}
      <div className='flex items-center justify-between px-3 py-2.5 border-b border-emerald-100'>
        <div className='flex items-center gap-1.5'>
          <Calendar className='w-3.5 h-3.5 text-emerald-600' />
          <span className='text-xs font-black text-emerald-800 uppercase tracking-wider'>
            Confirmed
          </span>
        </div>
        <span className='text-xs font-black bg-emerald-600 text-white px-2 py-0.5 rounded-full'>
          {appts.length}
        </span>
      </div>

      {/* List */}
      <div className='max-h-52 overflow-y-auto'>
        {appts.length === 0 ? (
          <div className='px-3 py-4 text-center'>
            <p className='text-xs text-emerald-600 font-semibold'>No confirmed appointments yet</p>
          </div>
        ) : (
          appts.map((a) => (
            <div
              key={a.id}
              onClick={() => navigate('/counselor/appointments')}
              className='flex items-center gap-2.5 px-3 py-2.5 hover:bg-emerald-100 cursor-pointer transition-colors border-b border-emerald-100/60 last:border-0'
            >
              {/* Avatar */}
              <div className='w-7 h-7 rounded-lg bg-emerald-200 flex items-center justify-center text-emerald-800 text-xs font-black flex-shrink-0'>
                {a.student_name?.[0]?.toUpperCase() || '?'}
              </div>
              {/* Info */}
              <div className='min-w-0 flex-1'>
                <p className='text-xs font-black text-gray-800 truncate'>
                  {a.student_name || `Student #${String(a.student_id).slice(0, 5)}`}
                </p>
                <div className='flex items-center gap-1 mt-0.5'>
                  <Clock className='w-2.5 h-2.5 text-emerald-500 flex-shrink-0' />
                  <p className='text-[10px] text-emerald-600 font-semibold truncate'>
                    {shortDate(a.appointment_date)}
                  </p>
                </div>
              </div>
              <CheckCircle2 className='w-3.5 h-3.5 text-emerald-500 flex-shrink-0' />
            </div>
          ))
        )}
      </div>

      {/* View all link */}
      <button
        onClick={() => navigate('/counselor/appointments')}
        className='w-full text-center text-[10px] font-black text-emerald-700 hover:text-emerald-900 py-2 border-t border-emerald-100 hover:bg-emerald-100 transition-colors'
      >
        View All Appointments →
      </button>
    </div>
  );
}

export default function CounselorLayout() {
  const [confirmedAppts, setConfirmedAppts] = useState([]);

  useEffect(() => {
    appointments.getCounselorAppointments()
      .then(res => {
        const data = res.data?.data || [];
        const confirmed = Array.isArray(data)
          ? data.filter(a => a.status === 'confirmed')
          : [];
        setConfirmedAppts(confirmed);
      })
      .catch(() => setConfirmedAppts([]));
  }, []);

  return (
    <DashboardLayout
      navigationItems={counselorNav}
      role="COUNSELOR"
      extraSidebarContent={<AppointmentsSidebarWidget appts={confirmedAppts} />}
    >
      <Outlet />
    </DashboardLayout>
  );
}
