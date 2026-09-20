import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { aiModels, aiProviders } from '@/lib/db/schema';
import { eq, ne } from 'drizzle-orm';
import { requireSuperadmin, jsonOk, jsonError } from '@/lib/server';
import { providerHasKey, platformTenantId } from '@/modules/ai/service';

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireSuperadmin();
  if ('error' in auth) return auth.error;
  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);

  if (body?.enabled === true) {
    const [model] = await db.select().from(aiModels).where(eq(aiModels.id, id)).limit(1);
    if (!model) return jsonError('Tidak ditemukan', 404);

    const [prov] = await db.select().from(aiProviders).where(eq(aiProviders.id, model.providerId)).limit(1);
    if (!prov || !prov.enabled) {
      return jsonError('Aktifkan provider model ini terlebih dahulu.', 400);
    }
    const pid = await platformTenantId();
    if (!pid || !(await providerHasKey(model.providerId, pid))) {
      return jsonError('Provider belum memiliki API key platform.', 400);
    }
    // Singular active model: deactivate all others.
    await db.update(aiModels).set({ enabled: false }).where(ne(aiModels.id, id));
  }

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
