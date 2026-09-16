// Side-effect module: attaches the admin bearer token to every axios request,
// and force-logs-out on any 401 from a protected endpoint. Imported once at
// app bootstrap so it applies globally regardless of which file calls axios.
import axios from 'axios';
import { getToken, clearToken } from '../utils/auth';

axios.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axios.interceptors.response.use(
  (res) => res,
  (err) => {
    const isLoginAttempt = err.config?.url?.includes('/auth/login');
    if (err.response?.status === 401 && !isLoginAttempt) {
      clearToken();
      if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/shop')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);
