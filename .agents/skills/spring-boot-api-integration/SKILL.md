---
name: spring-boot-api-integration
description: Guide and standards for integrating frontend React applications with Spring Boot REST APIs, clean query params, error interceptors, and optimistic locking.
---

# Spring Boot REST API Integration Guidelines

## 1. Architectural Standards
- **Direct Backend Communication**: Target backend port 8080 or `REACT_APP_API_BASE_URL` directly via Axios instance (`apiClient`).
- **TC-ADV-04 Clean Params Rule**: Automatically strip empty strings, null, and undefined values from query parameters before sending GET requests.
- **Language Negotiation**: Automatically attach `Accept-Language: en` or `Accept-Language: fr` headers based on `LanguageContext` so Spring Boot reads the correct `messages.properties` / `messages_fr.properties`.
- **Conditional Content-Type**: Only attach `Content-Type: application/json` for requests with body (`POST`, `PUT`, `PATCH`, `DELETE`) to avoid redundant CORS preflight checks on simple GET requests.

## 2. Error Interceptor Conventions
- Standardize backend error responses into formatted JS `Error` instances containing:
  - `status`: HTTP status code (400, 404, 409, 500).
  - `errorCode`: Custom business code (e.g. `VALIDATION_ERROR`, `PROJECT_NUMBER_ALREADY_EXISTS`, `VISA_NOT_FOUND`).
  - `errors`: Map of field names to error messages.
  - `invalidVisas`: Array of non-existent visas when available.

## 3. Optimistic Locking & Concurrency
- Include entity `version` in `PUT` update requests.
- Catch HTTP 409 Conflict when another user has updated the record, and prompt user with conflict notice.
