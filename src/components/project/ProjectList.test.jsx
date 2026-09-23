import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { LanguageProvider } from '../../context/LanguageContext';
import { ProjectProvider } from '../../context/ProjectContext';
import ProjectList from './ProjectList';
import { projectService } from '../../services/projectService';

const renderWithProviders = (ui) => {
  return render(
    <BrowserRouter>
      <LanguageProvider>
        <ProjectProvider>{ui}</ProjectProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
};

describe('ProjectList Component Tests', () => {
  beforeEach(() => {
    projectService.resetToDefault();
  });

  test('renders page title and search controls', () => {
    renderWithProviders(<ProjectList />);
    expect(screen.getByText(/Projects List/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Project number, name, customer name/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Search Project/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reset Search/i })).toBeInTheDocument();
  });

  test('renders project rows and links', () => {
    renderWithProviders(<ProjectList />);
    // Project 3116 is in the first page
    const link = screen.getByRole('link', { name: '3116' });
    expect(link).toBeInTheDocument();
    expect(link.getAttribute('href')).toBe('/project/edit/3116');

    // Check customer and status
    expect(screen.getByText('Facturation / Encaissements')).toBeInTheDocument();
    expect(screen.getAllByText('Les Retaites Populaires').length).toBeGreaterThan(0);
  });

  test('only projects with status NEW have delete trash icon', () => {
    renderWithProviders(<ProjectList />);
    // 3116 has status NEW -> has delete button
    expect(screen.getByLabelText('Delete project 3116')).toBeInTheDocument();

    // 3118 has status FIN -> does NOT have delete button
    expect(screen.queryByLabelText('Delete project 3118')).not.toBeInTheDocument();
  });

  test('filters projects by search keyword', () => {
    renderWithProviders(<ProjectList />);
    const searchInput = screen.getByPlaceholderText(/Project number, name, customer name/i);
    const searchBtn = screen.getByRole('button', { name: /Search Project/i });

    // Search for 7157
    fireEvent.change(searchInput, { target: { value: '7157' } });
    fireEvent.click(searchBtn);

    expect(screen.getByRole('link', { name: '7157' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: '3116' })).not.toBeInTheDocument();

    // Reset search
    const resetBtn = screen.getByRole('button', { name: /Reset Search/i });
    fireEvent.click(resetBtn);
    expect(screen.getByRole('link', { name: '3116' })).toBeInTheDocument();
  });

  test('selects multiple rows and displays selected count', () => {
    renderWithProviders(<ProjectList />);
    const check3116 = screen.getByLabelText('Select project 3116');
    const check3118 = screen.getByLabelText('Select project 3118');

    fireEvent.click(check3116);
    expect(screen.getByText(/1 items selected/i)).toBeInTheDocument();

    fireEvent.click(check3118);
    expect(screen.getByText(/2 items selected/i)).toBeInTheDocument();
  });

  test('toggles advanced filter section on button click', () => {
    renderWithProviders(<ProjectList />);
    const advBtn = screen.getByRole('button', { name: /Advanced Filter/i });
    expect(screen.queryByPlaceholderText(/e\.g\. DTH/i)).not.toBeInTheDocument();

    fireEvent.click(advBtn);
    expect(screen.getByPlaceholderText(/e\.g\. DTH/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/e\.g\. BHU/i)).toBeInTheDocument();

    fireEvent.click(advBtn);
    expect(screen.queryByPlaceholderText(/e\.g\. DTH/i)).not.toBeInTheDocument();
  });

  test('sorts table when column header is clicked', () => {
    renderWithProviders(<ProjectList />);
    const nameHeader = screen.getByText('Name');
    fireEvent.click(nameHeader);
    expect(nameHeader.querySelector('.sort-caret').textContent).toBe('▲');

    fireEvent.click(nameHeader);
    expect(nameHeader.querySelector('.sort-caret').textContent).toBe('▼');
  });
});
