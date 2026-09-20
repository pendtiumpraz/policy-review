import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { aiModels } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireSuperadmin, jsonOk, jsonError } from '@/lib/server';

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireSuperadmin();
  if ('error' in auth) return auth.error;
  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);
  const [row] = await db
    .update(aiModels)
    .set({
      name: body?.name,
      modelId: body?.modelId,
      description: body?.description,
      enabled: body?.enabled,
      updatedAt: new Date(),
    })
    .where(eq(aiModels.id, id))
    .returning();
  if (!row) return jsonError('Tidak ditemukan', 404);
  return jsonOk(row);
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireSuperadmin();
  if ('error' in auth) return auth.error;
  const { id } = await ctx.params;
  await db.update(aiModels).set({ deletedAt: new Date() }).where(eq(aiModels.id, id));
  return jsonOk({ ok: true });
}
