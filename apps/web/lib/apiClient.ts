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

export const resolveAttachmentUrl = (url?: string | null): string => {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  const base = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3020/api/v1').replace(/\/+$/, '');
  const clean = url.startsWith('/') ? url : `/${url}`;
  if (clean.startsWith('/api/v1/')) {
    const origin = base.replace(/\/api\/v1\/?$/, '');
    return `${origin}${clean}`;
  }
  return `${base}${clean}`;
};

export const downloadAttachmentBlob = async (url: string, fileName?: string): Promise<void> => {
  const resolved = resolveAttachmentUrl(url);
  const response = await apiClient.get(resolved, { responseType: 'blob' });
  const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = fileName || url.split('/').pop() || 'attachment';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(blobUrl);
};

export default apiClient;

