import { PAGE_DEFS } from '../constants/pages';

const SESSION_KEY = 'adminSession';

// The actual bearer token now lives only in an httpOnly cookie the browser
// manages — JS never touches it, closing off the XSS/localStorage exfiltration
// path a raw JWT sitting here used to have. This stores only non-secret session
// metadata (who's logged in, their role/pages, when it expires) so the UI can
// render synchronously without an extra round trip on every page load. It is
// purely a UX hint — the server (via the cookie) remains the actual auth gate;
// a stale or tampered value here just gets a 401 on the next API call.
export const setSession = (session) => localStorage.setItem(SESSION_KEY, JSON.stringify(session));
export const clearSession = () => localStorage.removeItem(SESSION_KEY);

function getSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY));
  } catch {
    return null;
  }
}

export function isLoggedIn() {
  const session = getSession();
  return !!session && typeof session.exp === 'number' && session.exp * 1000 > Date.now();
}

// Returns { username, role, pages } (absent on expired/missing sessions).
export function getUserInfo() {
  if (!isLoggedIn()) return null;
  const session = getSession();
  return { username: session.username, role: session.role, pages: session.pages || [] };
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
