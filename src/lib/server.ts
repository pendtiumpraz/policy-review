import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { tenants } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export type SessionUser = {
  id: string;
  tenantId: string;
  role: string;
  email: string;
  name?: string | null;
};

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  return session.user as SessionUser;
}

export function jsonOk<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function jsonError(message: string, status = 400, errors?: unknown) {
  return NextResponse.json({ success: false, message, errors }, { status });
}

export async function requireUser() {
  const user = await getSessionUser();
  if (!user) return { error: jsonError('Unauthorized', 401) };
  return { user };
}

export async function requireSuperadmin() {
  const r = await requireUser();
  if ('error' in r) return r;
  if (r.user.role !== 'superadmin') return { error: jsonError('Forbidden', 403) };
  return { user: r.user };
}

export async function getTenant(tenantId: string) {
  const [tenant] = await db
    .select()
    .from(tenants)
    .where(eq(tenants.id, tenantId))
    .limit(1);
  return tenant;
}
