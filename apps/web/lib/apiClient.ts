import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7088/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Send and receive HttpOnly cookies across origins/ports
});

// Interceptor: ensure legacy auth_token is scrubbed from localStorage
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined' && localStorage.getItem('auth_token')) {
      localStorage.removeItem('auth_token');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors (e.g., 401 Unauthorized)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;

