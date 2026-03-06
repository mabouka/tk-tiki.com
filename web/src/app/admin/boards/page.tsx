'use client';

import { FormEvent, useEffect, useState } from 'react';
import { AdminLayout } from '../../../components/admin-layout';
import { apiFetch } from '../../../lib/api';

export default function AdminBoardsPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [variants, setVariants] = useState<any[]>([]);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  async function load() {
    try {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (status) params.set('status', status);
      const [boards, varData] = await Promise.all([
        apiFetch<{ data: any[] }>(`/api/admin/boards?${params.toString()}`),
        apiFetch<{ data: any[] }>('/api/admin/variants')
      ]);
      setRows(boards.data);
      setVariants(varData.data);
    } catch (e: any) {
      setError(e.message);
    }
  }

  useEffect(() => { load(); }, []);

  async function create(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      await apiFetch('/api/admin/boards', {
        method: 'POST',
        body: JSON.stringify({
          publicId: fd.get('publicId'),
          serialNumber: fd.get('serialNumber'),
          boardVariantId: fd.get('boardVariantId'),
          status: fd.get('status'),
          isPublic: true
        })
      });
      e.currentTarget.reset();
      load();
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <AdminLayout>
      <div className="grid">
        <section className="card">
          <h1 className="h1">Boards</h1>
          {error && <p className="error">{error}</p>}
          <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            <input className="input" style={{ maxWidth: 220 }} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" />
            <select className="select" style={{ maxWidth: 160 }} value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">Status</option>
              <option value="unclaimed">unclaimed</option>
              <option value="active">active</option>
              <option value="stolen">stolen</option>
              <option value="transferred">transferred</option>
            </select>
            <button className="btn outline" onClick={load}>Filtrer</button>
          </div>
          <form className="grid" onSubmit={create}>
            <input className="input" name="publicId" placeholder="publicId" required />
            <input className="input" name="serialNumber" placeholder="serialNumber" required />
            <select className="select" name="boardVariantId" required>
              <option value="">Variant</option>
              {variants.map((v) => <option key={v.id} value={v.id}>{v.boardModel.code} {v.sizeCm}cm</option>)}
            </select>
            <select className="select" name="status" defaultValue="unclaimed">
              <option value="unclaimed">unclaimed</option>
              <option value="active">active</option>
              <option value="stolen">stolen</option>
              <option value="transferred">transferred</option>
            </select>
            <button className="btn">Créer board</button>
          </form>
        </section>
        <section className="card table-wrap">
          <table className="table">
            <thead><tr><th>publicId</th><th>serial</th><th>model</th><th>size</th><th>status</th><th>owner</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.publicId}</td>
                  <td>{r.serialNumber}</td>
                  <td>{r.boardVariant.boardModel.code}</td>
                  <td>{r.boardVariant.sizeCm}</td>
                  <td>{r.status}</td>
                  <td>{r.ownerUser?.email ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </AdminLayout>
  );
}
