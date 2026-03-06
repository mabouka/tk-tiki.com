'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiFetch } from '../../../lib/api';
import { Card, StatusBadge } from '../../../components/ui';
import { useRouter } from 'next/navigation';

export default function AccountBoardsPage() {
  const router = useRouter();
  const [boards, setBoards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<{ boards: any[] }>('/api/account/boards')
      .then((data) => setBoards(data.boards))
      .catch(() => router.replace('/login'))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return <Card>Chargement...</Card>;
  }

  return (
    <Card>
      <h1 className="h1">Mes planches</h1>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Public ID</th>
              <th>Model</th>
              <th>Taille</th>
              <th>Serial</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {boards.map((b) => (
              <tr key={b.id}>
                <td>{b.publicId}</td>
                <td>{b.boardVariant.boardModel.code}</td>
                <td>{b.boardVariant.sizeCm} cm</td>
                <td>{b.serialNumber}</td>
                <td>
                  <StatusBadge status={b.status} />
                </td>
                <td>
                  <Link href={`/account/boards/${b.id}`}>Voir</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
