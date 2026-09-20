'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DashboardIcon, RegulationIcon, ReviewIcon, AiIcon, TeamIcon, SettingsIcon, Logo } from '@/components/icons';

const MENU = [
  { href: '/dashboard', label: 'Dashboard', Icon: DashboardIcon },
  { href: '/regulations', label: 'Regulasi', Icon: RegulationIcon },
  { href: '/reviews', label: 'Review', Icon: ReviewIcon },
  { href: '/ai', label: 'AI & Keys', Icon: AiIcon },
  { href: '/team', label: 'Anggota', Icon: TeamIcon },
  { href: '/settings', label: 'Pengaturan', Icon: SettingsIcon },
];

export function Sidebar({ orgName, userEmail }: { orgName: string; userEmail: string }) {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <Logo size={30} />
        <div style={{ overflow: 'hidden' }}>
          <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{orgName}</div>
          <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 400 }}>Policy Review</div>
        </div>
      </div>
      <nav>
        {MENU.map(({ href, label, Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link key={href} href={href} className={`menu-item ${active ? 'active' : ''}`}>
              <Icon />
              <span>{label}</span>
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
