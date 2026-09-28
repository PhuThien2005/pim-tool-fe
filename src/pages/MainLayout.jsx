import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import ProjectListPage from './ProjectListPage';
import ProjectCreateEditPage from './ProjectCreateEditPage';
import ErrorPage from './ErrorPage';

export default function MainLayout() {
  const location = useLocation();
  const isError = location.pathname === '/error';
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Automatically close mobile drawer when navigating to a new route
  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [location.pathname]);

  const handleToggleSidebar = () => {
    setIsMobileSidebarOpen((prev) => !prev);
  };

  const handleCloseSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  return (
    <div className="pim-app-layout">
      <Header
        onToggleSidebar={handleToggleSidebar}
        isSidebarOpen={isMobileSidebarOpen}
      />

      <div className="pim-body-layout">
        {/* Mobile backdrop overlay */}
        {isMobileSidebarOpen && !isError && (
          <div
            className="sidebar-backdrop"
            onClick={handleCloseSidebar}
            data-testid="sidebar-backdrop"
          />
        )}

        {!isError && (
          <Sidebar
            isOpen={isMobileSidebarOpen}
            onClose={handleCloseSidebar}
          />
        )}

        <main className={`pim-main-content ${isError ? 'error-content' : ''}`}>
          <Routes>
            <Route path="/" element={<ProjectListPage />} />
            <Route path="/projects" element={<ProjectListPage />} />
            <Route path="/project/new" element={<ProjectCreateEditPage key="new" />} />
            <Route path="/project/edit/:id" element={<ProjectCreateEditPage key="edit-id" />} />
            <Route path="/project/edit/:projectNumber" element={<ProjectCreateEditPage key="edit-num" />} />
            <Route path="/error" element={<ErrorPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
