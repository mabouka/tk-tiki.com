'use client';

import { FormEvent, useEffect, useState } from 'react';
import { apiFetch } from '../../../../lib/api';
import { Card, StatusBadge } from '../../../../components/ui';
import { useRouter } from 'next/navigation';

export default function AccountBoardDetail({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [board, setBoard] = useState<any>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<{ board: any }>(`/api/account/boards/${params.id}`)
      .then((d) => setBoard(d.board))
      .catch(() => router.replace('/login'))
      .finally(() => setLoading(false));
  }, [params.id, router]);

  async function reportStolen() {
    if (!confirm('Confirmer la déclaration de vol ?')) return;
    try {
      await apiFetch(`/api/account/boards/${params.id}/report-stolen`, { method: 'POST', body: JSON.stringify({}) });
      setNotice('Board marquée perdue/volée.');
      setBoard((prev: any) => ({ ...prev, status: 'stolen' }));
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function clearStolen() {
    if (!confirm('Confirmer le retrait du statut perdue/volée ?')) return;
    try {
      await apiFetch(`/api/account/boards/${params.id}/clear-stolen`, { method: 'POST', body: JSON.stringify({}) });
      setNotice('Statut perdue/volée retiré.');
      setBoard((prev: any) => ({ ...prev, status: 'active' }));
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function transfer(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const newOwnerEmail = String(form.get('newOwnerEmail') || '');
    try {
      await apiFetch(`/api/account/boards/${params.id}/initiate-transfer`, {
        method: 'POST',
        body: JSON.stringify({ newOwnerEmail })
      });
      setNotice('Transfert initié.');
    } catch (err: any) {
      setError(err.message);
    }
  }

  if (loading) return <div className="card">Chargement...</div>;
  if (!board) return null;

  return (
    <div className="grid">
      <Card>
        <h1 className="h1">Board {board.publicId}</h1>
        {error && <p className="error">{error}</p>}
        {notice && <p className="notice">{notice}</p>}
        <p className="muted">
          Modèle: {board.boardVariant.boardModel.code} - {board.boardVariant.sizeCm} cm
          <br />
          Serial: {board.serialNumber}
        </p>
        <StatusBadge status={board.status} />
        <div style={{ marginTop: 12 }}>
          {board.status !== 'stolen' && (
            <button className="btn" onClick={reportStolen}>
              Déclarer perdue/volée
            </button>
          )}
          {board.status === 'stolen' && (
            <button className="btn outline" onClick={clearStolen}>
              Retirer le statut perdue/volée
            </button>
          )}
        </div>
      </Card>

      <Card>
        <h2 className="h2">Transférer la propriété</h2>
        <form onSubmit={transfer} className="grid">
          <div>
            <label className="label">Email du nouveau propriétaire</label>
            <input className="input" name="newOwnerEmail" type="email" required />
          </div>
          <button className="btn">Initier transfert</button>
        </form>
      </Card>

      <Card>
        <h2 className="h2">Messages reçus</h2>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Sender</th>
                <th>Message</th>
              </tr>
            </thead>
            <tbody>
              {board.contactMessages.map((m: any) => (
                <tr key={m.id}>
                  <td>{new Date(m.createdAt).toLocaleString()}</td>
                  <td>{m.senderName}</td>
                  <td>{m.message.slice(0, 110)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
