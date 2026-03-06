'use client';

import { FormEvent, useEffect, useState } from 'react';
import { AdminLayout } from '../../../components/admin-layout';
import { apiFetch } from '../../../lib/api';

export default function AdminModelsPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [error, setError] = useState('');

  async function load() {
    try {
      const d = await apiFetch<{ data: any[] }>('/api/admin/models');
      setRows(d.data);
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
      await apiFetch('/api/admin/models', {
        method: 'POST',
        body: JSON.stringify({
          code: fd.get('code'),
          name: fd.get('name'),
          description: fd.get('description'),
          isActive: true
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
          <h1 className="h1">Models</h1>
          {error && <p className="error">{error}</p>}
          <form className="grid" onSubmit={create}>
            <input className="input" name="code" placeholder="Code TK01" required />
            <input className="input" name="name" placeholder="Name" required />
            <input className="input" name="description" placeholder="Description" />
            <button className="btn">Create model</button>
          </form>
        </section>
        <section className="card table-wrap">
          <table className="table">
            <thead>
              <tr><th>Code</th><th>Name</th><th>Active</th></tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}><td>{r.code}</td><td>{r.name}</td><td>{String(r.isActive)}</td></tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </AdminLayout>
  );
}
