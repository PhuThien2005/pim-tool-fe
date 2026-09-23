import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from '../../context/LanguageContext';
import { ProjectProvider } from '../../context/ProjectContext';
import ProjectForm from './ProjectForm';
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

describe('ProjectForm Component Tests', () => {
  beforeEach(() => {
    projectService.resetToDefault();
  });

  test('renders New Project title and all form inputs', () => {
    renderWithProviders(<ProjectForm isEdit={false} />);
    expect(screen.getByText('New Project')).toBeInTheDocument();
    expect(screen.getByLabelText(/Project Number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Project name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Customer/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Group/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Status/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Start date/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Project/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
  });

  test('displays mandatory validation notice when submitting empty form', () => {
    renderWithProviders(<ProjectForm isEdit={false} />);
    const submitBtn = screen.getByRole('button', { name: /Create Project/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText(/Please enter all the mandatory fields \(\*\)\./i)).toBeInTheDocument();
  });

  test('displays duplicate project number notice when number exists', () => {
    renderWithProviders(<ProjectForm isEdit={false} />);

    fireEvent.change(screen.getByLabelText(/Project Number/i), { target: { value: '3116' } });
    fireEvent.change(screen.getByLabelText(/Project name/i), { target: { value: 'Test Project' } });
    fireEvent.change(screen.getByLabelText(/Customer/i), { target: { value: 'Test Customer' } });
    fireEvent.change(screen.getByLabelText(/Start date/i), { target: { value: '2026-01-01' } });

    const submitBtn = screen.getByRole('button', { name: /Create Project/i });
    fireEvent.click(submitBtn);

    expect(
      screen.getByText(/The project number already existed\. Please select a different project number/i)
    ).toBeInTheDocument();
  });

  test('displays invalid visa error when non-existent visa is entered', () => {
    renderWithProviders(<ProjectForm isEdit={false} />);

    fireEvent.change(screen.getByLabelText(/Project Number/i), { target: { value: '9988' } });
    fireEvent.change(screen.getByLabelText(/Project name/i), { target: { value: 'Valid Project' } });
    fireEvent.change(screen.getByLabelText(/Customer/i), { target: { value: 'Test Customer' } });
    fireEvent.change(screen.getByLabelText(/Start date/i), { target: { value: '2026-01-01' } });

    const memberInput = screen.getByPlaceholderText(/Search employee visa or name\.\.\./i);
    fireEvent.change(memberInput, { target: { value: 'DTH, INVALID_VISA' } });

    const submitBtn = screen.getByRole('button', { name: /Create Project/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText(/The following visas do not exist: INVALID_VISA\./i)).toBeInTheDocument();
  });

  test('renders in edit mode with project number disabled', () => {
    const renderEdit = () =>
      render(
        <BrowserRouter>
          <LanguageProvider>
            <ProjectProvider>
              <Routes>
                <Route
                  path="/project/edit/:projectNumber"
                  element={<ProjectForm isEdit={true} />}
                />
              </Routes>
            </ProjectProvider>
          </LanguageProvider>
        </BrowserRouter>
      );

    window.history.pushState({}, 'Edit Page', '/project/edit/3116');
    renderEdit();

    expect(screen.getByText(/Edit Project information/i)).toBeInTheDocument();
    const numberInput = screen.getByLabelText(/Project Number/i);
    expect(numberInput).toBeDisabled();
    expect(numberInput.value).toBe('3116');
    expect(screen.getByRole('button', { name: /Edit Project/i })).toBeInTheDocument();
  });

  test('displays group dropdown options formatted by leader visa', () => {
    renderWithProviders(<ProjectForm isEdit={false} />);
    const groupSelect = screen.getByLabelText(/Group/i);
    const options = Array.from(groupSelect.querySelectorAll('option')).map((o) => o.textContent);
    expect(options).toContain('DTH');
    expect(options).toContain('BHU');
    expect(options).toContain('JHV');
  });

  test('loads project with 1:1 groupLeader visa and employees in edit mode', () => {
    const renderEdit = () =>
      render(
        <BrowserRouter>
          <LanguageProvider>
            <ProjectProvider>
              <Routes>
                <Route
                  path="/project/edit/:projectNumber"
                  element={<ProjectForm isEdit={true} />}
                />
              </Routes>
            </ProjectProvider>
          </LanguageProvider>
        </BrowserRouter>
      );

    window.history.pushState({}, 'Edit Page', '/project/edit/1004');
    renderEdit();

    expect(screen.getByText(/Edit Project information/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Project name/i).value).toBe('IOC CLIENT EXTRANET');
    const groupSelect = screen.getByLabelText(/Group/i);
    expect(groupSelect.value).toBe('2');
    expect(groupSelect.options[groupSelect.selectedIndex].text).toBe('BHU');
    expect(screen.getByPlaceholderText(/Search employee visa or name/i).value).toBe('HTV, TQP, QMV');
  });
});
