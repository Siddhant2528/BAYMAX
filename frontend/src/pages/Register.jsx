import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from '../services/api';
import { ArrowRight, Activity, ShieldCheck, User, Heart, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', collegeId: '', guardianPhone: '', department: '', studentContact: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await auth.register(form);
      const payloadData = res.data.data || res.data;
      localStorage.setItem('baymax_token', payloadData.token);
      localStorage.setItem('baymax_user', JSON.stringify(payloadData.user));
      navigate('/student/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex bg-[#EEF3FF]'>
      {/* ── Visual Identity Panel ── */}
      <div className='hidden lg:flex w-1/2 relative overflow-hidden flex-col justify-between p-12'
        style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #D1FAE5 40%, #A7F3D0 100%)' }}>

        {/* Blobs */}
        <div className='absolute top-10 right-10 w-72 h-72 bg-emerald-200/50 rounded-full blur-3xl' />
        <div className='absolute bottom-10 left-10 w-64 h-64 bg-teal-200/40 rounded-full blur-3xl animation-delay-2000' />

        {/* Logo */}
        <div className='relative z-10 flex items-center gap-3'>
          <div className='w-12 h-12 bg-white rounded-2xl shadow-md flex items-center justify-center'>
            <Heart className='w-6 h-6 text-emerald-500 fill-emerald-400' />
          </div>
          <span className='text-2xl font-black text-gray-800 tracking-tight'>BAYMAX</span>
        </div>

        {/* Baymax Character */}
        <div className='relative z-10 flex flex-col items-center justify-center flex-1 py-8'>
          <img
            src='/images/baymax_friendly.png'
            alt='Baymax welcoming you'
            className='w-72 h-auto baymax-float-slow drop-shadow-2xl'
          />
          <div className='mt-6 text-center'>
            <h1 className='text-4xl font-black text-gray-800 mb-3 leading-tight'>
              {t('register_joinTitle')}<br />
              <span className='text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-500'>
                {t('register_joinHighlight')}
              </span>
            </h1>
            <p className='text-gray-600 font-semibold text-lg max-w-xs mx-auto leading-relaxed'>
              {t('register_joinDesc')}
            </p>
          </div>
        </div>

        {/* Feature pills */}
        <div className='relative z-10 flex flex-wrap gap-3 justify-center'>
          <div className='flex items-center gap-2 bg-white/70 backdrop-blur-sm px-4 py-2 rounded-full border border-emerald-100 shadow-sm'>
            <ShieldCheck className='w-4 h-4 text-emerald-600' />
            <span className='text-sm font-bold text-gray-700'>{t('register_private')}</span>
          </div>
          <div className='flex items-center gap-2 bg-white/70 backdrop-blur-sm px-4 py-2 rounded-full border border-teal-100 shadow-sm'>
            <Activity className='w-4 h-4 text-teal-600' />
            <span className='text-sm font-bold text-gray-700'>{t('register_smartMonitoring')}</span>
          </div>
          <div className='flex items-center gap-2 bg-white/70 backdrop-blur-sm px-4 py-2 rounded-full border border-blue-100 shadow-sm'>
            <Sparkles className='w-4 h-4 text-blue-600' />
            <span className='text-sm font-bold text-gray-700'>{t('register_aiPowered')}</span>
          </div>
        </div>
      </div>

      {/* ── Auth Form Panel ── */}
      <div className='w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12'>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className='w-full max-w-md'>

          {/* Mobile logo */}
          <div className='lg:hidden text-center mb-8'>
            <div className='w-20 h-20 bg-white rounded-3xl shadow-lg flex items-center justify-center mx-auto mb-4'>
              <img src='/images/baymax_friendly.png' alt='Baymax' className='w-14 h-14 object-contain' />
            </div>
            <h1 className='text-2xl font-black text-gray-800'>BAYMAX</h1>
          </div>

          <div className='text-center mb-6'>
            <h2 className='text-3xl font-black text-gray-900'>{t('register_title')}</h2>
            <p className='text-gray-500 mt-2 font-semibold'>{t('register_subtitle')}</p>
          </div>

          <div className='flex justify-center mb-6'>
            <div className='inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full font-black text-sm border-2 border-blue-100'>
              <User className='w-4 h-4' /> {t('register_roleLabel')}
            </div>
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
              <label className='block text-sm font-black text-gray-700 mb-1.5'>{t('register_fullName')}</label>
              <input
                type='text'
                placeholder={t('register_fullNamePlaceholder')}
                required
                className='w-full bg-white border-2 border-[#DCEAFF] rounded-2xl px-4 py-3.5 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all font-semibold text-gray-900 shadow-sm placeholder:text-gray-300'
                onChange={e => setForm({...form, name: e.target.value})}
              />
            </div>
            <div>
              <label className='block text-sm font-black text-gray-700 mb-1.5'>{t('register_email')}</label>
              <input
                type='email'
                placeholder={t('register_emailPlaceholder')}
                required
                className='w-full bg-white border-2 border-[#DCEAFF] rounded-2xl px-4 py-3.5 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all font-semibold text-gray-900 shadow-sm placeholder:text-gray-300'
                onChange={e => setForm({...form, email: e.target.value})}
              />
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-black text-gray-700 mb-1.5'>{t('register_collegeId')}</label>
                <input
                  type='text'
                  placeholder={t('register_collegeIdPlaceholder')}
                  className='w-full bg-white border-2 border-[#DCEAFF] rounded-2xl px-4 py-3.5 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all font-semibold text-gray-900 shadow-sm placeholder:text-gray-300'
                  onChange={e => setForm({...form, collegeId: e.target.value})}
                />
              </div>
              <div>
                <label className='block text-sm font-black text-gray-700 mb-1.5'>{t('register_guardianPhone')}</label>
                <input
                  type='text'
                  placeholder={t('register_guardianPhonePlaceholder')}
                  className='w-full bg-white border-2 border-[#DCEAFF] rounded-2xl px-4 py-3.5 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all font-semibold text-gray-900 shadow-sm placeholder:text-gray-300'
                  onChange={e => setForm({...form, guardianPhone: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className='block text-sm font-black text-gray-700 mb-1.5'>Student Contact Number</label>
              <input
                type='tel'
                placeholder='Your mobile number (e.g. 9876543210)'
                className='w-full bg-white border-2 border-[#DCEAFF] rounded-2xl px-4 py-3.5 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all font-semibold text-gray-900 shadow-sm placeholder:text-gray-300'
                onChange={e => setForm({...form, studentContact: e.target.value})}
              />
            </div>
            <div>
              <label className='block text-sm font-black text-gray-700 mb-1.5'>{t('register_department')}</label>
              <select
                required
                className='w-full bg-white border-2 border-[#DCEAFF] rounded-2xl px-4 py-3.5 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all font-semibold text-gray-900 shadow-sm appearance-none cursor-pointer'
                onChange={e => setForm({...form, department: e.target.value})}
                value={form.department}
              >
                <option value="" disabled>{t('register_departmentPlaceholder')}</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Information Technology">Information Technology</option>
                <option value="AI&DS">AI&DS</option>
                <option value="CSD">CSD</option>
                <option value="EnTC">EnTC</option>
                <option value="Electrical Engineering">Electrical Engineering</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Civil">Civil</option>
              </select>
            </div>
            <div>
              <label className='block text-sm font-black text-gray-700 mb-1.5'>{t('register_password')}</label>
              <input
                type='password'
                placeholder='••••••••'
                required
                className='w-full bg-white border-2 border-[#DCEAFF] rounded-2xl px-4 py-3.5 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all font-semibold text-gray-900 shadow-sm'
                onChange={e => setForm({...form, password: e.target.value})}
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type='submit'
              disabled={loading}
              className='w-full text-white py-4 flex justify-center items-center gap-2 rounded-2xl font-black transition-all mt-6 shadow-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 shadow-emerald-500/30 disabled:opacity-70'
            >
              {loading ? t('register_creating') : t('register_createAccount')} <ArrowRight className='w-5 h-5 opacity-80' />
            </motion.button>
          </form>

          <p className='mt-8 text-center text-gray-500 font-semibold'>
            {t('register_alreadyHave')}{' '}
            <Link to='/login' className='text-blue-600 font-black hover:text-blue-800 transition-colors'>
              {t('register_signIn')}
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
