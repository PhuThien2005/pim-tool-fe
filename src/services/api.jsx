import axios from 'axios';

// Direct API base URL targeting backend server
const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
});

// Request interceptor to attach language header for backend i18n and conditional Content-Type
apiClient.interceptors.request.use((config) => {
  try {
    const lang = localStorage.getItem('pim_lang') || 'en';
    config.headers['Accept-Language'] = lang;
  } catch {
    config.headers['Accept-Language'] = 'en';
  }
  // Only set Content-Type for requests with body to avoid CORS preflight on simple GET
  if (['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase())) {
    config.headers['Content-Type'] = 'application/json';
  }

  // Strip empty string, null, and undefined query params (TC-ADV-04 Clean Params Rule)
  if (config.params && typeof config.params === 'object' && !Array.isArray(config.params)) {
    config.params = Object.fromEntries(
      Object.entries(config.params).filter(([_, v]) => v !== '' && v !== null && v !== undefined)
    );
  }

  return config;
});

// Response interceptor to format standard backend error responses
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = 'An unexpected error occurred.';
    let errorCode = null;
    let fieldErrors = {};

    if (error.response) {
      const data = error.response.data;
      if (typeof data === 'string' && data.trim()) {
        message = data;
      } else if (data) {
        if (data.message) message = data.message;
        else if (data.error) message = data.error;
        if (data.errorCode) errorCode = data.errorCode;
        if (data.errors) fieldErrors = data.errors;
      }

      if (error.response.status === 404 && !data?.message) {
        message = 'Project not found';
      } else if (error.response.status === 409) {
        message = data?.message || 'The project has been modified by another user. Please refresh and try again.';
      }
    } else if (error.request) {
      message = 'Cannot connect to backend server. Please check if the service is running.';
    }

    const formattedError = new Error(message);
    formattedError.status = error.response ? error.response.status : 0;
    formattedError.errorCode = errorCode;
    formattedError.errors = fieldErrors;
    formattedError.invalidVisas = error.response?.data?.invalidVisas || null;
    formattedError.originalError = error;
    return Promise.reject(formattedError);
  }
);

export default apiClient;
