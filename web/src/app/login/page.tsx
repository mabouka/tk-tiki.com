'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '../../lib/api';

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
      await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      router.push('/account/boards');
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
    </form>
  );
}
