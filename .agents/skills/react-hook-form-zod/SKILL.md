---
name: react-hook-form-zod
description: Guide and best practices for creating bulletproof forms using React Hook Form, Zod schema validation, mode: onChange, and Spring Boot backend error mapping.
---

# React Hook Form + Zod Validation Pattern

## 1. Core Principles
- **Schema-First Validation**: Define all validation rules in a centralized Zod schema (`projectSchema`).
- **Idiomatic RHF Flow**: Let `handleSubmit(onSubmit, onFormError)` handle validation lifecycle automatically. Never parse schemas or check errors manually inside submit handlers.
- **Dynamic Field Clearing**: Use `mode: 'onChange'` in `useForm` so validation errors and red borders disappear immediately when users correct invalid inputs.
- **Native Submitting State**: Rely on RHF's native `formState.isSubmitting` instead of creating redundant manual `submitting` boolean states.
- **Backend Error Mapping**: Map Spring Boot field errors (`DUPLICATE_NUMBER`, `INVALID_END_DATE`, `INVALID_VISAS`, `VALIDATION_ERROR`) directly to fields using `setError('fieldName', { type: 'manual' })`.

## 2. Standard Pattern Implementation
```javascript
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const formSchema = z.object({
  projectNumber: z.coerce.number().positive(),
  name: z.string().trim().min(1).max(50),
  customer: z.string().trim().min(1).max(50),
  groupId: z.coerce.number().positive(),
  status: z.enum(['NEW', 'PLA', 'INP', 'FIN']),
  startDate: z.string().min(1),
  endDate: z.string().optional().nullable(),
}).refine(
  (data) => !data.endDate || !data.startDate || new Date(data.endDate) > new Date(data.startDate),
  { path: ['endDate'], message: 'invalidEndDate' }
);
```

## 3. Backend Error Synchronization
- Always catch 400 Bad Request responses and inspect both `errorCode` and `errors` dictionary.
- Highlight offending inputs with `field-error` CSS class while displaying localized banner messages.
