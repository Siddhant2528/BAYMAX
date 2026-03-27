import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, LogOut, User, X, Mail, Shield, Phone, BookOpen } from 'lucide-react';
import { users } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

export default function DashboardLayout({ navigationItems, role, children, extraSidebarContent }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  
  // Modals & Dropdowns State
  const [showProfile, setShowProfile] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  // Fetch logic
  useEffect(() => {
    if (showProfile) {
      setLoadingProfile(true);
      users.getProfile()
        .then(res => setProfileData(res.data?.data || null))
        .catch(err => console.error(err))
        .finally(() => setLoadingProfile(false));
    }
  }, [showProfile]);

  const handleLogout = () => {
    localStorage.removeItem('baymax_token');
    localStorage.removeItem('baymax_user');
    navigate('/login');
  };

  // Baymax role accent colors
  const roleAccents = {
    STUDENT: { gradient: 'from-blue-600 to-indigo-600', glow: 'shadow-blue-500/30', dot: 'bg-blue-500' },
    COUNSELOR: { gradient: 'from-teal-500 to-emerald-600', glow: 'shadow-teal-500/30', dot: 'bg-teal-500' },
    ADMIN: { gradient: 'from-rose-500 to-red-600', glow: 'shadow-rose-500/30', dot: 'bg-rose-500' },
  };
  const accent = roleAccents[role] || roleAccents.STUDENT;

  const SidebarContent = () => (
    <div className='flex flex-col h-full bg-white'>
      {/* Sidebar Header */}
      <div className={`p-5 bg-gradient-to-r ${accent.gradient} text-white relative overflow-hidden`}>
        <div className='absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full -translate-y-10 translate-x-10' />
        <div className='relative z-10 flex items-center gap-3'>
          <img src='/images/baymax_stand.png' alt='Baymax' className='w-10 h-10 object-contain drop-shadow-md' />
          <div>
            <h1 className='text-lg font-black tracking-tight'>BAYMAX</h1>
            <p className='text-xs text-white/75 font-bold uppercase tracking-wider'>{role === 'STUDENT' ? t('layout_studentPortal') : `${role} PORTAL`}</p>
          </div>
        </div>
      </div>

      {/* Nav Items */}
      <div className='flex-1 overflow-y-auto py-5 px-3 space-y-1'>
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.href);
          return (
            <NavLink
              key={item.href}
              to={item.href}
              className={() => `
                flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 font-bold text-sm relative
                ${isActive
                  ? 'bg-[#EEF3FF] text-blue-700 shadow-sm border border-[#DCEAFF]'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
            >
              {isActive && (
                <span className='absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-red-500 rounded-r-full' />
              )}
              <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
              {item.nameKey ? t(item.nameKey) : item.name}
            </NavLink>
          );
        })}
      </div>

      {/* Extra content slot (e.g. confirmed appointments list) */}
      {extraSidebarContent && (
        <div className='px-3 mb-3'>
          {extraSidebarContent}
        </div>
      )}

      {/* Baymax quote */}
      <div className='mx-3 mb-3 p-3 bg-[#EEF3FF] rounded-2xl border border-[#DCEAFF]'>
        <p className='text-xs text-blue-700 font-bold text-center italic'>{t('layout_baymaxQuote')}</p>
      </div>

      {/* Logout */}
      <div className='p-3 border-t border-gray-100'>
        <button
          onClick={handleLogout}
          className='w-full flex items-center gap-3 px-4 py-3 text-rose-600 hover:bg-rose-50 rounded-2xl transition-colors font-bold text-sm'
        >
          <LogOut className='w-5 h-5' />
          {t('layout_signOut')}
        </button>
      </div>
    </div>
  );

  return (
    <div className='min-h-screen bg-[#EEF3FF] flex'>
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className='fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 lg:hidden'
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className='fixed inset-y-0 left-0 w-72 shadow-2xl z-50 lg:hidden'
            >
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <div 
        className={`hidden lg:flex flex-col fixed inset-y-0 shadow-lg border-r border-[#DCEAFF] z-30 transition-all duration-300 ease-in-out ${desktopSidebarOpen ? 'w-72' : 'w-0 overflow-hidden'}`}
      >
        <div className='w-72 flex-shrink-0 h-full flex flex-col'>
          <SidebarContent />
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out ${desktopSidebarOpen ? 'lg:pl-72' : 'lg:pl-0'}`}>
        {/* Top Header */}
        <header className='h-16 bg-white/80 backdrop-blur-md border-b border-[#DCEAFF] flex items-center justify-between px-4 sm:px-6 lg:px-8 shadow-sm z-20 sticky top-0'>
          <button
            onClick={() => {
              if (window.innerWidth >= 1024) {
                setDesktopSidebarOpen(!desktopSidebarOpen);
              } else {
                setSidebarOpen(true);
              }
            }}
            className='p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition'
          >
            <Menu className='w-6 h-6' />
          </button>

          <div className='flex-1' />

          <div className='flex items-center gap-3 relative'>
            {/* Profile Avatar */}
            <button
              onClick={() => setShowProfile(true)}
              className={`w-9 h-9 rounded-2xl bg-gradient-to-br ${accent.gradient} flex items-center justify-center text-white shadow-md ${accent.glow} hover:scale-105 transition-transform`}
            >
              <User className='w-4 h-4' />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className='flex-1 relative overflow-hidden flex flex-col'>
          <div className='flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8'>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className='max-w-7xl mx-auto h-full'
            >
              {children}
            </motion.div>
          </div>
        </main>
      </div>

      {/* Profile Modal */}
      <AnimatePresence>
        {showProfile && (
          <div className='fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6'>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowProfile(false)}
              className='absolute inset-0 bg-gray-900/40 backdrop-blur-sm'
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className='bg-white rounded-3xl shadow-2xl w-full max-w-md relative overflow-hidden flex flex-col border border-[#DCEAFF]'
            >
              {/* Profile Header */}
              <div className={`h-36 bg-gradient-to-r ${accent.gradient} relative overflow-hidden`}>
                <div className='absolute right-0 top-0 w-40 h-40 bg-white/10 rounded-full -translate-y-10 translate-x-10' />
                <button
                  onClick={() => setShowProfile(false)}
                  className='absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 text-white rounded-xl backdrop-blur-md transition-colors'
                >
                  <X className='w-5 h-5' />
                </button>
                {/* Baymax tiny image in profile header */}
                <div className='absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-1/2'>
                  <div className='w-20 h-20 rounded-2xl bg-white shadow-xl p-1'>
                    <div className={`w-full h-full rounded-xl bg-gradient-to-br ${accent.gradient} flex items-center justify-center text-white text-2xl font-black`}>
                      {profileData?.name?.charAt(0) || <User className='w-8 h-8'/>}
                    </div>
                  </div>
                </div>
              </div>

              <div className='px-8 pb-8 relative pt-14'>
                {loadingProfile ? (
                  <div className='animate-pulse space-y-4'>
                    <div className='h-8 bg-gray-100 rounded-xl w-1/2 mx-auto'></div>
                    <div className='h-4 bg-gray-100 rounded-xl w-1/3 mx-auto'></div>
                    <div className='h-20 bg-gray-50 rounded-2xl mt-6'></div>
                  </div>
                ) : profileData ? (
                  <div>
                    <h2 className='text-2xl font-black text-gray-900 text-center mb-1'>{profileData.name}</h2>
                    <p className='text-blue-600 font-black uppercase tracking-widest text-xs mb-6 flex items-center gap-2 justify-center'>
                      <Shield className='w-4 h-4'/> {profileData.role || role} Account
                    </p>

                    <div className='space-y-3'>
                      <div className='p-4 bg-[#EEF3FF] rounded-2xl border border-[#DCEAFF] flex items-center gap-4'>
                        <div className='p-2.5 bg-white rounded-xl shadow-sm text-blue-500'>
                          <Mail className='w-5 h-5'/>
                        </div>
                        <div>
                           <p className='text-xs font-black text-gray-400 uppercase tracking-wider mb-0.5'>{t('layout_emailAddress')}</p>
                          <p className='text-gray-900 font-bold'>{profileData.email}</p>
                        </div>
                      </div>



                      {role === 'STUDENT' && profileData.guardian_phone && (
                        <div className='p-4 bg-[#EEF3FF] rounded-2xl border border-[#DCEAFF] flex items-center gap-4'>
                          <div className='p-2.5 bg-white rounded-xl shadow-sm text-blue-500'>
                            <Phone className='w-5 h-5'/>
                          </div>
                          <div>
                             <p className='text-xs font-black text-gray-400 uppercase tracking-wider mb-0.5'>{t('layout_guardianContact')}</p>
                            <p className='text-gray-900 font-bold'>{profileData.guardian_phone}</p>
                          </div>
                        </div>
                      )}

                      {profileData.department && (
                        <div className='p-4 bg-[#EEF3FF] rounded-2xl border border-[#DCEAFF] flex items-center gap-4'>
                          <div className='p-2.5 bg-white rounded-xl shadow-sm text-blue-500'>
                            <BookOpen className='w-5 h-5'/>
                          </div>
                          <div>
                             <p className='text-xs font-black text-gray-400 uppercase tracking-wider mb-0.5'>{t('layout_department')}</p>
                            <p className='text-gray-900 font-bold'>{profileData.department}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className='text-red-500 text-center font-semibold'>{t('layout_failedProfile')}</p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
