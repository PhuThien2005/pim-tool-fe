import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { ProjectProvider } from './context/ProjectContext';
import MainLayout from './pages/MainLayout';
import GlobalStyles from './styles/GlobalStyles';

export default function App() {
  return (
    <Router>
      <GlobalStyles />
      <LanguageProvider>
        <ProjectProvider>
          <MainLayout />
        </ProjectProvider>
      </LanguageProvider>
    </Router>
  );
}
