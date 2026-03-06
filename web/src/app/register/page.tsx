'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch, setAuthToken } from '../../lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await apiFetch<{ token?: string }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password })
      });
      if (data.token) {
        setAuthToken(data.token);
      }
      router.push('/account/boards');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="card" style={{ maxWidth: 480, margin: '0 auto' }}>
      <h1 className="h1">Créer un compte</h1>
      {error && <p className="error">{error}</p>}
      <label className="label">Nom</label>
      <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
      <label className="label" style={{ marginTop: 10 }}>
        Email
      </label>
      <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
      <label className="label" style={{ marginTop: 10 }}>
        Mot de passe
      </label>
      <input className="input" value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
      <button className="btn" disabled={loading} style={{ marginTop: 14 }}>
        {loading ? 'Création...' : 'Créer'}
      </button>
    </form>
  );
}
