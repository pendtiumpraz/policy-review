'use client';

export function Topbar({ userName }: { userName?: string | null }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 12, marginBottom: 20 }}>
      {userName && <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>{userName}</span>}
    </div>
  );
}