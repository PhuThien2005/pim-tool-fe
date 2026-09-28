---
name: elca-design-system
description: Design system guidelines, color tokens, typography (Segoe UI), table alignments, and accessible UI components conforming to ELCA standards.
---

# ELCA Design System & GUI Standards

## 1. Visual Tokens & Color Palette
- **Primary Brand Blue**: `#0088D0` (Default), `#0058CC` (Hover & active state).
- **Secondary Actions / Sidebar Active**: `#2E84FB`
- **Search Button Gradient**: `linear-gradient(to top, #0058CC, #0084CC)`
- **Body & Text Content**: `#666666` (Strict compliance with ELCA mockups, never `#000000`).
- **Error & Danger**: `#D9534F` (Borders, delete icons, error banner text).
- **Read-only Background**: `#F0F0F0`

## 2. Typography & Text Alignment Rules
- **Font Family**: `'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif`
- **Strict Table Column Alignments (S25.2 GUI Rules)**:
  - **Number column**: Right-aligned (`align-right`)
  - **Name column**: Left-aligned (`align-left`)
  - **Status column**: Left-aligned (`align-left`)
  - **Customer column**: Left-aligned (`align-left`)
  - **Start Date column**: Center-aligned (`align-center`)
  - **Delete column**: Center-aligned (`align-center`)

## 3. Component Architecture
- Use `src/styles/global.css` for centralized stylesheet definitions.
- Maintain consistent 220px popup width for `LocaleDatePicker` with year/month selection.
- Multi-resolution 32-bit ARGB ELCA favicon for crisp brand representation.
