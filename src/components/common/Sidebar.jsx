import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

export default function Sidebar() {
  const { t } = useLanguage();
  const location = useLocation();

  const isProjectListActive = location.pathname === '/' || location.pathname.startsWith('/projects');
  const isNewProjectActive = location.pathname === '/project/new' || location.pathname === '/create-project';

  return (
    <aside className="pim-sidebar">
      <div className="sidebar-section">
        <NavLink
          to="/"
          exact
          className={`sidebar-title-link ${isProjectListActive ? 'active' : ''}`}
        >
          {t('sidebar.projectList')}
        </NavLink>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-heading">{t('sidebar.new')}</div>
        <ul className="sidebar-nav">
          <li className="sidebar-nav-item">
            <NavLink
              to="/project/new"
              className={isNewProjectActive ? 'active' : ''}
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
    </aside>
  );
}
