import React, { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight, Lightbulb } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

/* ── Advice data keyed by combined severity band ── */
const ADVICE_POOL = {
  minimal: {
    label: 'Minimal',
    tagline: 'You are doing well overall. These suggestions will help you maintain your mental wellness and build long‑term emotional resilience.',
    color: { bg: 'bg-emerald-50', border: 'border-emerald-200', header: 'bg-emerald-600', badge: 'bg-emerald-500', text: 'text-emerald-900', sub: 'text-emerald-700' },
    advices: [
      { title: 'Keep a consistent daily routine', detail: 'Wake up, eat, and sleep at the same times each day. Routine anchors your mood and prevents the drift that can lead to low energy.' },
      { title: 'Practice gratitude journaling', detail: 'Each evening, write 3 specific things you felt grateful for that day. Over weeks, this rewires attention toward positive experiences.' },
      { title: 'Move your body daily', detail: 'Even a 20–30 min walk outdoors counts. Physical activity releases endorphins and directly supports mood regulation.' },
      { title: 'Protect your sleep', detail: 'Aim for 7–9 hours. Avoid screens 45 min before bed and keep your bedroom cool and dark. Poor sleep is one of the fastest routes to low mood.' },
      { title: 'Nurture at least one close relationship', detail: 'Schedule regular, meaningful time with someone you trust — in person when possible. Social connection is a strong buffer against depression.' },
      { title: 'Limit passive screen time', detail: 'Scrolling social media for long periods is linked to increased dissatisfaction and low mood. Set intentional limits on passive consumption.' },
      { title: 'Do one thing purely for enjoyment each day', detail: 'Not productivity. Not obligation. Something you genuinely enjoy — music, cooking, a hobby. Pleasure is not optional; it is protective.' },
      { title: 'Learn basic emotional labeling', detail: 'When you feel off, pause and name the emotion precisely (frustrated, lonely, bored). Naming emotions reduces their intensity and builds self‑awareness.' },
      { title: 'Spend time in nature', detail: 'Even 15–20 min in a park or green space significantly reduces cortisol and rumination. Make it a weekly habit.' },
      { title: 'Do a monthly self‑check‑in', detail: 'Every 4 weeks, re‑rate your mood and energy. Catching early warning signs early allows you to intervene before symptoms develop.' },
    ],
  },
  mild: {
    label: 'Mild',
    tagline: 'You are experiencing mild symptoms. Small, consistent steps can significantly improve how you feel.',
    color: { bg: 'bg-amber-50', border: 'border-amber-200', header: 'bg-amber-500', badge: 'bg-amber-500', text: 'text-amber-900', sub: 'text-amber-700' },
    advices: [
      { title: 'Talk to someone you trust', detail: 'Sharing what you are going through with a friend, family member, or mentor can lighten the emotional load considerably.' },
      { title: 'Establish a morning anchor routine', detail: 'Start each day with one grounding activity — a short walk, journaling, or mindful breathing — to set a positive tone.' },
      { title: 'Limit alcohol and caffeine', detail: 'Both can worsen anxiety and disrupt sleep. Track your intake for a week and see if reducing helps your mood.' },
      { title: 'Practice diaphragmatic breathing', detail: 'Inhale for 4 counts, hold for 4, exhale for 6. Just 5 minutes daily can calm your nervous system noticeably.' },
      { title: 'Break tasks into micro‑steps', detail: 'Mild depression can make tasks feel overwhelming. Identify the absolute smallest next step and do only that.' },
      { title: 'Reduce decision fatigue', detail: 'Simplify daily choices (meals, outfits) so mental energy is preserved for what matters most.' },
      { title: 'Schedule enjoyable activities intentionally', detail: 'Do not wait until you feel like it — schedule one pleasant activity per day. Behavioral activation is a proven antidote to low mood.' },
      { title: 'Maintain social contact even when you don\'t feel like it', detail: 'Mild mood dips make isolation tempting. Brief, low‑key social contact consistently improves mood over time.' },
      { title: 'Get brief sunlight exposure daily', detail: 'Natural light in the morning helps regulate circadian rhythms and boosts serotonin. Aim for 15 minutes outside.' },
      { title: 'Consider speaking to a counselor', detail: 'Mild symptoms are highly treatable. A few sessions with a counselor can provide tools to prevent escalation.' },
    ],
  },
  moderate: {
    label: 'Moderate',
    tagline: 'Your scores indicate moderate distress. Professional support combined with self‑care strategies is strongly recommended.',
    color: { bg: 'bg-orange-50', border: 'border-orange-200', header: 'bg-orange-500', badge: 'bg-orange-500', text: 'text-orange-900', sub: 'text-orange-700' },
    advices: [
      { title: 'Reach out to a mental health professional', detail: 'Moderate symptoms respond well to therapy (especially CBT). A counselor or therapist can guide you with evidence‑based tools.' },
      { title: 'Establish a crisis contact', detail: 'Identify one person you can call when things get hard. Having a plan reduces the chance of escalation.' },
      { title: 'Stick to a strict sleep schedule', detail: 'Sleep disruption powerfully worsens moderate depression and anxiety. Go to bed and wake at the same time, even on weekends.' },
      { title: 'Do gentle exercise every day', detail: 'Even a 15‑min walk has measurable antidepressant effects. Start small — intensity matters less than consistency.' },
      { title: 'Practice mindfulness meditation', detail: 'Apps like Headspace or simple breath‑awareness for 10 min daily have strong evidence for reducing moderate anxiety and low mood.' },
      { title: 'Reduce news and social media consumption', detail: 'At moderate symptom levels, external stressors are amplified. Limiting exposure to distressing content is protective.' },
      { title: 'Use a mood journal', detail: 'Track your mood, sleep, and key events daily. Patterns often reveal triggers that you can then address.' },
      { title: 'Eat regularly and prioritise nutrition', detail: 'Skipping meals worsens mood and concentration. Aim for three balanced meals and limit ultra‑processed foods.' },
      { title: 'Ask for support at college/work', detail: 'Moderate distress often impacts academic and professional performance. Reach out to student welfare or HR for accommodations.' },
      { title: 'Avoid major life decisions if possible', detail: 'When you are moderately distressed, cognition is impaired. Defer large decisions until your mental state stabilises.' },
    ],
  },
  severe: {
    label: 'Severe',
    tagline: 'Your scores indicate high distress. Please seek professional support immediately — you do not have to face this alone.',
    color: { bg: 'bg-rose-50', border: 'border-rose-200', header: 'bg-rose-600', badge: 'bg-rose-600', text: 'text-rose-900', sub: 'text-rose-700' },
    advices: [
      { title: 'Contact a mental health professional today', detail: 'Severe symptoms require immediate professional attention. Please book an appointment with a therapist, psychiatrist, or counselor as soon as possible.' },
      { title: 'Call a crisis helpline if you feel unsafe', detail: 'iCall Helpline (24/7): 9152987821. You can also text or use their online chat. Trained counselors are available right now.' },
      { title: 'Tell a trusted person how you are feeling', detail: 'Do not try to manage severe distress alone. Confide in someone close to you today — even a brief conversation can reduce isolation.' },
      { title: 'Remove yourself from stressful environments temporarily', detail: 'If possible, step back from high‑pressure situations while you stabilise. Your wellbeing takes priority.' },
      { title: 'Follow any prescribed treatment plan strictly', detail: 'If you are already seeing a professional, take medication as directed and attend all appointments.' },
      { title: 'Avoid alcohol, drugs, and self‑medication', detail: 'These provide short‑term relief but significantly worsen severe symptoms and can create dependency.' },
      { title: 'Keep a safety plan accessible', detail: 'Write down warning signs, coping strategies, people to contact, and crisis numbers. Review it when you feel overwhelmed.' },
      { title: 'Involve a trusted family member', detail: 'Let a family member or guardian know what you are going through so they can provide practical support and monitor your wellbeing.' },
      { title: 'Focus only on the next 24 hours', detail: 'Severe distress makes the future feel impossible. Break time into manageable chunks — just get through today.' },
      { title: 'Rest without guilt', detail: 'Your body and mind are under immense strain. Prioritise sleep and rest. Allow yourself to recover without judgment.' },
    ],
  },
};

