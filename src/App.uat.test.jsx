import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';
import { projectService } from './services/projectService';

describe('UAT User Journey Tests', () => {
  beforeEach(() => {
    projectService.resetToDefault();
    window.history.pushState({}, '', '/');
  });

  test('UAT Journey 1: Create Project with validation and navigation back to list', async () => {
    render(<App />);

    // 1. Navigate to "Project" under "New" menu
    const newProjectLink = screen.getByText('Project', { selector: 'a' });
    fireEvent.click(newProjectLink);

    expect(screen.getByText('New Project')).toBeInTheDocument();

    // 2. Submit empty form -> error notice
    const createBtn = screen.getByRole('button', { name: /Create Project/i });
    fireEvent.click(createBtn);
    expect(screen.getByText(/Please enter all the mandatory fields \(\*\)\./i)).toBeInTheDocument();

    // 3. Fill duplicate project number 3116 -> error notice
    fireEvent.change(screen.getByLabelText(/Project Number/i), { target: { value: '3116' } });
    fireEvent.change(screen.getByLabelText(/Project name/i), { target: { value: 'UAT Project' } });
    fireEvent.change(screen.getByLabelText(/Customer/i), { target: { value: 'UAT Customer' } });
    fireEvent.change(screen.getByLabelText(/Start date/i), { target: { value: '2026-02-01' } });
    fireEvent.click(createBtn);

    expect(
      screen.getByText(/The project number already existed\. Please select a different project number/i)
    ).toBeInTheDocument();

    // 4. Change project number to unique 8899 and supply invalid visa -> error notice
    fireEvent.change(screen.getByLabelText(/Project Number/i), { target: { value: '8899' } });
    const memberInput = screen.getByPlaceholderText(/Search employee visa or name\.\.\./i);
    fireEvent.change(memberInput, { target: { value: 'INVALID_XYZ' } });
    fireEvent.click(createBtn);

    expect(screen.getByText(/The following visas do not exist: INVALID_XYZ\./i)).toBeInTheDocument();

    // 5. Provide valid visa DTH, BHU and valid end date -> success
    fireEvent.change(memberInput, { target: { value: 'DTH, BHU' } });
    fireEvent.change(screen.getByLabelText(/End date/i), { target: { value: '2026-12-31' } });
    fireEvent.click(createBtn);

    // 6. Verified navigated back to Projects List
    expect(screen.getByText('Projects List')).toBeInTheDocument();
  });

  test('UAT Journey 2: Search criteria preservation when navigating back from Cancel', () => {
    render(<App />);

    // 1. Enter search term 'MGBAHN' and filter by status 'INP'
    const searchInput = screen.getByPlaceholderText(/Project number, name, customer name/i);
    const statusSelect = screen.getByDisplayValue(/Project status/i);
    const searchBtn = screen.getByRole('button', { name: /Search Project/i });

    fireEvent.change(searchInput, { target: { value: 'MGBAHN' } });
    fireEvent.change(statusSelect, { target: { value: 'INP' } });
    fireEvent.click(searchBtn);

    // Only 7157 should appear
    expect(screen.getByRole('link', { name: '7157' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: '3116' })).not.toBeInTheDocument();

    // 2. Navigate to Edit project 7157
    const link7157 = screen.getByRole('link', { name: '7157' });
    fireEvent.click(link7157);

    expect(screen.getByText('Edit Project information')).toBeInTheDocument();
    expect(screen.getByLabelText(/Project Number/i)).toBeDisabled();

    // 3. Click Cancel button
    const cancelBtn = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelBtn);

    // 4. Returned to Projects List: Search input and status select must be preserved!
    expect(screen.getByText('Projects List')).toBeInTheDocument();
    const returnedSearchInput = screen.getByPlaceholderText(/Project number, name, customer name/i);
    expect(returnedSearchInput.value).toBe('MGBAHN');
    expect(screen.getByRole('link', { name: '7157' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: '3116' })).not.toBeInTheDocument();
  });

  test('UAT Journey 3: Deletion rule enforcement for status NEW only', () => {
    render(<App />);

    // Single deletion: Project 3116 is status NEW -> trash icon exists
    const delete3116 = screen.getByLabelText('Delete project 3116');
    fireEvent.click(delete3116);

    // Modal appears
    expect(screen.getByText(/Are you sure you want to delete project #3116\?/i)).toBeInTheDocument();

    // Confirm deletion
    const confirmBtn = screen.getByRole('button', { name: /Confirm/i });
    fireEvent.click(confirmBtn);

    // Project 3116 should be removed
    expect(screen.queryByRole('link', { name: '3116' })).not.toBeInTheDocument();
  });
});
