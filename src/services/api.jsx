import axios from 'axios';

// Default API base URL: empty string utilizes the CRA proxy defined in package.json
// or fallback to direct URL if specified in environment
const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000,
});

// Response interceptor to format backend error messages
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = 'An unexpected error occurred.';
    if (error.response) {
      // Server responded with error status code (4xx, 5xx)
      const data = error.response.data;
      if (typeof data === 'string' && data.trim()) {
        message = data;
      } else if (data && data.message) {
        message = data.message;
      } else if (data && data.error) {
        message = data.error;
      } else if (error.response.status === 404) {
        message = 'Project not found';
      }
    } else if (error.request) {
      // The request was made but no response was received (e.g. backend offline)
      message = 'Cannot connect to backend server. Please check if the service is running.';
    }
    const formattedError = new Error(message);
    formattedError.status = error.response ? error.response.status : 0;
    formattedError.originalError = error;
    return Promise.reject(formattedError);
  }
);

export default apiClient;
