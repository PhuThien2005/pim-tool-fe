---
name: ultra-concise-jsx
description: Guide and patterns for writing ultra-concise React JSX components and services that focus 100% on business logic and state management with zero CSS bloat and zero external CSS files.
---

# Ultra-Concise JSX & Service Architecture for PIM Tool

## 1. Core Principles
- **100% Business Logic Focus**: Components and service files must focus purely on business logic, state transitions, validation, and REST API integration.
- **Service Layer Condensation**:
  - Unify single and batch operations (e.g., `deleteProject(id)` delegates directly to `deleteProjects([id])`).
  - Extract common validations (Member Visas and Start/End Dates) into a shared functional validator closure.
  - Compact local persistence using concise JSON parsers with default fallbacks.
- **Component Row Abstractions**:
  - Use lightweight helper wrappers like `<FormRow>` to avoid duplicating 10-15 lines of flex container, labels, and error spans per form input.
- **Zero Physical CSS Files**:
  - All visual tokens (colors `#2F85FA`, Segoe UI typography, alignments, modals, and tables) reside in centralized JSX `GlobalStyles.jsx`.
  - Component files contain zero `<style>` blocks and zero CSS imports.

## 2. Component Refactoring Workflow
1. **Analyze & Isolate**: Identify repetitive markup patterns and inline CSS rules.
2. **Abstract Common Structures**: Create reusable micro-helpers (e.g., `FormRow`, unified date formatters).
3. **Centralize Styles**: Move all layout, spacing, and modal styles to `GlobalStyles.jsx`.
4. **Delegate Service Operations**: Keep service methods functional, declarative, and under 80 lines total.
5. **Verify Regressions**: Execute the full test suite (`npm test -- --watchAll=false`) and production build (`npm run build`).

## 3. Acceptance Criteria & UAT Alignment
- **US01 (Create & Edit Project)**:
  - Screen title switches between "New Project" and "Edit Project information".
  - Numeric mandatory project number (disabled in edit mode).
  - Mandatory field indicators (*) and validation error banner.
  - Autocomplete visa dropdown for members with database validation.
  - End date strictly after start date.
- **US02 (Project List & Deletion)**:
  - Table sorted ascending by project number.
  - Real-time search across number, name, and customer; status dropdown filter.
  - Preservation of search criteria across page transitions.
  - Delete trash icon only on projects with `NEW` status.
  - Multi-selection checkboxes, item counter, and confirmation modal.
  - Compact pagination control.
