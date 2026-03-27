import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, counselorAuth } from '../services/api';
import { ArrowRight, ShieldCheck, Activity, User, Shield, Stethoscope, Heart, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [role, setRole] = useState('STUDENT'); // STUDENT, COUNSELOR, ADMIN
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { lang, setLang, t } = useLanguage();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      let res;
      if (role === 'COUNSELOR') {
        res = await counselorAuth.login(form);
      } else {
        res = await auth.login(form);
        const userRole = res.data.data?.user?.role || res.data.user?.role || 'student';
        if (role === 'ADMIN' && userRole.toLowerCase() !== 'admin') {
          throw new Error('Access denied. You do not have Admin privileges.');
        }
      }
      const payloadData = res.data.data || res.data;
      localStorage.setItem('baymax_token', payloadData.token);
      localStorage.setItem('baymax_user', JSON.stringify(payloadData.user || payloadData.counselor));
      const resultingRole = (payloadData.user?.role || payloadData.counselor?.role || role).toUpperCase();
      navigate(`/${resultingRole.toLowerCase()}/dashboard`);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Authentication Failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { id: 'STUDENT', labelKey: 'login_role_student', icon: User, color: 'text-blue-600', bg: 'bg-blue-50', ring: 'ring-blue-500' },
    { id: 'COUNSELOR', labelKey: 'login_role_counselor', icon: Stethoscope, color: 'text-teal-600', bg: 'bg-teal-50', ring: 'ring-teal-500' },
    { id: 'ADMIN', labelKey: 'login_role_admin', icon: Shield, color: 'text-rose-600', bg: 'bg-rose-50', ring: 'ring-rose-500' }
  ];

  const roleSubmitColors = {
    STUDENT: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg',
    COUNSELOR: 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-lg',
    ADMIN: 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-lg',
  };

  const languages = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'hi', label: 'हिंदी', flag: '🇮🇳' },
    { code: 'mr', label: 'मराठी', flag: '🇮🇳' },
  ];

  return (
    <div className='min-h-screen flex bg-[#EEF3FF]'>

      {/* ── Language Selector (top-right, always visible) ── */}
      <div className='fixed top-4 right-4 z-50 flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-2xl border-2 border-[#DCEAFF] shadow-md'>
        <Globe className='w-4 h-4 text-blue-500 flex-shrink-0' />
        <select
          value={lang}
          onChange={e => setLang(e.target.value)}
          className='bg-transparent text-sm font-black text-gray-700 focus:outline-none cursor-pointer pr-1'
          aria-label={t('selectLanguage')}
        >
          {languages.map(l => (
            <option key={l.code} value={l.code}>{l.flag} {l.label}</option>
          ))}
        </select>
      </div>

      {/* ── Visual Identity Panel ── */}
      <div className='hidden lg:flex w-1/2 relative overflow-hidden flex-col justify-between p-12'
        style={{ background: 'linear-gradient(135deg, #EEF3FF 0%, #DCEAFF 40%, #C2D3F7 100%)' }}>

        {/* Blobs */}
        <div className='absolute top-10 right-10 w-72 h-72 bg-blue-200/50 rounded-full blur-3xl' />
        <div className='absolute bottom-10 left-10 w-64 h-64 bg-red-200/40 rounded-full blur-3xl animation-delay-2000' />

        {/* Logo */}
        <div className='relative z-10 flex items-center gap-3'>
          <div className='w-12 h-12 bg-white rounded-2xl shadow-md flex items-center justify-center'>
            <Heart className='w-6 h-6 text-red-500 fill-red-500' />
          </div>
          <span className='text-2xl font-black text-gray-800 tracking-tight'>BAYMAX</span>
        </div>

        {/* Baymax Character */}
        <div className='relative z-10 flex flex-col items-center justify-center flex-1 py-8'>
          <img
            src='/images/baymax_wave.png'
            alt='Baymax waving hello'
            className='w-72 h-auto baymax-float drop-shadow-2xl'
          />
          <div className='mt-6 text-center'>
            <h1 className='text-4xl font-black text-gray-800 mb-3 leading-tight'>
              {t('login_tagline')}<br />
              <span className='text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500'>
                {t('login_taglineHighlight')}
              </span>
            </h1>
            <p className='text-gray-500 font-semibold text-lg max-w-xs mx-auto leading-relaxed'>
              {t('login_baymaxIntro')}
            </p>
          </div>
        </div>

        {/* Feature pills */}
        <div className='relative z-10 flex flex-wrap gap-3 justify-center'>
          <div className='flex items-center gap-2 bg-white/70 backdrop-blur-sm px-4 py-2 rounded-full border border-blue-100 shadow-sm'>
            <ShieldCheck className='w-4 h-4 text-blue-600' />
            <span className='text-sm font-bold text-gray-700'>{t('login_roleBasedAccess')}</span>
          </div>
          <div className='flex items-center gap-2 bg-white/70 backdrop-blur-sm px-4 py-2 rounded-full border border-emerald-100 shadow-sm'>
            <Activity className='w-4 h-4 text-emerald-600' />
            <span className='text-sm font-bold text-gray-700'>{t('login_phqScreening')}</span>
          </div>
          <div className='flex items-center gap-2 bg-white/70 backdrop-blur-sm px-4 py-2 rounded-full border border-red-100 shadow-sm'>
            <Heart className='w-4 h-4 text-red-500' />
            <span className='text-sm font-bold text-gray-700'>{t('login_aiSupport')}</span>
          </div>
        </div>
      </div>

      {/* ── Auth Form Panel ── */}
      <div className='w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12'>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className='w-full max-w-md login-form-container'>

          {/* Mobile logo */}
          <div className='lg:hidden text-center mb-8'>
            <div className='w-20 h-20 bg-white rounded-3xl shadow-lg flex items-center justify-center mx-auto mb-4'>
              <img src='/images/baymax_wave.png' alt='Baymax' className='w-14 h-14 object-contain' />
            </div>
            <h1 className='text-2xl font-black text-gray-800'>BAYMAX</h1>
          </div>

          <div className='text-center mb-8'>
            <h2 className='text-3xl font-black text-gray-900'>{t('login_welcomeBack')}</h2>
            <p className='text-gray-500 mt-2 font-semibold'>{t('login_subtitle')}</p>
          </div>

          {/* Role Selector */}
          <div className='flex gap-3 mb-8 bg-white p-2 rounded-2xl shadow-sm border border-[#DCEAFF] role-selection-container'>
            {roles.map(r => {
              const Icon = r.icon;
              const isSelected = role === r.id;
              const roleButtonClass = r.id === 'STUDENT' ? 'role-button-student' : r.id === 'COUNSELOR' ? 'role-button-counselor' : 'role-button-admin';
              return (
                <button
                  key={r.id}
                  type='button'
                  onClick={() => setRole(r.id)}
                  className={`flex-1 flex flex-col items-center justify-center py-3 rounded-xl transition-all role-button ${roleButtonClass} ${
                    isSelected
                      ? `bg-[#EEF3FF] shadow-sm ring-2 role-selected ${r.ring}`
                      : 'hover:bg-gray-50 text-gray-400'
                  }`}
                >
                  <div className={`p-2 rounded-xl mb-1 ${isSelected ? r.bg : 'bg-transparent'} ${isSelected ? r.color : 'text-gray-400'}`}>
                    <Icon className='w-5 h-5' />
                  </div>
                  <span className={`text-xs font-black ${isSelected ? 'text-gray-900' : 'text-gray-400'}`}>{t(r.labelKey)}</span>
                </button>
              );
            })}
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className='bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-2xl mb-6 flex gap-3 text-sm font-bold'
            >
              <span className='whitespace-nowrap'>⚠️</span> {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className='space-y-4'>
            <div>
              <label className='block text-sm font-black text-gray-700 mb-1.5'>{t('login_email')}</label>
              <input
                type='email'
                placeholder={t('login_emailPlaceholder')}
                required
                className='w-full bg-white border-2 border-[#DCEAFF] rounded-2xl px-4 py-3.5 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all font-semibold text-gray-900 shadow-sm placeholder:text-gray-300 input-enhanced'
                onChange={e => setForm({...form, email: e.target.value})}
              />
            </div>
            <div>
              <div className='flex justify-between items-center mb-1.5'>
                <label className='block text-sm font-black text-gray-700'>{t('login_password')}</label>
                <button type="button" className='text-sm font-bold text-blue-600 hover:text-blue-800'>{t('login_forgotPassword')}</button>
              </div>
              <input
                type='password'
                placeholder='••••••••'
                required
                className='w-full bg-white border-2 border-[#DCEAFF] rounded-2xl px-4 py-3.5 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all font-semibold text-gray-900 shadow-sm input-enhanced'
                onChange={e => setForm({...form, password: e.target.value})}
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type='submit'
              disabled={loading}
              className={`w-full text-white py-4 flex justify-center items-center gap-2 rounded-2xl font-black transition-all mt-4 shadow-xl signin-button ${roleSubmitColors[role]} disabled:opacity-70`}
            >
              {loading ? t('login_authenticating') : `${t('login_signIn')} ${t(`login_role_${role.toLowerCase()}`)}`}
              <ArrowRight className='w-5 h-5 opacity-80' />
            </motion.button>
          </form>

          {role === 'STUDENT' && (
            <p className='mt-8 text-center text-gray-500 font-semibold'>
              {t('login_noAccount')}{' '}
              <Link to='/register' className='text-blue-600 font-black hover:text-blue-800 transition-colors'>
                {t('login_signUpNow')}
              </Link>
            </p>
          )}
          {role !== 'STUDENT' && (
            <p className='mt-8 text-center text-gray-400 font-semibold text-sm'>
              {t('login_staffNote')}
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
