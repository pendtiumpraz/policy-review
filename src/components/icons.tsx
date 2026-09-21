'use client';

import type { SVGProps } from 'react';

/**
 * Monochrome inline SVG icon set — single color via `currentColor` (Rule #6
 * Sainskerta: 1-warna solid, bukan gradient, bukan emoji). Color inherited
 * from the surrounding text, so it stays neutral by default and follows the
 * active state without hardcoding per-menu rainbows.
 */
type P = SVGProps<SVGSVGElement>;

function S({ children, ...p }: P & { children: React.ReactNode }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      {children}
    </svg>
  );
}

export const DashboardIcon = (p: P) => <S {...p}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></S>;
export const RegulationIcon = (p: P) => <S {...p}><path d="M6 2h9l5 5v15H6z" /><path d="M15 2v5h5" /><path d="M9 12h6M9 16h6" /></S>;
export const ReviewIcon = (p: P) => <S {...p}><path d="M9 11l3 3 8-8" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" /></S>;
export const AiIcon = (p: P) => <S {...p}><path d="M12 3l1.8 4.7L18 9l-4.2 1.3L12 15l-1.8-4.7L6 9l4.2-1.3z" /><path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9z" /></S>;
export const TeamIcon = (p: P) => <S {...p}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></S>;
export const SettingsIcon = (p: P) => <S {...p}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z" /></S>;

export const ShieldIcon = (p: P) => <S {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></S>;
export const PlugIcon = (p: P) => <S {...p}><path d="M9 2v6M15 2v6M6 8h12v2a6 6 0 01-12 0V8z" /><path d="M12 16v6" /></S>;
export const ChartIcon = (p: P) => <S {...p}><path d="M3 3v18h18" /><path d="M7 15l4-4 3 3 5-6" /></S>;
export const BookIcon = (p: P) => <S {...p}><path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" /></S>;
export const EditIcon = (p: P) => <S {...p}><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4z" /></S>;
export const PaletteIcon = (p: P) => <S {...p}><circle cx="13.5" cy="6.5" r=".5" /><circle cx="17.5" cy="10.5" r=".5" /><circle cx="8.5" cy="7.5" r=".5" /><circle cx="6.5" cy="12.5" r=".5" /><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.9 0 1.2-.7 1.2-1.4 0-.4-.1-.8-.4-1.1s-.4-.7-.4-1.1c0-.9.7-1.4 1.8-1.4H16c2.8 0 5-2.2 5-5C21 6.5 17 2 12 2z" /></S>;
export const BoltIcon = (p: P) => <S {...p}><path d="M13 2L3 14h7l-1 8 10-12h-7z" /></S>;
export const LockIcon = (p: P) => <S {...p}><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 018 0v4" /></S>;
export const TargetIcon = (p: P) => <S {...p}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></S>;
export const DocIcon = (p: P) => <S {...p}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6" /></S>;

export const TrashIcon = (p: P) => <S {...p}><path d="M3 6h18" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" /><path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" /><path d="M10 11v6M14 11v6" /></S>;
export const RestoreIcon = (p: P) => <S {...p}><path d="M3 12a9 9 0 109-9 9.75 9.75 0 00-6.74 2.74L3 8" /><path d="M3 3v5h5" /></S>;
export const EyeIcon = (p: P) => <S {...p}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></S>;
export const KeyIcon = (p: P) => <S {...p}><circle cx="7.5" cy="15.5" r="4.5" /><path d="M21 2l-9.6 9.6" /><path d="M15.5 7.5l3 3L22 7l-3-3" /></S>;
export const PowerIcon = (p: P) => <S {...p}><path d="M12 2v10" /><path d="M18.4 6.6a9 9 0 11-12.8 0" /></S>;
export const PlusIcon = (p: P) => <S {...p}><path d="M12 5v14M5 12h14" /></S>;

export const LogOutIcon = (p: P) => <S {...p}><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" /></S>;

/** PolicyReview brand logo — shield + check (compliance). Follows `--primary` (whitelabel). */
export function Logo({ size = 30, tone = 'brand' }: { size?: number; tone?: 'brand' | 'light' | 'mono' }) {
  const fill = tone === 'light' ? 'rgba(255,255,255,0.96)' : tone === 'mono' ? 'currentColor' : 'var(--primary, #0f9d58)';
  const check = tone === 'light' ? '#0f9d58' : '#fff';
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
      <path
        d="M16 1.8c.9 0 1.8.4 2.5 1.1l1.9 1.9c.3.3.7.5 1.1.5l2.7.1c.9 0 1.8.5 2.2 1.3.4.8.4 1.8 0 2.6l-1.1 2.5c-.1.3-.1.7 0 1l1.1 2.5c.4.8.4 1.8 0 2.6-.4.8-1.3 1.3-2.2 1.3l-2.7.1c-.4 0-.8.2-1.1.5l-1.9 1.9c-.7.7-1.6 1.1-2.5 1.1s-1.8-.4-2.5-1.1l-1.9-1.9c-.3-.3-.7-.5-1.1-.5l-2.7-.1c-.9 0-1.8-.5-2.2-1.3-.4-.8-.4-1.8 0-2.6l1.1-2.5c.1-.3.1-.7 0-1L4.5 6.4c-.4-.8-.4-1.8 0-2.6C4.9 3 5.8 2.5 6.7 2.5l2.7-.1c.4 0 .8-.2 1.1-.5L12.4.7C13.1.2 14.1.3 16 1.8z"
        fill={fill}
      />
      <path d="M11.6 16.2l2.9 2.9 6-6.2" stroke={check} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
