---
name: mobile-responsive-design
description: Guidelines, patterns, and media query standards for building mobile-responsive web layouts with zero desktop regressions, hamburger navigation drawers, and touch-friendly controls.
---

# Mobile Responsive Design & Touch Optimization

## 1. Zero Desktop Regression Principle
- **Desktop-First Integrity**: The core desktop layout (1024px and above) must remain 100% identical to the official ELCA S25.2 specifications and existing snapshot tests.
- **Strict Media Queries**: All responsive overrides must be scoped within media queries:
  - `@media (max-width: 768px)` for mobile phones and small tablets.
  - `@media (max-width: 480px)` for compact mobile screens.
- **Never Modify Base Desktop Selectors**: Do not change desktop padding, widths, or flexbox layouts outside of `@media` blocks.

## 2. Navigation & Drawer Pattern
- **Hamburger Toggle Button**:
  - Hidden on desktop (`display: none;`).
  - Visible on mobile (`display: inline-flex;`) next to the logo.
  - Toggles a slide-in off-canvas drawer (`.pim-sidebar.mobile-open`).
- **Backdrop / Overlay**:
  - A darkened semi-transparent backdrop (`.sidebar-backdrop`) that closes the drawer when tapped.
- **Auto-Close on Navigation**:
  - Clicking any navigation link inside the drawer automatically closes the drawer.
- **Swipe-to-Close**:
  - Touch event listeners (`touchstart`, `touchend`) detecting left-swipe gestures to close the drawer naturally.

## 3. Form & Table Mobile Adaptations
- **Form Layout (US01)**:
  - Form rows switch from fixed 2-column flex to single-column stacked layout (`flex-direction: column`).
  - Inputs, selects, and autocomplete chips expand to `width: 100%`.
  - Date picker inputs stack vertically on mobile while preserving the calendar popup.
- **Data Table (US02)**:
  - Wrap table in an `overflow-x: auto; -webkit-overflow-scrolling: touch;` container to prevent page clipping.
  - Sticky first column (Project Number) or smooth horizontal scroll indicators.
  - Action buttons and search inputs stack gracefully without overflowing viewport.
- **Touch Targets**:
  - Minimum 44x44px touch target size for buttons, pagination numbers, and hamburger icons.
