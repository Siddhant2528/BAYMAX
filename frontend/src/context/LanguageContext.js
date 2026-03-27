import React, { createContext, useContext, useState } from 'react';
import translations from '../i18n/translations';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    const saved = localStorage.getItem('baymax_lang');
    return saved && translations[saved] ? saved : 'en';
  });

  const setLang = (newLang) => {
    if (translations[newLang]) {
      localStorage.setItem('baymax_lang', newLang);
      setLangState(newLang);
    }
  };

  // t(key) returns the string in the current language, falling back to English
  const t = (key) => {
    return translations[lang]?.[key] ?? translations['en']?.[key] ?? key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside <LanguageProvider>');
  return ctx;
}
