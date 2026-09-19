// Side-effect module: sends the httpOnly auth cookie with every request, and
// force-logs-out on any 401 from a protected endpoint. Imported once at app
// bootstrap so it applies globally regardless of which file calls axios.
import axios from 'axios';
import { clearSession } from '../utils/auth';

// The bearer token lives in an httpOnly cookie the browser attaches on its
// own for same-origin requests — this just makes sure it's also sent for
// cross-origin ones (e.g. the Vite dev server calling the separate API port).
axios.defaults.withCredentials = true;

axios.interceptors.response.use(
  (res) => res,
  (err) => {
    const isLoginAttempt = err.config?.url?.includes('/auth/login');
    if (err.response?.status === 401 && !isLoginAttempt) {
      clearSession();
      if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/shop')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);
