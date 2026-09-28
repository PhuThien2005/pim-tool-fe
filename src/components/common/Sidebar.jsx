import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

export default function Sidebar({ isOpen = false, onClose }) {
  const { t } = useLanguage();
  const location = useLocation();
  const touchStartXRef = React.useRef(null);
  const touchStartYRef = React.useRef(null);

  const isProjectListActive = location.pathname === '/' || location.pathname.startsWith('/projects');
  const isNewProjectActive = location.pathname === '/project/new' || location.pathname === '/create-project';
  const isEditProjectActive = location.pathname.startsWith('/project/edit');

  const handleTouchStart = (e) => {
    if (e.touches && e.touches.length > 0) {
      touchStartXRef.current = e.touches[0].clientX;
      touchStartYRef.current = e.touches[0].clientY;
    }
  };

  const handleTouchEnd = (e) => {
    if (touchStartXRef.current !== null && e.changedTouches && e.changedTouches.length > 0) {
      const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
      const deltaY = e.changedTouches[0].clientY - touchStartYRef.current;
      // If user swiped left by at least 50px and horizontally dominant
      if (deltaX < -50 && Math.abs(deltaX) > Math.abs(deltaY)) {
        if (onClose) {
          onClose();
        }
      }
    }
    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  const handleNavClick = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <aside
      className={`pim-sidebar ${isOpen ? 'mobile-open' : ''}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-label="Sidebar navigation"
    >
      <div className="sidebar-mobile-header">
        <span className="sidebar-mobile-title">{t('sidebar.menu')}</span>
        <button
          type="button"
          className="sidebar-close-btn"
          onClick={onClose}
          aria-label="Close menu"
          data-testid="sidebar-close-btn"
        >
          &times;
        </button>
      </div>

      <div className="sidebar-inner">
        <div className="sidebar-section">
          <NavLink
            to="/"
            end
            className={`sidebar-title-link ${isProjectListActive ? 'active' : ''}`}
            onClick={handleNavClick}
          >
            {t('sidebar.projectList')}
          </NavLink>
        </div>

        <div className="sidebar-section">
          <NavLink
            to="/project/new"
            className={`sidebar-heading ${isNewProjectActive || isEditProjectActive ? 'active' : ''}`}
            onClick={handleNavClick}
          >
            {t('sidebar.new')}
          </NavLink>
          <ul className="sidebar-nav">
            <li className="sidebar-nav-item">
              <NavLink
                to="/project/new"
                className={isNewProjectActive || isEditProjectActive ? 'active' : ''}
                onClick={handleNavClick}
              >
                {t('sidebar.project')}
              </NavLink>
            </li>
            <li className="sidebar-nav-item">
              <a
                href="#customer"
                onClick={(e) => e.preventDefault()}
                className="disabled"
                title="Out of scope"
              >
                {t('sidebar.customer')}
              </a>
            </li>
            <li className="sidebar-nav-item">
              <a
                href="#supplier"
                onClick={(e) => e.preventDefault()}
                className="disabled"
                title="Out of scope"
              >
                {t('sidebar.supplier')}
              </a>
            </li>
          </ul>
        </div>
      </div>
    </aside>
  );
}
