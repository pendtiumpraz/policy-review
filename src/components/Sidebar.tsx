'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { DashboardIcon, RegulationIcon, ReviewIcon, AiIcon, TeamIcon, SettingsIcon, Logo, LogOutIcon } from '@/components/icons';

const MENU = [
  { href: '/dashboard', label: 'Dashboard', Icon: DashboardIcon },
  { href: '/regulations', label: 'Regulasi', Icon: RegulationIcon },
  { href: '/reviews', label: 'Review', Icon: ReviewIcon },
  { href: '/ai', label: 'AI & Keys', Icon: AiIcon },
  { href: '/team', label: 'Anggota', Icon: TeamIcon },
  { href: '/settings', label: 'Pengaturan', Icon: SettingsIcon },
];

function initials(email: string): string {
  const parts = (email.split('@')[0] || '').split(/[._\-]+/).filter(Boolean);
  const letters = parts.map((p) => p[0].toUpperCase()).join('').slice(0, 2);
  return letters || 'U';
}

export function Sidebar({ orgName, userEmail }: { orgName: string; userEmail: string }) {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <Logo size={30} />
        <div className="brand-text">
          <div className="brand-name">{orgName}</div>
          <div className="brand-caption">Policy Review</div>
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
      <div className="side-foot">
        <div className="avatar">{initials(userEmail)}</div>
        <div className="who">
          <b>{userEmail.split('@')[0]}</b>
          <small>{userEmail}</small>
        </div>
        <button className="btn btn-ghost btn-icon" title="Keluar" onClick={() => signOut({ callbackUrl: '/login' })}>
          <LogOutIcon />
        </button>
      </div>
    </aside>
  );
}