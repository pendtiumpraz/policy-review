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
  const primary = tenant?.brandPrimaryColor || '#10b981';

  return (
    <div className="app-layout" style={{ ['--primary' as string]: primary, ['--primary-dark' as string]: primary } as React.CSSProperties}>
      <Sidebar orgName={tenant?.name || 'Organisasi'} userEmail={session.user.email || ''} />
      <main className="app-main">
        <Topbar userName={session.user.name} />
        {children}
      </main>
    </div>
  );
}
