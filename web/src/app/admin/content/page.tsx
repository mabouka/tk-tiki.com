'use client';

import { FormEvent, useEffect, useState } from 'react';
import { AdminLayout } from '../../../components/admin-layout';
import { apiFetch } from '../../../lib/api';

export default function AdminContentPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [error, setError] = useState('');

  async function load() {
    try {
      const d = await apiFetch<{ data: any[] }>('/api/admin/site-content');
      setRows(d.data);
    } catch (e: any) {
      setError(e.message);
    }
  }

  useEffect(() => { load(); }, []);

  async function create(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      await apiFetch('/api/admin/site-content', {
        method: 'POST',
        body: JSON.stringify({ key: fd.get('key'), title: fd.get('title'), body: fd.get('body') })
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
          <h1 className="h1">Site content</h1>
          {error && <p className="error">{error}</p>}
          <form className="grid" onSubmit={create}>
            <input className="input" name="key" placeholder="key" required />
            <input className="input" name="title" placeholder="title" required />
            <textarea className="textarea" rows={4} name="body" placeholder="body" required />
            <button className="btn">Créer contenu</button>
          </form>
        </section>
        <section className="card table-wrap">
          <table className="table">
            <thead><tr><th>key</th><th>title</th><th>updated</th></tr></thead>
            <tbody>
              {rows.map((r) => <tr key={r.id}><td>{r.key}</td><td>{r.title}</td><td>{new Date(r.updatedAt).toLocaleString()}</td></tr>)}
            </tbody>
          </table>
        </section>
      </div>
    </AdminLayout>
  );
}
