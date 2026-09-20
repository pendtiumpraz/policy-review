import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { requireUser, jsonOk, jsonError } from '@/lib/server';

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const r = await requireUser();
  if ('error' in r) return r.error;
  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);
  const [row] = await db
    .update(users)
    .set({ name: body?.name, role: body?.role, updatedAt: new Date() })
    .where(and(eq(users.id, id), eq(users.tenantId, r.user.tenantId)))
    .returning();
  if (!row) return jsonError('Tidak ditemukan', 404);
  return jsonOk({ id: row.id, name: row.name, email: row.email, role: row.role });
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const r = await requireUser();
  if ('error' in r) return r.error;
  const { id } = await ctx.params;
  await db
    .update(users)
    .set({ deletedAt: new Date() })
    .where(and(eq(users.id, id), eq(users.tenantId, r.user.tenantId)));
  return jsonOk({ ok: true });
}
