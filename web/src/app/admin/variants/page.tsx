'use client';

import { FormEvent, useEffect, useState } from 'react';
import { AdminLayout } from '../../../components/admin-layout';
import { apiFetch } from '../../../lib/api';

export default function AdminVariantsPage() {
  const [variants, setVariants] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [error, setError] = useState('');

  async function load() {
    try {
      const [v, m] = await Promise.all([
        apiFetch<{ data: any[] }>('/api/admin/variants'),
        apiFetch<{ data: any[] }>('/api/admin/models')
      ]);
      setVariants(v.data);
      setModels(m.data);
    } catch (e: any) {
      setError(e.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function create(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      await apiFetch('/api/admin/variants', {
        method: 'POST',
        body: JSON.stringify({
          boardModelId: fd.get('boardModelId'),
          sizeCm: Number(fd.get('sizeCm')),
          widthCm: Number(fd.get('widthCm')),
          notes: fd.get('notes')
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
          <h1 className="h1">Variants</h1>
          {error && <p className="error">{error}</p>}
          <form onSubmit={create} className="grid">
            <select className="select" name="boardModelId" required>
              <option value="">Model</option>
              {models.map((m) => <option key={m.id} value={m.id}>{m.code}</option>)}
            </select>
            <input className="input" name="sizeCm" type="number" placeholder="Size cm" required />
            <input className="input" name="widthCm" type="number" step="0.1" placeholder="Width cm" />
            <input className="input" name="notes" placeholder="Notes" />
            <button className="btn">Create variant</button>
          </form>
        </section>
        <section className="card table-wrap">
          <table className="table">
            <thead><tr><th>Model</th><th>Size</th><th>Width</th></tr></thead>
            <tbody>
              {variants.map((v) => <tr key={v.id}><td>{v.boardModel.code}</td><td>{v.sizeCm}</td><td>{v.widthCm ?? '-'}</td></tr>)}
            </tbody>
          </table>
        </section>
      </div>
    </AdminLayout>
  );
}
