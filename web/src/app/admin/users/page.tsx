'use client';

import { useEffect, useState } from 'react';
import { AdminLayout } from '../../../components/admin-layout';
import { apiFetch } from '../../../lib/api';

export default function AdminUsersPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch<{ data: any[] }>('/api/admin/users')
      .then((d) => setRows(d.data))
      .catch((e) => setError(e.message));
  }, []);

  return (
    <AdminLayout>
      <section className="card table-wrap">
        <h1 className="h1">Users</h1>
        {error && <p className="error">{error}</p>}
        <table className="table">
          <thead><tr><th>Email</th><th>Name</th><th>Role</th><th>Created</th></tr></thead>
          <tbody>
            {rows.map((u) => <tr key={u.id}><td>{u.email}</td><td>{u.name ?? '-'}</td><td>{u.role}</td><td>{new Date(u.createdAt).toLocaleDateString()}</td></tr>)}
          </tbody>
        </table>
      </section>
    </AdminLayout>
  );
}
