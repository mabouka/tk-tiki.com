'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { apiFetch, setAuthToken } from '../../../lib/api';
import { Card, StatusBadge } from '../../../components/ui';

type BoardPayload = {
  board: {
    publicId: string;
    serialNumber: string;
    status: 'unclaimed' | 'active' | 'stolen' | 'transferred';
    isClaimed: boolean;
    publicUrl: string;
    variant: {
      sizeCm: number;
      model: {
        code: string;
        name: string;
      };
    };
  };
};

export default function BoardPublicPage({ params }: { params: { publicId: string } }) {
  const [data, setData] = useState<BoardPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [contactLoading, setContactLoading] = useState(false);
  const [claimLoading, setClaimLoading] = useState(false);

  useEffect(() => {
    apiFetch<BoardPayload>(`/api/boards/${params.publicId}/public`)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [params.publicId]);

  async function registerAndClaim(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setClaimLoading(true);
    setNotice('');
    setError('');
    const form = new FormData(e.currentTarget);
    const payload = {
      name: String(form.get('name') || ''),
      email: String(form.get('email') || ''),
      password: String(form.get('password') || '')
    };

    try {
      const register = await apiFetch<{ token?: string }>(`/api/auth/register`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      if (register.token) {
        setAuthToken(register.token);
      }
      await apiFetch(`/api/boards/${params.publicId}/claim`, { method: 'POST', body: JSON.stringify({}) });
      setNotice('Compte créé et board ajoutée à votre compte.');
      setData((prev) => (prev ? { ...prev, board: { ...prev.board, status: 'active', isClaimed: true } } : prev));
      (e.target as HTMLFormElement).reset();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setClaimLoading(false);
    }
  }

  async function sendContact(e: FormEvent<HTMLFormElement>, endpoint: 'contact' | 'report-found') {
    e.preventDefault();
    setContactLoading(true);
    setNotice('');
    setError('');

    const form = new FormData(e.currentTarget);
    const payload = {
      senderName: String(form.get('senderName') || ''),
      senderEmail: String(form.get('senderEmail') || ''),
      senderPhone: String(form.get('senderPhone') || ''),
      message: String(form.get('message') || ''),
      locationText: String(form.get('locationText') || ''),
      website: String(form.get('website') || '')
    };

    try {
      await apiFetch(`/api/boards/${params.publicId}/${endpoint}`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      setNotice('Message envoyé au propriétaire.');
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setContactLoading(false);
    }
  }

  if (loading) return <p>Chargement...</p>;
  if (error && !data) return <Card><h1 className="h1">Board not found</h1><p className="muted">{error}</p></Card>;
  if (!data) return <Card><h1 className="h1">Board not found</h1></Card>;

  const board = data.board;
  const isUnclaimed = !board.isClaimed && board.status === 'unclaimed';
  const isStolen = board.status === 'stolen';

  return (
    <div className="grid">
      <Card>
        <h1 className="h1">Board {board.publicId}</h1>
        <p>
          <StatusBadge status={board.status} />
        </p>
        <p className="muted">
          Modèle: {board.variant.model.code} ({board.variant.model.name})<br />
          Taille: {board.variant.sizeCm} cm<br />
          Serial: {board.serialNumber}
        </p>
        {isUnclaimed && <p className="badge">Board verified</p>}
        {board.isClaimed && !isStolen && <p className="badge warn">Board registered</p>}
        {isStolen && <p className="badge danger">Board signalée perdue/volée</p>}

        {notice && <p className="notice">{notice}</p>}
        {error && <p className="error">{error}</p>}

        {isUnclaimed && (
          <Card>
            <h2 className="h2">Ceci est votre Tiki ?</h2>
            <p className="muted" style={{ marginTop: 0 }}>
              Créez votre compte et réclamez cette board en une seule étape.
            </p>
            <form className="grid" onSubmit={registerAndClaim}>
              <div>
                <label className="label">Nom</label>
                <input className="input" name="name" required />
              </div>
              <div>
                <label className="label">Email</label>
                <input className="input" name="email" type="email" required />
              </div>
              <div>
                <label className="label">Mot de passe</label>
                <input className="input" name="password" type="password" minLength={8} required />
              </div>
              <button className="btn" disabled={claimLoading}>
                {claimLoading ? 'Création...' : 'Créer mon compte et réclamer cette board'}
              </button>
            </form>
            <p className="muted" style={{ marginTop: 10 }}>
              Déjà un compte ?{' '}
              <Link href="/login" style={{ textDecoration: 'underline' }}>
                Se connecter
              </Link>
            </p>
          </Card>
        )}
      </Card>

      {(board.isClaimed || isStolen) && (
        <Card>
          <h2 className="h2">{isStolen ? "J'ai trouvé cette planche" : 'Contacter le propriétaire'}</h2>
          <form className="grid" onSubmit={(e) => sendContact(e, isStolen ? 'report-found' : 'contact')}>
            <input type="text" name="website" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />
            <div>
              <label className="label">Prénom / nom</label>
              <input className="input" name="senderName" required />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" name="senderEmail" />
            </div>
            <div>
              <label className="label">Téléphone</label>
              <input className="input" name="senderPhone" />
            </div>
            <div>
              <label className="label">Lieu (optionnel)</label>
              <input className="input" name="locationText" />
            </div>
            <div>
              <label className="label">Message</label>
              <textarea className="textarea" name="message" required rows={5} />
            </div>
            <button className="btn" disabled={contactLoading}>
              {contactLoading ? 'Envoi...' : 'Envoyer'}
            </button>
          </form>
        </Card>
      )}
    </div>
  );
}
