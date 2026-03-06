'use client';

import { useEffect, useState } from 'react';
import { AdminLayout } from '../../../components/admin-layout';
import { apiFetch } from '../../../lib/api';

export default function AdminMessagesPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch<{ data: any[] }>('/api/admin/messages')
      .then((d) => setRows(d.data))
      .catch((e) => setError(e.message));
  }, []);

  return (
    <AdminLayout>
      <section className="card table-wrap">
        <h1 className="h1">Messages</h1>
        {error && <p className="error">{error}</p>}
        <table className="table">
          <thead><tr><th>Date</th><th>Board</th><th>Sender</th><th>Status</th><th>Message</th></tr></thead>
          <tbody>
            {rows.map((m) => (
              <tr key={m.id}>
                <td>{new Date(m.createdAt).toLocaleString()}</td>
                <td>{m.board.publicId}</td>
                <td>{m.senderName}</td>
                <td>{m.status}</td>
                <td>{m.message.slice(0, 110)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </AdminLayout>
  );
}
