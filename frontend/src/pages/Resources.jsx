import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Headphones, PlayCircle, HeartPulse, Music, ExternalLink, Play, BookText, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { resources } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = [
  { id: 'Self Help books',      icon: BookOpen,    color: 'text-orange-500', bg: 'bg-orange-50',  border: 'border-orange-200',  action: 'Watch AudioBook',  emoji: '📚' },
  { id: 'Motivational Podcasts',icon: Headphones,  color: 'text-blue-500',   bg: 'bg-blue-50',    border: 'border-blue-200',    action: 'Listen Podcast',   emoji: '🎤' },
  { id: 'Meditation Videos',    icon: PlayCircle,  color: 'text-emerald-500',bg: 'bg-emerald-50', border: 'border-emerald-200', action: 'Watch Meditation', emoji: '🧘‍♀️' },
  { id: 'Therapy Videos',       icon: HeartPulse,  color: 'text-rose-500',   bg: 'bg-rose-50',    border: 'border-rose-200',    action: 'Watch Therapy',    emoji: '🧠' },
  { id: 'Relaxation Music',     icon: Music,       color: 'text-purple-500', bg: 'bg-purple-50',  border: 'border-purple-200',  action: 'Listen Music',     emoji: '🎵' },
];

export default function Resources() {
  const [activeTab, setActiveTab] = useState(CATEGORIES[0].id);
  const [allResources, setAllResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    resources.getAll()
      .then(res => {
        setAllResources(res.data?.data || []);
        setLoading(false);
      })
      .catch(err => {
        setError(err.response?.data?.message || 'Failed to load resources. Please try again.');
        setLoading(false);
      });
  }, []);

  const activeCategoryData = CATEGORIES.find(c => c.id === activeTab);
  const items = allResources.filter(r => r.type === activeTab);

  return (
    <div className='max-w-6xl mx-auto pb-20'>
      {/* ── Back Button ── */}
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate('/student/dashboard')}
        className='flex items-center gap-2 mb-6 text-sm font-black text-gray-500 hover:text-amber-600 transition-colors group'
      >
        <span className='w-8 h-8 rounded-xl bg-white border-2 border-[#DCEAFF] flex items-center justify-center group-hover:border-amber-300 group-hover:bg-amber-50 transition-all shadow-sm'>
          <ArrowLeft className='w-4 h-4' />
        </span>
        Back to Dashboard
      </motion.button>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className='mb-10 text-center'>
        <div className='inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 mb-6 shadow-inner'>
          <BookText className='w-10 h-10' />
        </div>
        <h1 className='text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4'>
          {t('res_title')}
        </h1>
        <p className='text-xl text-gray-500 font-medium max-w-2xl mx-auto'>
          {t('res_subtitle')}
        </p>
      </motion.div>

      {/* Category Pills */}
      <div className='mb-12'>
        <div className='flex flex-wrap items-center justify-center gap-3 md:gap-4'>
          {CATEGORIES.map(category => {
            const Icon = category.icon;
            const isActive = activeTab === category.id;
            const count = allResources.filter(r => r.type === category.id).length;
            return (
              <button
                key={category.id}
                onClick={() => setActiveTab(category.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold transition-all duration-300 ${
                  isActive 
                    ? `bg-gray-900 text-white shadow-lg transform scale-105 border border-gray-900` 
                    : `bg-white text-gray-600 border border-gray-200 hover:border-gray-900 hover:text-gray-900 shadow-sm`
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-400' : category.color}`} />
                {category.id}
                {!loading && count > 0 && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${isActive ? 'bg-white/20 text-white' : `${category.bg} ${category.color}`}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      <div className='bg-white p-6 sm:p-10 rounded-3xl shadow-sm border border-gray-100 min-h-[400px]'>

        {/* Loading State */}
        {loading && (
          <div className='flex flex-col items-center justify-center py-24 gap-4'>
            <div className='w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center'>
              <Loader2 className='w-7 h-7 text-blue-500 animate-spin' />
            </div>
            <p className='text-gray-400 font-medium'>Loading resources...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className='flex flex-col items-center justify-center py-20 gap-3'>
            <AlertCircle className='w-12 h-12 text-rose-300' />
            <p className='text-rose-600 font-bold'>Failed to load resources</p>
            <p className='text-gray-400 text-sm'>{error}</p>
            <button
              onClick={() => { setLoading(true); setError(null); resources.getAll().then(r => { setAllResources(r.data?.data || []); setLoading(false); }).catch(e => { setError(e.response?.data?.message || 'Failed.'); setLoading(false); }); }}
              className='mt-2 px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl text-sm hover:bg-indigo-700 transition'
            >
              Try Again
            </button>
          </div>
        )}

        {/* Resources Grid */}
        {!loading && !error && (
          <>
            <div className='flex items-center gap-3 mb-8 border-b border-gray-100 pb-6'>
              <activeCategoryData.icon className={`w-8 h-8 ${activeCategoryData.color}`} />
              <h2 className='text-2xl font-bold text-gray-900'>{activeTab}</h2>
              <span className={`ml-auto px-4 py-1.5 rounded-full text-sm font-bold ${activeCategoryData.bg} ${activeCategoryData.color} border ${activeCategoryData.border}`}>
                {items.length} Items Available
              </span>
            </div>

            {items.length === 0 ? (
              <div className='flex flex-col items-center justify-center py-16 gap-3 text-gray-400'>
                <span className='text-5xl'>{activeCategoryData.emoji}</span>
                <p className='font-semibold text-gray-500'>No content in this category yet.</p>
                <p className='text-sm'>Check back soon — the admin is curating new resources!</p>
              </div>
            ) : (
              <motion.div 
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              >
                {items.map((item, idx) => (
                  <motion.div 
                    key={item.id || idx}
                    whileHover={{ y: -5 }}
                    className='group flex flex-col h-full bg-slate-50 rounded-2xl p-6 border border-gray-100 hover:shadow-xl hover:border-blue-200 transition-all duration-300 relative overflow-hidden'
                  >
                    <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-0 group-hover:opacity-20 transition-all duration-500 bg-gradient-to-br from-blue-400 to-indigo-600 -mr-4 -mt-4`} />
                    
                    <div className='flex items-start justify-between mb-4'>
                      <span className='text-4xl filter drop-shadow-sm'>{activeCategoryData.emoji}</span>
                    </div>
                    
                    <h3 className='text-xl font-extrabold text-gray-900 mb-1 line-clamp-2'>{item.title}</h3>
                    <p className={`text-sm font-bold uppercase tracking-widest mb-3 ${activeCategoryData.color}`}>
                      {item.description}
                    </p>
                    
                    <p className='text-gray-600 text-sm font-medium mb-6 flex-grow'>
                      Curated therapeutic content.
                    </p>
                    
                    <a 
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className='w-full mt-auto py-3 px-4 bg-white border-2 border-gray-200 text-gray-800 rounded-xl font-bold group-hover:bg-gray-900 group-hover:text-white group-hover:border-gray-900 transition-all duration-300 flex items-center justify-center gap-2'
                    >
                      {activeCategoryData.action} <ExternalLink className='w-4 h-4 opacity-50' />
                    </a>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </>
        )}
      </div>

    </div>
  );
}
