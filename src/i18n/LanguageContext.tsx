import React, { createContext, useContext, useState, useEffect } from 'react';
import { SupportedLanguage, Translations, translations } from './translations';

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  toggleLanguage: () => void;
  t: (key: keyof Translations, fallback?: string) => string;
  isRTL: boolean;
  dir: 'ltr' | 'rtl';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    try {
      const saved = localStorage.getItem('cary_app_lang') as SupportedLanguage;
      if (saved === 'en' || saved === 'ar') return saved;
      // If browser prefers arabic
      if (navigator.language.startsWith('ar')) return 'ar';
    } catch {
      // ignore
    }
    return 'en';
  });

  const isRTL = language === 'ar';
  const dir = isRTL ? 'rtl' : 'ltr';

  useEffect(() => {
    try {
      localStorage.setItem('cary_app_lang', language);
    } catch {
      // ignore
    }

    document.documentElement.lang = language;
    document.documentElement.dir = dir;
    if (isRTL) {
      document.documentElement.classList.add('rtl-mode');
      document.body.classList.add('font-arabic');
    } else {
      document.documentElement.classList.remove('rtl-mode');
      document.body.classList.remove('font-arabic');
    }
  }, [language, isRTL, dir]);

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
  };

  const toggleLanguage = () => {
    setLanguageState((prev) => (prev === 'en' ? 'ar' : 'en'));
  };

  const t = (key: keyof Translations, fallback?: string): string => {
    const langDict = translations[language] || translations.en;
    const value = langDict[key];
    if (typeof value === 'string') return value;
    return fallback || (translations.en[key] as string) || String(key);
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
        isRTL,
        dir,
      }}
    >
      <div dir={dir} className={isRTL ? 'font-arabic' : ''}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
