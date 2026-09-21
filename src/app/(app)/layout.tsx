import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getTenant } from '@/lib/server';
import { Sidebar } from '@/components/Sidebar';
import { Topbar } from '@/components/Topbar';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');
  const user = session.user as { tenantId: string; role: string };

  if (user.role === 'superadmin') redirect('/admin');

  const tenant = await getTenant(user.tenantId);
  const primary = tenant?.brandPrimaryColor || '#059669';

  const style = {
    '--primary': primary,
    '--primary-dark': primary,
    '--signal': primary,
    '--signal-strong': primary,
    '--tint-signal': `color-mix(in srgb, ${primary} 10%, transparent)`,
  } as React.CSSProperties;

  return (
    <div className="app-layout" style={style}>
      <Sidebar orgName={tenant?.name || 'Organisasi'} userEmail={session.user.email || ''} />
      <main className="app-main">
        <Topbar userName={session.user.name} />
        {children}
      </main>
    </div>
  );
}