/** Pick `n` unique random items from an array (stable per component mount via useMemo) */
function pickRandom(arr, n) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

export default function AssessmentResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const { phq9Result, gad7Result } = location.state || {};
  const { t } = useLanguage();

  // ── All hooks MUST be called before any early return ──
  /** Derive a single severity key from the worse of the two scores */
  const getSeverityKey = (phq9Sev, gad7Sev) => {
    const rank = { minimal: 0, mild: 1, moderate: 2, moderately_severe: 3, severe: 4 };
    const normPhq = phq9Sev?.toLowerCase() || 'minimal';
    const normGad = gad7Sev?.toLowerCase() || 'minimal';
    const worse = (rank[normPhq] ?? 0) >= (rank[normGad] ?? 0) ? normPhq : normGad;
    if (worse === 'severe' || worse === 'moderately_severe') return 'severe';
    if (worse === 'moderate') return 'moderate';
    if (worse === 'mild') return 'mild';
    return 'minimal';
  };

  const severityKey = getSeverityKey(phq9Result?.severity, gad7Result?.severity);
  const adviceData = ADVICE_POOL[severityKey];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const randomAdvices = useMemo(() => pickRandom(adviceData.advices, 3), [severityKey]);
  const { color } = adviceData;

  // ── Early return after all hooks ──
  if (!phq9Result || !gad7Result) {
    return (
      <div className='p-8 text-center'>
        <p>No results found. Please take the screening first.</p>
        <button onClick={() => navigate('/student/screening')} className='mt-4 text-blue-600 underline'>Go to Screening</button>
      </div>
    );
  }

  const getRiskColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'severe':
      case 'moderately_severe':
        return 'border-rose-400 bg-rose-50 text-rose-800';
      case 'moderate':
        return 'border-amber-400 bg-amber-50 text-amber-800';
      default:
        return 'border-emerald-400 bg-emerald-50 text-emerald-800';
    }
  };

  const isHighRisk = (phq9Result.severity === 'severe' || phq9Result.severity === 'moderately_severe' || gad7Result.severity === 'severe');

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className='max-w-3xl mx-auto'>
      <div className='bg-white p-10 rounded-3xl shadow-sm border border-gray-100 text-center mb-8'>
        <CheckCircle2 className='w-20 h-20 mx-auto mb-4 text-blue-500 opacity-80' />
        <h2 className='text-3xl font-extrabold mb-2'>{t('result_title')}</h2>
        <p className='text-gray-500 mb-8'>{t('result_recommendations')}</p>
        
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-8'>
          <div className={`p-6 rounded-2xl border-2 ${getRiskColor(phq9Result.severity)}`}>
            <p className='text-sm uppercase tracking-wider font-bold mb-1 opacity-70'>PHQ-9 (Depression)</p>
            <p className='text-5xl font-black mb-2'>{phq9Result.score}</p>
            <p className='font-bold uppercase tracking-wide text-sm opacity-90'>{phq9Result.severity.replace('_', ' ')}</p>
          </div>
          <div className={`p-6 rounded-2xl border-2 ${getRiskColor(gad7Result.severity)}`}>
            <p className='text-sm uppercase tracking-wider font-bold mb-1 opacity-70'>GAD-7 (Anxiety)</p>
            <p className='text-5xl font-black mb-2'>{gad7Result.score}</p>
            <p className='font-bold uppercase tracking-wide text-sm opacity-90'>{gad7Result.severity.replace('_', ' ')}</p>
          </div>
        </div>

        {isHighRisk && (
          <div className='bg-rose-50 border border-rose-200 text-rose-800 p-6 rounded-2xl text-left'>
            <h3 className='font-bold text-lg mb-2'>Immediate Support Recommended</h3>
            <p className='mb-3'>Your scores indicate a significantly elevated level of distress. We highly recommend connecting with a professional.</p>
            <p className='font-bold'>iCall Helpline (24/7): 9152987821</p>
          </div>
        )}
      </div>

      {/* ── Advice Block ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className={`rounded-3xl border-2 ${color.border} overflow-hidden shadow-sm mb-8`}
      >
        {/* Header */}
        <div className={`${color.header} px-7 py-5`}>
          <div className='flex items-center gap-2.5 mb-1'>
            <Lightbulb className='w-5 h-5 text-white opacity-90' />
            <span className='text-xs font-black text-white/80 uppercase tracking-widest'>Wellness Tips</span>
          </div>
          <h3 className='text-xl font-black text-white'>
            {adviceData.label} — PHQ-9 &amp; GAD-7
          </h3>
          <p className='text-white/80 text-sm font-semibold mt-1 leading-relaxed'>{adviceData.tagline}</p>
        </div>

        {/* 3 random advice cards */}
        <div className={`${color.bg} p-6 space-y-4`}>
          {randomAdvices.map((advice, idx) => (
            <motion.div
              key={advice.title}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + idx * 0.08 }}
              className='flex gap-4 items-start bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white shadow-sm'
            >
              <span className={`flex-shrink-0 w-9 h-9 rounded-xl ${color.badge} text-white text-sm font-black flex items-center justify-center shadow-sm`}>
                {idx + 1}
              </span>
              <div>
                <p className={`font-bold text-sm ${color.text} mb-0.5`}>{advice.title}</p>
                <p className={`text-sm ${color.sub} leading-relaxed`}>{advice.detail}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <div className='flex gap-4 justify-center'>
        <button onClick={() => navigate('/student/chat')} className='flex-1 lg:flex-none flex justify-center items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-blue-500/30 hover:shadow-xl transition-all'>
          {t('dash_chatBaymax')}
        </button>
        <button onClick={() => navigate('/student/appointments')} className='flex-1 lg:flex-none flex justify-center items-center gap-2 bg-white border-2 border-gray-200 text-gray-700 px-8 py-4 rounded-2xl font-bold hover:bg-gray-50 transition-all'>
          {t('dash_bookCounselor')} <ArrowRight className='w-5 h-5' />
        </button>
      </div>
    </motion.div>
  );
}
