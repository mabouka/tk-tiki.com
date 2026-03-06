import { ReactNode } from 'react';

export function Card({ children }: { children: ReactNode }) {
  return <section className="card">{children}</section>;
}

export function StatusBadge({ status }: { status: string }) {
  const cls = status === 'stolen' ? 'badge danger' : status === 'unclaimed' ? 'badge warn' : 'badge';
  const label =
    status === 'stolen'
      ? 'board perdue/volée'
      : status === 'unclaimed'
        ? 'non réclamée'
        : status === 'active'
          ? 'active'
          : status;
  return <span className={cls}>{label}</span>;
}
