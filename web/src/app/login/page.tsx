'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch, setAuthToken } from '../../lib/api';
import { signIn } from 'next-auth/react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await apiFetch<{ token?: string; user?: { role?: string } }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      if (data.token) {
        setAuthToken(data.token);
      }
      router.push(data.user?.role === 'ADMIN' ? '/admin' : '/account/boards');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="card" style={{ maxWidth: 480, margin: '0 auto' }}>
      <h1 className="h1">Connexion</h1>
      {error && <p className="error">{error}</p>}
      <label className="label">Email</label>
      <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
      <label className="label" style={{ marginTop: 10 }}>
        Mot de passe
      </label>
      <input className="input" value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
      <button className="btn" disabled={loading} style={{ marginTop: 14 }}>
        {loading ? 'Connexion...' : 'Se connecter'}
      </button>
      <div style={{ marginTop: 16, display: 'grid', gap: 8 }}>
        <button type="button" className="btn outline" onClick={() => signIn('google', { callbackUrl: '/account/boards' })}>
          Continuer avec Google
        </button>
        <button type="button" className="btn outline" onClick={() => signIn('facebook', { callbackUrl: '/account/boards' })}>
          Continuer avec Facebook
        </button>
        <button type="button" className="btn outline" onClick={() => signIn('apple', { callbackUrl: '/account/boards' })}>
          Continuer avec Apple
        </button>
      </div>
    </form>
  );
}
