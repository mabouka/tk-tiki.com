'use client';

import Link from 'next/link';
import { FormEvent, ReactNode, useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';

const links = [
  ['/admin', 'Dashboard'],
  ['/admin/models', 'Models'],
  ['/admin/variants', 'Variants'],
  ['/admin/boards', 'Boards'],
  ['/admin/users', 'Users'],
  ['/admin/messages', 'Messages'],
  ['/admin/content', 'Content']
] as const;

function AdminLoginForm({ error }: { error: string }) {
  const [email, setEmail] = useState('admin@tk.com');
  const [password, setPassword] = useState('Admin123!');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(error);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');
    try {
      await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      window.location.href = '/admin';
    } catch (err: any) {
      setFormError(err.message || 'Connexion impossible');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="card" style={{ maxWidth: 480, margin: '0 auto' }}>
      <h1 className="h1">Admin Login</h1>
      {formError && <p className="error">{formError}</p>}
      <form onSubmit={onSubmit} className="grid">
        <div>
          <label className="label">Email</label>
          <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        </div>
        <div>
          <label className="label">Password</label>
          <input className="input" value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
        </div>
        <button className="btn" disabled={submitting}>
          {submitting ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>
    </section>
  );
}

export function AdminLayout({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch<{ user: { role: string } }>('/api/auth/me')
      .then((data) => {
        setIsAdmin(data.user.role === 'ADMIN');
      })
      .catch(() => {
        setIsAdmin(false);
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <section className="card">Chargement...</section>;
  }

  if (!isAdmin) {
    return <AdminLoginForm error={error} />;
  }

  return (
    <div className="sidebar-layout">
      <aside className="card admin-sidebar">
        {links.map(([href, label]) => (
          <Link key={href} href={href} className="btn outline" style={{ marginBottom: 8 }}>
            {label}
          </Link>
        ))}
      </aside>
      <div>{children}</div>
    </div>
  );
}
