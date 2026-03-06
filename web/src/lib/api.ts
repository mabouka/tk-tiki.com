const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
const AUTH_TOKEN_KEY = 'tk_auth_token';

export function setAuthToken(token: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function clearAuthToken() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

export function getAuthToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(init?.headers);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
    credentials: 'include',
    cache: 'no-store'
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body.error || 'Request failed');
  }
  return body as T;
}
