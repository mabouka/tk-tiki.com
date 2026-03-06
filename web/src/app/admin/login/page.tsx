'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch, setAuthToken } from '../../../lib/api';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@tk.com');
  const [password, setPassword] = useState('Admin123!');
  const [error, setError] = useState('');

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      const data = await apiFetch<{ token?: string }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      if (data.token) {
        setAuthToken(data.token);
      }
      router.push('/admin');
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <form className="card" style={{ maxWidth: 480, margin: '0 auto' }} onSubmit={onSubmit}>
      <h1 className="h1">Admin Login</h1>
      {error && <p className="error">{error}</p>}
      <label className="label">Email</label>
      <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
      <label className="label" style={{ marginTop: 10 }}>
        Password
      </label>
      <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button className="btn" style={{ marginTop: 12 }}>
        Login admin
      </button>
    </form>
  );
}
