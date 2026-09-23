import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import logo from '../../assets/images/logo_elca.png';

export default function Header() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="pim-header">
      <div className="header-left">
        <img src={logo} alt="ELCA Logo" className="header-logo" />
        <h1 className="header-title">{t('header.title')}</h1>
      </div>

      <div className="header-right">
        <div className="lang-switch">
          <button
            type="button"
            className={`lang-btn ${language === 'en' ? 'active' : ''}`}
            onClick={() => setLanguage('en')}
          >
            {t('header.languages.en')}
          </button>
          <span className="lang-divider">|</span>
          <button
            type="button"
            className={`lang-btn ${language === 'fr' ? 'active' : ''}`}
            onClick={() => setLanguage('fr')}
          >
            {t('header.languages.fr')}
          </button>
        </div>

        <a href="#help" onClick={(e) => e.preventDefault()} className="header-link header-link-help">
          {t('header.help')}
        </a>

        <a href="#logout" onClick={(e) => e.preventDefault()} className="header-link header-link-logout">
          {t('header.logout')}
        </a>
      </div>
    </header>
  );
}
