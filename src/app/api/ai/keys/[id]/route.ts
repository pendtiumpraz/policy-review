import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { tenantAiKeys } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { requireUser, jsonOk, jsonError } from '@/lib/server';
import { encryptSecret } from '@/lib/crypto';

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const r = await requireUser();
  if ('error' in r) return r.error;
  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);

  const [existing] = await db
    .select()
    .from(tenantAiKeys)
    .where(and(eq(tenantAiKeys.id, id), eq(tenantAiKeys.tenantId, r.user.tenantId)))
    .limit(1);
  if (!existing) return jsonError('Tidak ditemukan', 404);

  const patch: Record<string, unknown> = { updatedAt: new Date() };
  if (typeof body?.enabled === 'boolean') patch.enabled = body.enabled;
  if (typeof body?.apiKey === 'string' && body.apiKey) patch.apiKeyCipher = encryptSecret(body.apiKey);
  if (body?.baseUrl !== undefined) patch.baseUrl = body.baseUrl || null;

  const [row] = await db.update(tenantAiKeys).set(patch).where(eq(tenantAiKeys.id, id)).returning();
  return jsonOk({ id: row.id, enabled: row.enabled });
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const r = await requireUser();
  if ('error' in r) return r.error;
  const { id } = await ctx.params;
  await db
    .update(tenantAiKeys)
    .set({ deletedAt: new Date() })
    .where(and(eq(tenantAiKeys.id, id), eq(tenantAiKeys.tenantId, r.user.tenantId)));
  return jsonOk({ ok: true });
}
