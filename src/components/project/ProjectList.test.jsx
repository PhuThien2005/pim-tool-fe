import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
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

  test('renders project rows and links', async () => {
    renderWithProviders(<ProjectList />);
    // Project 3116 is in the first page
    const link = await screen.findByRole('link', { name: '3116' });
    expect(link).toBeInTheDocument();
    expect(link.getAttribute('href')).toBe('/project/edit/3116');

    // Check customer and status
    expect(screen.getByText('Facturation / Encaissements')).toBeInTheDocument();
    expect(screen.getAllByText('Les Retaites Populaires').length).toBeGreaterThan(0);
  });

  test('only projects with status NEW have delete trash icon', async () => {
    renderWithProviders(<ProjectList />);
    // 3116 has status NEW -> has delete button
    expect(await screen.findByLabelText('Delete project 3116')).toBeInTheDocument();

    // 3118 has status FIN -> does NOT have delete button
    expect(screen.queryByLabelText('Delete project 3118')).not.toBeInTheDocument();
  });

  test('filters projects by search keyword', async () => {
    renderWithProviders(<ProjectList />);
    const searchInput = screen.getByPlaceholderText(/Project number, name, customer name/i);
    const searchBtn = screen.getByRole('button', { name: /Search Project/i });

    // Wait for initial data to load
    await screen.findByRole('link', { name: '3116' });

    // Search for 7157
    fireEvent.change(searchInput, { target: { value: '7157' } });
    fireEvent.click(searchBtn);

    expect(await screen.findByRole('link', { name: '7157' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: '3116' })).not.toBeInTheDocument();

    // Reset search
    const resetBtn = screen.getByRole('button', { name: /Reset Search/i });
    fireEvent.click(resetBtn);
    expect(await screen.findByRole('link', { name: '3116' })).toBeInTheDocument();
  });

  test('selects multiple rows and displays selected count', async () => {
    renderWithProviders(<ProjectList />);
    // Wait for data to load
    await screen.findByLabelText('Select project 3116');

    const check3116 = screen.getByLabelText('Select project 3116');
    const check3118 = screen.getByLabelText('Select project 3118');

    fireEvent.click(check3116);
    expect(screen.getByText(/1 items selected/i)).toBeInTheDocument();

    fireEvent.click(check3118);
    expect(screen.getByText(/2 items selected/i)).toBeInTheDocument();
  });

  test('toggles advanced filter section on button click', async () => {
    renderWithProviders(<ProjectList />);
    // Wait for data to load
    await screen.findByRole('link', { name: '3116' });

    const advBtn = screen.getByRole('button', { name: /Advanced Filter/i });
    expect(screen.queryByLabelText(/Group \(Leader Visa\)/i)).not.toBeInTheDocument();

    fireEvent.click(advBtn);
    expect(screen.getByLabelText(/Group \(Leader Visa\)/i)).toBeInTheDocument();
    expect(screen.getByText('Select group')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search employee visa or name/i)).toBeInTheDocument();

    fireEvent.click(advBtn);
    expect(screen.queryByLabelText(/Group \(Leader Visa\)/i)).not.toBeInTheDocument();
  });

  test('sorts table when column header is clicked', async () => {
    renderWithProviders(<ProjectList />);
    // Wait for data to load
    await screen.findByRole('link', { name: '3116' });

    const nameHeader = screen.getByText('Name');
    fireEvent.click(nameHeader);
    expect(nameHeader.querySelector('.sort-caret').textContent).toBe('▲');

    fireEvent.click(nameHeader);
    expect(nameHeader.querySelector('.sort-caret').textContent).toBe('▼');
  });

  test('handles concurrent delete error gracefully by refreshing and showing concurrency notice', async () => {
    jest.spyOn(projectService, 'deleteProject').mockRejectedValueOnce(
      Object.assign(new Error('Project not found'), { status: 404, code: 'NOT_FOUND' })
    );

    renderWithProviders(<ProjectList />);
    await screen.findByRole('link', { name: '3116' });

    const deleteBtn = screen.getByLabelText('Delete project 3116');
    fireEvent.click(deleteBtn);

    const confirmBtn = screen.getByRole('button', { name: 'Confirm', selector: '.btn-pim-danger' });
    fireEvent.click(confirmBtn);

    expect(
      await screen.findByText(/already deleted or modified by another user/i)
    ).toBeInTheDocument();

    const closeBtn = screen.getByLabelText('Close error');
    fireEvent.click(closeBtn);
    expect(screen.queryByText(/already deleted or modified by another user/i)).not.toBeInTheDocument();

    projectService.deleteProject.mockRestore?.();
  });
});
