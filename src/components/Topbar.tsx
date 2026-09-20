'use client';

import { signOut } from 'next-auth/react';

export function Topbar({ userName }: { userName?: string | null }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 12, marginBottom: 20 }}>
      {userName && <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>{userName}</span>}
      <button className="btn btn-secondary btn-sm" onClick={() => signOut({ callbackUrl: '/login' })}>
        Keluar
      </button>
    </div>
  );
}
