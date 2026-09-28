import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { LanguageProvider } from '../../context/LanguageContext';
import { ProjectProvider } from '../../context/ProjectContext';
import MainLayout from '../../pages/MainLayout';
import Sidebar from './Sidebar';
import Header from './Header';

const renderWithProviders = (ui) =>
  render(
    <BrowserRouter>
      <LanguageProvider>
        <ProjectProvider>{ui}</ProjectProvider>
      </LanguageProvider>
    </BrowserRouter>
  );

describe('Mobile Navigation Drawer & Touch Gestures Unit & Integration Tests', () => {
  test('hamburger button is rendered with proper accessibility attributes', () => {
    const handleToggle = jest.fn();
    renderWithProviders(<Header onToggleSidebar={handleToggle} isSidebarOpen={false} />);
    const btn = screen.getByTestId('header-hamburger-btn');
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(btn);
    expect(handleToggle).toHaveBeenCalledTimes(1);
  });

  test('toggling sidebar in MainLayout opens drawer and displays backdrop', () => {
    renderWithProviders(<MainLayout />);

    // Initially backdrop does not exist and sidebar does not have mobile-open class
    expect(screen.queryByTestId('sidebar-backdrop')).not.toBeInTheDocument();
    const sidebar = screen.getByLabelText('Sidebar navigation');
    expect(sidebar).not.toHaveClass('mobile-open');

    // Click hamburger button to open drawer
    const hamburgerBtn = screen.getByTestId('header-hamburger-btn');
    fireEvent.click(hamburgerBtn);

    // Sidebar gets mobile-open class and backdrop appears
    expect(sidebar).toHaveClass('mobile-open');
    const backdrop = screen.getByTestId('sidebar-backdrop');
    expect(backdrop).toBeInTheDocument();

    // Clicking backdrop closes drawer
    fireEvent.click(backdrop);
    expect(screen.queryByTestId('sidebar-backdrop')).not.toBeInTheDocument();
    expect(sidebar).not.toHaveClass('mobile-open');
  });

  test('close button inside sidebar mobile header closes drawer', () => {
    renderWithProviders(<MainLayout />);
    const hamburgerBtn = screen.getByTestId('header-hamburger-btn');
    fireEvent.click(hamburgerBtn);

    const sidebar = screen.getByLabelText('Sidebar navigation');
    expect(sidebar).toHaveClass('mobile-open');

    const closeBtn = screen.getByTestId('sidebar-close-btn');
    fireEvent.click(closeBtn);

    expect(sidebar).not.toHaveClass('mobile-open');
    expect(screen.queryByTestId('sidebar-backdrop')).not.toBeInTheDocument();
  });

  test('swiping left on sidebar triggers onClose handler', () => {
    const handleClose = jest.fn();
    renderWithProviders(<Sidebar isOpen={true} onClose={handleClose} />);
    const sidebar = screen.getByLabelText('Sidebar navigation');

    // Simulate touch swipe left: start at x=200, end at x=100 (deltaX = -100)
    fireEvent.touchStart(sidebar, { touches: [{ clientX: 200, clientY: 150 }] });
    fireEvent.touchEnd(sidebar, { changedTouches: [{ clientX: 100, clientY: 150 }] });

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  test('swiping right or vertical scrolling does not trigger onClose', () => {
    const handleClose = jest.fn();
    renderWithProviders(<Sidebar isOpen={true} onClose={handleClose} />);
    const sidebar = screen.getByLabelText('Sidebar navigation');

    // Swipe right (deltaX = +100)
    fireEvent.touchStart(sidebar, { touches: [{ clientX: 100, clientY: 150 }] });
    fireEvent.touchEnd(sidebar, { changedTouches: [{ clientX: 200, clientY: 150 }] });
    expect(handleClose).not.toHaveBeenCalled();

    // Vertical scroll (deltaY = 150, deltaX = -20)
    fireEvent.touchStart(sidebar, { touches: [{ clientX: 100, clientY: 50 }] });
    fireEvent.touchEnd(sidebar, { changedTouches: [{ clientX: 80, clientY: 200 }] });
    expect(handleClose).not.toHaveBeenCalled();
  });

  test('clicking navigation link in sidebar invokes onClose', () => {
    const handleClose = jest.fn();
    renderWithProviders(<Sidebar isOpen={true} onClose={handleClose} />);
    const link = screen.getByText('Projects list', { selector: '.sidebar-title-link' });
    fireEvent.click(link);
    expect(handleClose).toHaveBeenCalled();
  });
});
