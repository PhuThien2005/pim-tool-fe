import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import ProjectListPage from './ProjectListPage';
import ProjectCreateEditPage from './ProjectCreateEditPage';
import ErrorPage from './ErrorPage';

export default function MainLayout() {
  const location = useLocation();
  const isError = location.pathname === '/error';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#FFFFFF' }}>
      <Header />

      <div style={{ display: 'flex', flex: 1 }}>
        {!isError && <Sidebar />}

        <main style={{ flex: 1, padding: isError ? '0' : '16px 24px', overflowY: 'auto' }}>
          <Routes>
            <Route path="/" element={<ProjectListPage />} />
            <Route path="/projects" element={<ProjectListPage />} />
            <Route path="/project/new" element={<ProjectCreateEditPage />} />
            <Route path="/create-project" element={<ProjectCreateEditPage />} />
            <Route path="/project/edit/:projectNumber" element={<ProjectCreateEditPage />} />
            <Route path="/error" element={<ErrorPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
