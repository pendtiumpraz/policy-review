'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const MENU = [
  { href: '/dashboard', label: 'Dashboard', color: '#10b981', icon: 'M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 0h7v7h-7v-7z' },
  { href: '/regulations', label: 'Regulasi', color: '#f59e0b', icon: 'M6 2h9a1 1 0 011 1v18a1 1 0 01-1 1H6a1 1 0 01-1-1V3a1 1 0 011-1zm2 4h5M8 10h7M8 14h7M8 18h5' },
  { href: '/reviews', label: 'Review', color: '#3b82f6', icon: 'M9 11l3 3 8-8M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11' },
  { href: '/ai', label: 'AI & Keys', color: '#8b5cf6', icon: 'M12 2a4 4 0 014 4l1 1 3-1-1 3 1 1a4 4 0 01-4 4l-1-1-3 1 1-3-1-1a4 4 0 014-4 4 4 0 00-4-4zM5 19l3-2 2 3 2-3 3 2-2-4 4-2-4-2 2-4-3 2-2-3-2 3-3-2 2 4-4 2 4 2z' },
  { href: '/team', label: 'Anggota', color: '#ef4444', icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75' },
  { href: '/settings', label: 'Pengaturan', color: '#64748b', icon: 'M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z' },
];

export function Sidebar({ orgName, userEmail }: { orgName: string; userEmail: string }) {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-mark">PR</div>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{orgName}</div>
          <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 400 }}>Policy Review</div>
        </div>
      </div>
      <nav>
        {MENU.map((m) => {
          const active = pathname === m.href || pathname.startsWith(m.href + '/');
          return (
            <Link key={m.href} href={m.href} className={`menu-item ${active ? 'active' : ''}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={m.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={m.icon} />
              </svg>
              <span>{m.label}</span>
            </Link>
          );
        })}
      </nav>
      <div style={{ padding: 14, borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: 12, color: '#94a3b8' }}>
        {userEmail}
      </div>
    </aside>
  );
}
