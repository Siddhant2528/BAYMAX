import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, Sparkles, Heart, Trash2, AlertTriangle, ArrowLeft, Plus, MessageSquare, ChevronLeft, ChevronRight, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import io from 'socket.io-client';
import { chat as chatApi } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const renderText = (text) =>
  text.split('\n').map((line, i, arr) => (
    <React.Fragment key={i}>
      {line}
      {i < arr.length - 1 && <br />}
    </React.Fragment>
  ));

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now - d;
  const oneDay = 1000 * 60 * 60 * 24;
  if (diff < oneDay) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (diff < 7 * oneDay) return d.toLocaleDateString([], { weekday: 'short' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

// ─── Sub-components ──────────────────────────────────────────────────────────

const TypingIndicator = () => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 8 }}
    className="flex justify-start items-end gap-2.5"
  >
    <div className="w-9 h-9 rounded-2xl bg-white border-2 border-[#DCEAFF] flex items-center justify-center flex-shrink-0 shadow-sm mb-1 overflow-hidden">
      <img src="/images/baymax_wave.png" alt="Baymax" className="w-7 h-7 object-contain" />
    </div>
    <div className="bg-white border-2 border-[#DCEAFF] px-5 py-4 rounded-3xl rounded-bl-sm shadow-sm flex gap-1.5 items-center h-12">
      {[0, 0.18, 0.36].map((delay, i) => (
        <motion.div
          key={i}
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 0.7, delay, ease: 'easeInOut' }}
          className="w-2.5 h-2.5 rounded-full bg-gradient-to-b from-blue-400 to-indigo-500"
        />
      ))}
    </div>
  </motion.div>
);

