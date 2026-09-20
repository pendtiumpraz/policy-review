import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { tenants } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireSuperadmin, jsonOk, jsonError } from '@/lib/server';

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireSuperadmin();
  if ('error' in auth) return auth.error;
  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);
  const [row] = await db
    .update(tenants)
    .set({
      name: body?.name,
      tokenQuota: body?.tokenQuota,
      brandPrimaryColor: body?.brandPrimaryColor,
      updatedAt: new Date(),
    })
    .where(eq(tenants.id, id))
    .returning();
  if (!row) return jsonError('Tidak ditemukan', 404);
  return jsonOk(row);
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireSuperadmin();
  if ('error' in auth) return auth.error;
  const { id } = await ctx.params;
  await db.update(tenants).set({ deletedAt: new Date() }).where(eq(tenants.id, id));
  return jsonOk({ ok: true });
}
