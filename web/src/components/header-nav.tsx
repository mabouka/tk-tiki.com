'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiFetch, clearAuthToken } from '../lib/api';

export function HeaderNav() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    apiFetch('/api/auth/me')
      .then(() => setIsAuthenticated(true))
      .catch(() => setIsAuthenticated(false))
      .finally(() => setLoading(false));
  }, []);

  async function logout() {
    setIsLoggingOut(true);
    try {
      await apiFetch('/api/auth/logout', { method: 'POST', body: JSON.stringify({}) });
    } finally {
      clearAuthToken();
      setIsAuthenticated(false);
      setIsLoggingOut(false);
      window.location.href = '/';
    }
  }

  return (
    <nav className="nav-links">
      <Link href="/about-us">About</Link>
      <Link href="/contact">Contact</Link>
      {!isAuthenticated && !loading && (
        <>
          <Link href="/login">Login</Link>
          <Link href="/register">Register</Link>
        </>
      )}
      {isAuthenticated && !loading && (
        <button
          onClick={logout}
          disabled={isLoggingOut}
          style={{ border: 'none', background: 'transparent', color: 'inherit', cursor: 'pointer' }}
        >
          {isLoggingOut ? 'Logout...' : 'Logout'}
        </button>
      )}
      {isAuthenticated && !loading && <Link href="/account/boards">My Boards</Link>}
    </nav>
  );
}
