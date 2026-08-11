import axios from 'axios';
import { ENV } from './env';
import { installMockAdapter } from '../mocks/mockAdapter';

const BASE_URL = import.meta.env.VITE_API_URL;
if (!ENV.useMocks && !BASE_URL) throw new Error('VITE_API_URL is not set. Check your .env file.');

const apiClient = axios.create({
  baseURL: BASE_URL || 'http://localhost:8080',
  timeout: 30000,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Local-only: serve every request from the in-browser mock backend instead
// of the real API. Enabled via VITE_USE_MOCKS=true (see admin/.env.development.local).
if (ENV.useMocks) installMockAdapter(apiClient);

export default apiClient;
