import React, { useState } from 'react';
import { screening } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, ArrowRight, ArrowLeft, ShieldCheck, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const PHQ9_QUESTIONS = [
  'Little interest or pleasure in doing things',
  'Feeling down, depressed, or hopeless',
  'Trouble falling or staying asleep, or sleeping too much',
  'Feeling tired or having little energy',
  'Poor appetite or overeating',
  'Feeling bad about yourself',
  'Trouble concentrating on things',
  'Moving or speaking slowly OR being fidgety/restless',
  'Thoughts of being better off dead or hurting yourself',
];

const GAD7_QUESTIONS = [
  'Feeling nervous, anxious, or on edge',
  'Not being able to stop or control worrying',
  'Worrying too much about different things',
  'Trouble relaxing',
  'Being so restless it is hard to sit still',
  'Becoming easily annoyed or irritable',
  'Feeling afraid as if something awful might happen',
];

const OPTIONS = ['Not at all (0)', 'Several days (1)', 'More than half the days (2)', 'Nearly every day (3)'];

export default function Screening() {
  const [phq9, setPhq9] = useState(new Array(9).fill(-1));
  const [gad7, setGad7] = useState(new Array(7).fill(-1));
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage();

  const OPTIONS = [
    t('screening_notAtAll') + ' (0)',
    t('screening_severalDays') + ' (1)',
    t('screening_moreThanHalf') + ' (2)',
    t('screening_nearlyEvery') + ' (3)',
  ];

  const handleSubmit = async () => {
    if (phq9.includes(-1) || gad7.includes(-1)) return alert('Please answer all questions before submitting.');
    
    setLoading(true);
    try {
      // The backend expects separate submissions for PHQ9 and GAD7
      const [resPhq9, resGad7] = await Promise.all([
        screening.submitPHQ9({ answers: phq9 }),
        screening.submitGAD7({ answers: gad7 })
      ]);

      // Navigate to the new Results Page passing the returned API data
      navigate('/student/screening/result', { 
        state: { 
          phq9Result: resPhq9.data.data, 
          gad7Result: resGad7.data.data 
        } 
      });

    } catch(err) {
      alert("Failed to submit assessment: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const phq9Answered = phq9.filter(v => v !== -1).length;
  const gad7Answered = gad7.filter(v => v !== -1).length;
  const totalAnswered = phq9Answered + gad7Answered;
  const totalQuestions = 16;
  const progress = Math.round((totalAnswered / totalQuestions) * 100);

  return (
    <div className='max-w-4xl mx-auto pb-20'>
      {/* ── Back Button ── */}
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate('/student/dashboard')}
        className='flex items-center gap-2 mb-6 text-sm font-black text-gray-500 hover:text-blue-600 transition-colors group'
      >
        <span className='w-8 h-8 rounded-xl bg-white border-2 border-[#DCEAFF] flex items-center justify-center group-hover:border-blue-300 group-hover:bg-blue-50 transition-all shadow-sm'>
          <ArrowLeft className='w-4 h-4' />
        </span>
        Back to Dashboard
      </motion.button>
      {/* ── Baymax Header Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className='mb-8 bg-white rounded-3xl border-2 border-[#DCEAFF] overflow-hidden shadow-sm'
        style={{ background: 'linear-gradient(135deg, #EEF3FF 0%, #DCEAFF 50%, #C2D3F7 100%)' }}
      >
        <div className='p-6 sm:p-8 flex items-center gap-6'>
          <div className='flex-shrink-0'>
            <img
              src='/images/baymax_friendly.png'
              alt='Baymax'
              className='w-28 h-auto object-contain baymax-float-slow drop-shadow-lg'
            />
          </div>
          <div>
            <div className='flex items-center gap-2 mb-2'>
              <Sparkles className='w-4 h-4 text-blue-500' />
              <span className='text-xs font-black text-blue-600 uppercase tracking-widest'>Clinical Assessment</span>
            </div>
            <h1 className='text-3xl font-black text-gray-900 mb-2'>{t('screening_title')}</h1>
            <p className='text-gray-600 font-semibold text-base leading-relaxed'>
              Over the last 2 weeks, how often have you been bothered by the following problems? Answer honestly — I'm here to support you. 🤍
            </p>
            {/* Progress bar */}
            <div className='mt-4'>
              <div className='flex justify-between items-center mb-1.5'>
                <span className='text-xs font-black text-gray-500 uppercase tracking-wider'>{totalAnswered}/{totalQuestions} answered</span>
                <span className='text-xs font-black text-blue-600'>{progress}%</span>
              </div>
              <div className='h-2.5 bg-white/60 rounded-full overflow-hidden border border-[#DCEAFF]'>
                <motion.div
                  className='h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full'
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── PHQ-9 Section ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className='bg-white p-8 rounded-3xl border-2 border-[#DCEAFF] shadow-sm mb-6'>
        <div className='flex items-center gap-3 mb-6 border-b-2 border-[#EEF3FF] pb-4'>
          <div className='p-2.5 bg-blue-50 rounded-2xl'>
            <FileText className='text-blue-600 w-6 h-6' />
          </div>
          <div>
            <h2 className='text-xl font-black text-gray-800'>Part 1: PHQ-9</h2>
            <p className='text-sm text-gray-400 font-semibold'>{t('screening_phqTitle')} · {phq9Answered}/9 answered</p>
          </div>
        </div>
        {PHQ9_QUESTIONS.map((q, i) => (
          <div key={`phq-${i}`} className='mb-6'>
            <p className='font-bold text-gray-700 mb-3 ml-1'>
              <span className='text-blue-500 font-black mr-2'>{i+1}.</span>{q}
            </p>
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3'>
              {OPTIONS.map((opt, j) => (
                <button key={j} onClick={() => { const a=[...phq9]; a[i]=j; setPhq9(a); }}
                  className={`p-3 rounded-2xl text-sm font-bold transition-all ${phq9[i]===j
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 border-2 border-blue-600'
                    : 'bg-[#EEF3FF] text-gray-600 border-2 border-[#DCEAFF] hover:border-blue-300 hover:bg-blue-50'}`}>
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ))}
      </motion.div>

      {/* ── GAD-7 Section ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className='bg-white p-8 rounded-3xl border-2 border-[#DCEAFF] shadow-sm mb-8'>
        <div className='flex items-center gap-3 mb-6 border-b-2 border-[#EEF3FF] pb-4'>
          <div className='p-2.5 bg-teal-50 rounded-2xl'>
            <ShieldCheck className='text-teal-600 w-6 h-6' />
          </div>
          <div>
            <h2 className='text-xl font-black text-gray-800'>Part 2: GAD-7</h2>
            <p className='text-sm text-gray-400 font-semibold'>{t('screening_gadTitle')} · {gad7Answered}/7 answered</p>
          </div>
        </div>
        {GAD7_QUESTIONS.map((q, i) => (
          <div key={`gad-${i}`} className='mb-6'>
            <p className='font-bold text-gray-700 mb-3 ml-1'>
              <span className='text-teal-500 font-black mr-2'>{i+1}.</span>{q}
            </p>
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3'>
              {OPTIONS.map((opt, j) => (
                <button key={j} onClick={() => { const a=[...gad7]; a[i]=j; setGad7(a); }}
                  className={`p-3 rounded-2xl text-sm font-bold transition-all ${gad7[i]===j
                    ? 'bg-teal-600 text-white shadow-md shadow-teal-500/20 border-2 border-teal-600'
                    : 'bg-[#EEF3FF] text-gray-600 border-2 border-[#DCEAFF] hover:border-teal-300 hover:bg-teal-50'}`}>
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ))}
      </motion.div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleSubmit}
        disabled={loading}
        className='w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-5 rounded-3xl text-xl font-black shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 disabled:opacity-70 transition-all'
      >
        {loading ? t('screening_submitting') : t('screening_submit')}
        <ArrowRight className='w-6 h-6 opacity-80' />
      </motion.button>
    </div>
  );
}
