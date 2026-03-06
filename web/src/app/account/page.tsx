'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '../../lib/api';
import { useRouter } from 'next/navigation';

export default function AccountHomePage() {
  const router = useRouter();
  const [me, setMe] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/api/auth/me')
      .then(setMe)
      .catch(() => router.replace('/login'))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) return <div className="card">Chargement...</div>;
  if (!me) return null;

  return (
    <div className="card">
      <h1 className="h1">Mon compte</h1>
      <p className="muted">{me ? `Connecté: ${me.user.email}` : 'Chargement...'}</p>
      <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
        <Link className="btn" href="/account/boards">
          Mes boards
        </Link>
      </div>
    </div>
  );
}
