import React from 'react';
import { Switch, Route, Redirect, useLocation } from 'react-router-dom';
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
          <Switch>
            <Route exact path="/" component={ProjectListPage} />
            <Route exact path="/projects" component={ProjectListPage} />
            <Route exact path="/project/new" component={ProjectCreateEditPage} />
            <Route exact path="/create-project" component={ProjectCreateEditPage} />
            <Route exact path="/project/edit/:projectNumber" component={ProjectCreateEditPage} />
            <Route exact path="/error" component={ErrorPage} />
            <Redirect to="/" />
          </Switch>
        </main>
      </div>
    </div>
  );
}
