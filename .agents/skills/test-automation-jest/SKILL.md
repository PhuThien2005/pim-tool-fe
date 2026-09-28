---
name: test-automation-jest
description: Best practices for writing asynchronous unit tests and UAT user journeys with Jest, React Testing Library, and TanStack React Query.
---

# Test Automation with Jest & React Testing Library

## 1. Core Principles
- **Async-First Testing**: Modern React applications with React Query and async service calls require `await screen.findByRole(...)` or `await screen.findByText(...)` instead of synchronous `screen.getBy*`.
- **User Journey Testing (UAT)**: Test full multi-step workflows in `App.uat.test.jsx`:
  - Journey 1: Create project with validation errors, fix errors, and verify redirect.
  - Journey 2: Search criteria and pagination preservation across cancel / navigation.
  - Journey 3: Project deletion rules (only `NEW` status can be deleted).
- **Service Layer Mocking**: Use `src/services/__mocks__/projectService.jsx` to simulate backend REST responses with in-memory stores.

## 2. Test Verification Commands
```bash
# Run all test suites once
npm test -- --watchAll=false

# Run specific test file
npm test -- src/components/project/ProjectForm.test.jsx --watchAll=false
```
