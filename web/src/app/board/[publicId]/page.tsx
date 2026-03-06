'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { apiFetch } from '../../../lib/api';
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

  useEffect(() => {
    apiFetch<BoardPayload>(`/api/boards/${params.publicId}/public`)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [params.publicId]);

  async function claimBoard() {
    setNotice('');
    setError('');
    try {
      await apiFetch(`/api/boards/${params.publicId}/claim`, { method: 'POST', body: JSON.stringify({}) });
      setNotice('Board ajoutée à votre compte.');
      setData((prev) => (prev ? { ...prev, board: { ...prev.board, status: 'active', isClaimed: true } } : prev));
    } catch (e: any) {
      setError(e.message);
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
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link className="btn outline" href="/login">
              Se connecter
            </Link>
            <Link className="btn outline" href="/register">
              Créer un compte
            </Link>
            <button className="btn" onClick={claimBoard}>
              Ajouter cette planche à mon compte
            </button>
          </div>
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
