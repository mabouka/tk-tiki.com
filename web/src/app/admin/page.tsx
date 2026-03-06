'use client';

import { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/admin-layout';
import { apiFetch } from '../../lib/api';

export default function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch('/api/admin/dashboard')
      .then(setDashboard)
      .catch((e) => setError(e.message));
  }, []);

  return (
    <AdminLayout>
      <div className="grid">
        <section className="card">
          <h1 className="h1">Admin dashboard</h1>
          {error && <p className="error">{error}</p>}
          {dashboard && (
            <div className="table-wrap">
              <table className="table">
                <tbody>
                  <tr><th>Total boards</th><td>{dashboard.counters.total}</td></tr>
                  <tr><th>Unclaimed</th><td>{dashboard.counters.unclaimed}</td></tr>
                  <tr><th>Active</th><td>{dashboard.counters.active}</td></tr>
                  <tr><th>Stolen</th><td>{dashboard.counters.stolen}</td></tr>
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </AdminLayout>
  );
}
