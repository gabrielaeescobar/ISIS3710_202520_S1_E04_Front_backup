export type AuthUser = {
  id: number;
  nombre: string;
  username: string;
  email: string;
  monedaBase: string;
  fotoPerfilUrl?: string;
};

const USER_KEY = 'layover_user';
const TOKEN_KEY = 'layover_token';

export function saveAuthSession(user: AuthUser, token?: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  if (token) localStorage.setItem(TOKEN_KEY, token);
}

export function getAuthUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function clearAuthSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(TOKEN_KEY);
}
