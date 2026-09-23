import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LanguageProvider } from './context/LanguageContext';
import { ProjectProvider } from './context/ProjectContext';
import MainLayout from './pages/MainLayout';
import GlobalStyles from './styles/GlobalStyles';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <GlobalStyles />
        <LanguageProvider>
          <ProjectProvider>
            <MainLayout />
          </ProjectProvider>
        </LanguageProvider>
      </Router>
    </QueryClientProvider>
  );
}
