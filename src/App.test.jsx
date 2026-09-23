import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

describe('PIM Tool Application Integration Tests', () => {
  test('renders header title and navigation', () => {
    render(<App />);

    // Header title
    expect(screen.getByText('Project Information Management')).toBeInTheDocument();

    // Sidebar navigation
    expect(screen.getByText('Projects list')).toBeInTheDocument();
    expect(screen.getByText('New', { selector: '.sidebar-heading' })).toBeInTheDocument();
    expect(screen.getByText('Project')).toBeInTheDocument();
  });

  test('switches language between English and French', () => {
    render(<App />);

    const frBtn = screen.getByRole('button', { name: 'FR' });
    fireEvent.click(frBtn);

    // Header title in French
    expect(screen.getByText('Gestion des Informations des Projets')).toBeInTheDocument();
    expect(screen.getByText('Liste des projets')).toBeInTheDocument();

    const enBtn = screen.getByRole('button', { name: 'EN' });
    fireEvent.click(enBtn);

    // Header title back in English
    expect(screen.getByText('Project Information Management')).toBeInTheDocument();
  });
});
