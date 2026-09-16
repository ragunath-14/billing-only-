import { PAGE_DEFS } from '../constants/pages';

const TOKEN_KEY = 'authToken';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

// Decodes the JWT payload locally to check expiry without a network round-trip.
// The server is still the source of truth — any stale/tampered token is rejected
// by requireAuth on the next API call and the response interceptor logs it out.
function decodeToken(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

export function isLoggedIn() {
  const token = getToken();
  if (!token) return false;
  const payload = decodeToken(token);
  return !!payload && typeof payload.exp === 'number' && payload.exp * 1000 > Date.now();
}

// Decodes the current token into { sub, role, pages } (role/pages absent on expired/missing tokens).
export function getUserInfo() {
  if (!isLoggedIn()) return null;
  const payload = decodeToken(getToken());
  if (!payload) return null;
  return { username: payload.sub, role: payload.role, pages: payload.pages || [] };
}

export const isAdmin = () => getUserInfo()?.role === 'admin';

// The super-admin isn't scoped by page permissions; staff need the page in their token's pages list.
export function hasPageAccess(pageKey) {
  const user = getUserInfo();
  if (!user) return false;
  return user.role === 'admin' || user.pages.includes(pageKey);
}

// Where to send a logged-in user who hit a page they can't access. Admin always
// lands on the dashboard; staff land on the first page (in PAGE_DEFS order) they
// actually have — never a hardcoded route, so a staff user without dashboard
// access can't get bounced back into the very page that just denied them.
// Returns null if the account has no pages assigned at all.
export function firstAccessiblePagePath() {
  const user = getUserInfo();
  if (!user) return null;
  if (user.role === 'admin') return '/';
  const match = PAGE_DEFS.find(p => user.pages.includes(p.key));
  return match ? match.path : null;
}
