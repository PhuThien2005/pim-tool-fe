import React, { createContext, useContext, useState, useEffect } from 'react';
import counterpart from 'counterpart';
import en from '../locales/en';
import fr from '../locales/fr';

counterpart.registerTranslations('en', en);
counterpart.registerTranslations('fr', fr);
counterpart.setLocale('en');

const translations = { en, fr };

const LanguageContext = createContext({
  language: 'en',
  setLanguage: () => {},
  t: (key, params) => key,
});

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('pim_lang') || 'en';
  });

  useEffect(() => {
    counterpart.setLocale(language);
    localStorage.setItem('pim_lang', language);
  }, [language]);

  const setLanguage = (lang) => {
    if (translations[lang]) {
      setLanguageState(lang);
    }
  };

  const t = (path, params = {}) => {
    const keys = path.split('.');
    let value = translations[language];

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback to English
        let fallback = translations.en;
        for (const fk of keys) {
          if (fallback && typeof fallback === 'object' && fk in fallback) {
            fallback = fallback[fk];
          } else {
            return path;
          }
        }
        value = fallback;
        break;
      }
    }

    if (typeof value === 'string') {
      let result = value;
      Object.entries(params).forEach(([paramKey, paramVal]) => {
        result = result.split('%{' + paramKey + '}').join(String(paramVal));
      });
      return result;
    }

    return path;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

/**
 * Ultra-concise translation hook.
 * Supports both direct call:
 *   const t = useTranslate();
 *   <h1>{t('projectList.title')}</h1>
 * And destructuring:
 *   const { t, language, setLanguage } = useTranslate();
 */
export const useTranslate = () => {
  const ctx = useContext(LanguageContext);
  const fn = (path, params) => ctx.t(path, params);
  fn.t = ctx.t;
  fn.language = ctx.language;
  fn.setLanguage = ctx.setLanguage;
  return fn;
};

export const useTranslation = useTranslate;

export default LanguageContext;