const MessageBubble = ({ m }) => (
  <motion.div
    initial={{ opacity: 0, y: 12, scale: 0.96 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.28, ease: 'easeOut' }}
    className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} items-end gap-2.5`}
  >
    {m.role === 'assistant' && (
      <div className="w-9 h-9 rounded-2xl bg-white border-2 border-[#DCEAFF] flex items-center justify-center flex-shrink-0 shadow-sm mb-1 overflow-hidden">
        <img src="/images/baymax_wave.png" alt="Baymax" className="w-7 h-7 object-contain" />
      </div>
    )}
    <div
      className={`max-w-[75%] px-5 py-4 rounded-3xl text-[15px] leading-relaxed font-medium ${
        m.role === 'user'
          ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-br-sm shadow-lg shadow-blue-500/20'
          : 'bg-white text-gray-800 rounded-bl-sm border-2 border-[#DCEAFF] shadow-sm'
      }`}
    >
      {renderText(m.content)}
    </div>
    {m.role === 'user' && (
      <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0 shadow-sm mb-1">
        <User className="w-4 h-4 text-white" />
      </div>
    )}
  </motion.div>
);

// ─── Sessions Sidebar ─────────────────────────────────────────────────────────

const SessionsSidebar = ({ sessions, activeSessionId, onSelectSession, onNewChat, collapsed, onToggle, creating }) => (
  <motion.div
    animate={{ width: collapsed ? 48 : 260 }}
    transition={{ duration: 0.25, ease: 'easeInOut' }}
    className="flex-none flex flex-col bg-[#EEF3FF] border-r-2 border-[#DCEAFF] overflow-hidden relative"
    style={{ minWidth: collapsed ? 48 : 260 }}
  >
    {/* Collapse toggle */}
    <button
      onClick={onToggle}
      className="absolute top-3 right-2 z-10 w-7 h-7 rounded-lg bg-white border border-[#DCEAFF] flex items-center justify-center text-gray-400 hover:text-blue-500 hover:border-blue-300 transition-all shadow-sm flex-shrink-0"
      title={collapsed ? 'Expand sessions' : 'Collapse sessions'}
    >
      {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
    </button>

    {!collapsed && (
      <div className="flex flex-col h-full">
        {/* Sidebar header */}
        <div className="p-3 pt-3 pb-2 border-b border-[#DCEAFF]">
          <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 pr-8">Chats</p>
          <button
            onClick={onNewChat}
            disabled={creating}
            className="w-full flex items-center gap-2 bg-gradient-to-br from-blue-600 to-indigo-600 text-white px-3 py-2.5 rounded-2xl text-sm font-bold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all shadow-sm shadow-blue-500/20"
          >
            <Plus className="w-4 h-4 flex-shrink-0" />
            {creating ? 'Creating...' : 'New Chat'}
          </button>
        </div>

        {/* Session list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {sessions.length === 0 && (
            <p className="text-xs text-gray-400 text-center py-6 font-semibold">No past chats yet</p>
          )}
          {sessions.map((s) => {
            const isActive = s.sessionId === activeSessionId;
            return (
              <button
                key={s.sessionId}
                onClick={() => onSelectSession(s)}
                className={`w-full text-left px-3 py-2.5 rounded-2xl transition-all group ${
                  isActive
                    ? 'bg-white border-2 border-blue-300 shadow-sm'
                    : 'hover:bg-white/70 border-2 border-transparent'
                }`}
              >
                <div className="flex items-start gap-2">
                  <MessageSquare className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${isActive ? 'text-blue-500' : 'text-gray-400'}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-[13px] font-semibold truncate leading-snug ${isActive ? 'text-gray-900' : 'text-gray-600'}`}>
                      {s.preview?.slice(0, 40) || 'Chat session'}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {formatDate(s.lastActivity)} · {s.messageCount} msgs
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    )}

    {/* Collapsed state: just show icons */}
    {collapsed && (
      <div className="flex flex-col items-center pt-12 gap-2 px-1">
        <button
          onClick={onNewChat}
          disabled={creating}
          title="New Chat"
          className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
        </button>
        {sessions.map((s) => {
          const isActive = s.sessionId === activeSessionId;
          return (
            <button
              key={s.sessionId}
              onClick={() => onSelectSession(s)}
              title={s.preview?.slice(0, 30) || 'Chat'}
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                isActive ? 'bg-white border-2 border-blue-300 text-blue-500' : 'text-gray-400 hover:bg-white/70'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
            </button>
          );
        })}
      </div>
    )}
  </motion.div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  // ── Voice & Speech State ───────────────────────────────────────────────────
  const [isListening, setIsListening] = useState(false);
  const [voiceMode, setVoiceMode] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const sendMessageRef = useRef(null);
  const handleSpeakRef = useRef(null);

  // ── Session state ──────────────────────────────────────────────────────────
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [creating, setCreating] = useState(false);

  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('baymax_user') || '{}');
  const userId = user?.id || user?._id || 'anonymous_user';
  const { t } = useLanguage();
  const navigate = useNavigate();



  // ── Load sessions on mount ─────────────────────────────────────────────────
  useEffect(() => {
    chatApi.getSessions()
      .then(async res => {
        const data = res.data?.data || [];
        setSessions(data);

        if (data.length > 0) {
          // Load the most recent session
          const latest = data[0];
          setActiveSessionId(latest.sessionId);
          try {
            const r = await chatApi.getSessionMessages(latest.sessionId);
            const msgs = (r.data?.data || []).map(m => ({
              role: m.role === 'assistant' ? 'assistant' : 'user',
              content: m.message,
            }));
            setMessages(msgs);
          } catch {
            setMessages([]);
          }
        } else {
          // No sessions yet — create the very first one silently
          try {
            const res2 = await chatApi.createSession();
            const { sessionId } = res2.data?.data || {};
            if (sessionId) setActiveSessionId(sessionId);
          } catch { /* start fresh, user can send first message */ }
        }
      })
      .catch(() => { setMessages([]); })
      .finally(() => setHistoryLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Create a new session ───────────────────────────────────────────────────
  const createNewSession = useCallback(async () => {
    setCreating(true);
    try {
      const res = await chatApi.createSession();
      const { sessionId } = res.data?.data || {};
      if (!sessionId) return;

      // Refresh sessions list
      const listRes = await chatApi.getSessions();
      setSessions(listRes.data?.data || []);

      // Switch to the new (empty) session
      setActiveSessionId(sessionId);
      setMessages([]);
    } catch (e) {
      console.error('Failed to create session', e);
    } finally {
      setCreating(false);
    }
  }, []);

  // ── Switch to a past session (always reloads, even if already active) ────────
  const switchSession = useCallback(async (session) => {
    setHistoryLoading(true);
    setActiveSessionId(session.sessionId);
    try {
      const res = await chatApi.getSessionMessages(session.sessionId);
      const msgs = (res.data?.data || []).map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.message,
      }));
      setMessages(msgs);
    } catch {
      setMessages([]);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  // ── Socket setup ───────────────────────────────────────────────────────────
  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setConnected(true);
      newSocket.emit('join', userId);
    });

    newSocket.on('disconnect', () => setConnected(false));

    newSocket.on('receive_message', (data) => {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: data.reply },
      ]);
      setLoading(false);

      if (handleSpeakRef.current) {
        handleSpeakRef.current(data.reply);
      }

      // Refresh session list so preview/count updates
      chatApi.getSessions().then(r => setSessions(r.data?.data || [])).catch(() => {});
    });

    newSocket.on('error', (err) => {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: `Sorry, something went wrong. ${err?.message || 'Please try again.'}` },
      ]);
      setLoading(false);
    });

    return () => newSocket.close();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // ── Auto-scroll ────────────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // ── Send message ───────────────────────────────────────────────────────────
  const sendMessage = useCallback(async () => {
    if (!input.trim() || loading || !socket || !connected) return;
    const text = input.trim();

    // If somehow no session exists yet, create one first
    let sid = activeSessionId;
    if (!sid) {
      try {
        const res = await chatApi.createSession();
        sid = res.data?.data?.sessionId;
        if (sid) {
          setActiveSessionId(sid);
          const listRes = await chatApi.getSessions();
          setSessions(listRes.data?.data || []);
        }
      } catch { return; }
    }
    if (!sid) return;

    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setInput('');
    setLoading(true);

    socket.emit('send_message', { userId, message: text, sessionId: sid });
  }, [input, loading, socket, connected, userId, activeSessionId]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const showEmpty = !historyLoading && messages.length === 0;

  // ── Setup Speech & TTS ──────────────────────────────────────────────────
  useEffect(() => {
    sendMessageRef.current = sendMessage;
  }, [sendMessage]);

  // Kickstart voice loading asynchronously on mount
  useEffect(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);

  const handleSpeak = useCallback((text) => {
    if (!voiceMode || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    
    // Clean text for speech
    const cleanText = text.replace(/[*#_]+/g, '').replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|\uD83E[\uDD10-\uDDFF])/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);

    // Try finding a gentle, natural male voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoiceNames = [
      "Google UK English Male",
      "Microsoft Mark",       // Windows calm male
      "Microsoft David",      // Windows default male
      "Alex",                 // Mac natural
      "Daniel"                // Mac UK
    ];
    
    let selectedVoice = null;
    for (const name of preferredVoiceNames) {
      selectedVoice = voices.find(v => v.name.includes(name));
      if (selectedVoice) break;
    }
    
    // Fallback: any English male voice
    if (!selectedVoice) {
      selectedVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Male'));
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    // Tweak to sound gentler
    utterance.pitch = 0.9; // Slightly lower pitch for deeper/gentle tone
    utterance.rate = 0.95; // Slightly slower, calmer delivery

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, [voiceMode]);

  useEffect(() => {
    handleSpeakRef.current = handleSpeak;
  }, [handleSpeak]);

  useEffect(() => {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRec) {
      const rec = new SpeechRec();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onstart = () => setIsListening(true);
      rec.onerror = (e) => {
        console.error('STT error', e);
        if (e.error !== 'no-speech') setIsListening(false);
      };
      rec.onend = () => setIsListening(false);

      rec.onresult = (event) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        setInput(transcript);

        // Reset silence timer for auto-send
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => {
          rec.stop();
          if (sendMessageRef.current) sendMessageRef.current();
        }, 1500);
      };
      recognitionRef.current = rec;
    }

    return () => {
      clearTimeout(silenceTimerRef.current);
      if (recognitionRef.current) recognitionRef.current.stop();
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, []);

  const toggleMic = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      setInput('');
      try {
        recognitionRef.current?.start();
      } catch(e) { console.error('Mic start error', e); }
    }
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] relative bg-white rounded-3xl border-2 border-[#DCEAFF] shadow-sm overflow-hidden">

      {/* ── Sessions Sidebar ──────────────────────────────────────────────── */}
      <SessionsSidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={switchSession}
        onNewChat={createNewSession}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(p => !p)}
        creating={creating}
      />

      {/* ── Chat Panel ───────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 overflow-hidden">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex-none bg-[#EEF3FF] border-b-2 border-[#DCEAFF] p-4 sm:p-5 flex items-center gap-4 z-10">
          {/* Back button */}
          <button
            onClick={() => navigate('/student/dashboard')}
            className='w-9 h-9 rounded-xl bg-white border-2 border-[#DCEAFF] flex items-center justify-center hover:border-blue-300 hover:bg-blue-50 transition-all shadow-sm flex-shrink-0'
            title='Back to Dashboard'
          >
            <ArrowLeft className='w-4 h-4 text-gray-500' />
          </button>

          {/* Baymax avatar */}
          <div className="relative flex-shrink-0">
            <div className={`w-14 h-14 rounded-2xl bg-white border-2 border-[#DCEAFF] shadow-sm flex items-center justify-center overflow-hidden transition-all ${isSpeaking ? 'ring-4 ring-blue-100 shadow-blue-200 shadow-lg' : ''}`}>
              <img
                src="/images/baymax_wave.png"
                alt="Baymax"
                className={`w-11 h-11 object-contain transition-all ${loading || isSpeaking ? 'baymax-float' : ''}`}
              />
            </div>
            {isSpeaking && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500 border-2 border-white" />
              </span>
            )}
            <span className={`absolute -bottom-1 -right-1 flex h-4 w-4 ${connected && !isSpeaking ? '' : 'hidden'}`}>
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white" />
            </span>
          </div>

          {/* Title & Status */}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-black text-gray-900 tracking-tight">BAYMAX</h1>
            <p className="text-sm font-semibold text-blue-500 flex items-center gap-1.5 truncate">
              <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
              {connected
                ? loading ? t('chat_typing') : t('chat_subtitle')
                : 'Connecting...'}
            </p>
          </div>

          {/* Right chips */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => {
                setVoiceMode(!voiceMode);
                if (voiceMode && window.speechSynthesis) window.speechSynthesis.cancel();
              }}
              className={`hidden sm:flex items-center justify-center w-10 h-10 rounded-2xl border-2 transition-all shadow-sm ${
                voiceMode
                  ? 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100 hover:border-blue-300'
                  : 'bg-gray-50 border-gray-200 text-gray-400 hover:bg-gray-100 hover:text-gray-500'
              }`}
              title={voiceMode ? 'Voice Responses On' : 'Voice Responses Off'}
            >
              {voiceMode ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
            <div className="hidden sm:flex items-center gap-2 bg-white px-3 py-2 rounded-2xl border-2 border-[#DCEAFF] shadow-sm">
              <Heart className="w-4 h-4 text-red-400 fill-red-400" />
              <span className="text-xs font-black text-gray-600">Mental Health Support</span>
            </div>
          </div>
        </div>

        {/* ── Chat area ──────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gradient-to-b from-[#F5F8FF] to-white">

          {/* History loading skeleton */}
          {historyLoading && (
            <div className="flex flex-col gap-4 pt-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'} items-end gap-2.5`}>
                  {i % 2 === 0 && (
                    <div className="w-9 h-9 rounded-2xl bg-[#DCEAFF] animate-pulse flex-shrink-0" />
                  )}
                  <div
                    className={`h-12 rounded-3xl animate-pulse bg-[#DCEAFF] ${i % 2 === 0 ? 'rounded-bl-sm' : 'rounded-br-sm'}`}
                    style={{ width: `${180 + i * 40}px` }}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {showEmpty && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center h-full pt-12 pb-8 text-center select-none"
            >
              <img
                src="/images/baymax_wave.png"
                alt="Baymax waving"
                className="w-36 h-auto object-contain baymax-float mb-6 drop-shadow-lg"
              />
              <h2 className="text-2xl font-black text-gray-800 mb-2">{t('chat_emptyTitle')}</h2>
              <p className="text-gray-400 font-semibold max-w-sm leading-relaxed">
                {t('chat_emptySubtitle')}
              </p>
              <p className="mt-5 text-blue-400 font-black text-sm animate-pulse">
                Start typing below to begin...
              </p>
            </motion.div>
          )}

          {/* Messages */}
          <AnimatePresence initial={false}>
            {messages.map((m, i) => (
              <MessageBubble key={i} m={m} />
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          <AnimatePresence>
            {loading && <TypingIndicator />}
          </AnimatePresence>

          <div ref={bottomRef} className="h-2" />
        </div>

        {/* ── Input area ─────────────────────────────────────────────────── */}
        <div className="flex-none p-4 bg-white border-t-2 border-[#DCEAFF] z-10">
          <div className={`relative flex items-end gap-3 bg-[#EEF3FF] border-2 rounded-2xl p-2 transition-all ${isListening ? 'border-rose-300 ring-2 ring-rose-100' : 'border-[#DCEAFF] focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-200'}`}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isListening ? 'Listening...' : t('chat_placeholder')}
              rows={1}
              style={{ resize: 'none' }}
              className={`flex-1 bg-transparent px-4 py-3 text-[15px] focus:outline-none font-semibold leading-relaxed min-h-[48px] max-h-32 overflow-y-auto ${isListening ? 'text-rose-700 placeholder-rose-300' : 'text-gray-700 placeholder-gray-400'}`}
              onInput={e => {
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
              }}
            />
            <button
              onClick={toggleMic}
              className={`p-3.5 rounded-xl transition-all shadow-md flex-shrink-0 self-end mb-0.5 ${
                isListening
                  ? 'bg-rose-100 text-rose-600 border-2 border-rose-300 animate-pulse'
                  : 'bg-white text-gray-400 border-2 border-gray-200 hover:text-blue-500 hover:border-blue-300'
              }`}
              title="Voice Input (Auto-sends when you stop talking for 1.5s)"
            >
              {isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim() || !connected}
              className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white p-3.5 rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-blue-500/20 flex-shrink-0 self-end mb-0.5"
            >
              <Send className="w-5 h-5 ml-0.5" />
            </button>
          </div>

          {/* Footer disclaimer */}
          <div className="flex items-center justify-center gap-1.5 mt-2">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            <p className="text-center text-xs text-gray-300 font-semibold">
              BAYMAX is an AI. If you're in crisis, please contact a professional immediately.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}