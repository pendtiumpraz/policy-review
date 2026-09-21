import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { tenants, users } from '@/lib/db/schema';
import { and, asc, eq, ne } from 'drizzle-orm';
import { requireSuperadmin, jsonOk, jsonError } from '@/lib/server';

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireSuperadmin();
  if ('error' in auth) return auth.error;
  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);

  const updates: Partial<typeof tenants.$inferInsert> = {};
  if (typeof body?.name === 'string' && body.name.trim()) updates.name = body.name.trim();
  if (typeof body?.slug === 'string' && body.slug.trim()) updates.slug = body.slug.trim();
  if (typeof body?.tokenQuota === 'number' && Number.isFinite(body.tokenQuota)) updates.tokenQuota = Math.max(0, Math.floor(body.tokenQuota));
  if (typeof body?.brandPrimaryColor === 'string' && body.brandPrimaryColor.trim()) updates.brandPrimaryColor = body.brandPrimaryColor.trim();
  const newEmail =
    typeof body?.adminEmail === 'string' && body.adminEmail.trim() ? body.adminEmail.trim().toLowerCase() : null;

  const [admin] = await db
    .select({ id: users.id, email: users.email })
    .from(users)
    .where(and(eq(users.tenantId, id), eq(users.role, 'admin')))
    .orderBy(asc(users.createdAt))
    .limit(1);

  if (newEmail && admin && newEmail !== admin.email) {
    const [dup] = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.email, newEmail), ne(users.id, admin.id)))
      .limit(1);
    if (dup) return jsonError('Email sudah dipakai akun lain', 409);
    await db
      .update(users)
      .set({ email: newEmail, updatedAt: new Date() })
      .where(and(eq(users.tenantId, id), eq(users.role, 'admin'), eq(users.id, admin.id)));
  }

  const [row] = await db
    .update(tenants)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(tenants.id, id))
    .returning();
  if (!row) return jsonError('Tidak ditemukan', 404);
  return jsonOk({ ...row, admin_email: newEmail && admin ? newEmail : (admin?.email ?? null) });
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireSuperadmin();
  if ('error' in auth) return auth.error;
  const { id } = await ctx.params;
  await db.update(tenants).set({ deletedAt: new Date() }).where(eq(tenants.id, id));
  return jsonOk({ ok: true });
}
