import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import logo from '../../assets/images/logo_elca.png';

export default function Header({ onToggleSidebar, isSidebarOpen = false }) {
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="pim-header">
      <div className="header-brand-container">
        <button
          type="button"
          className="header-hamburger-btn"
          onClick={onToggleSidebar}
          aria-label={isSidebarOpen ? t('header.closeMenu') || 'Close navigation menu' : t('header.openMenu') || 'Open navigation menu'}
          aria-expanded={isSidebarOpen}
          data-testid="header-hamburger-btn"
        >
          <i className={`fa ${isSidebarOpen ? 'fa-times' : 'fa-bars'}`} />
        </button>

        <Link to="/" className="header-left" style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}>
          <img src={logo} alt="ELCA Logo" className="header-logo" />
          <h1 className="header-title">{t('header.title')}</h1>
        </Link>
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
