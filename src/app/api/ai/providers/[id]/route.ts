import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { aiProviders, aiModels } from '@/lib/db/schema';
import { eq, ne } from 'drizzle-orm';
import { requireSuperadmin, jsonOk, jsonError } from '@/lib/server';
import { providerHasKey, platformTenantId } from '@/modules/ai/service';

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireSuperadmin();
  if ('error' in auth) return auth.error;
  const body = await req.json().catch(() => null);
  const { id } = await ctx.params;

  // Activation requires an API key stored in the DB.
  if (body?.enabled === true) {
    const pid = await platformTenantId();
    if (!pid || !(await providerHasKey(id, pid))) {
      return jsonError('Tambahkan API key platform untuk provider ini terlebih dahulu.', 400);
    }
    // Singular active provider: deactivate all others.
    await db.update(aiProviders).set({ enabled: false }).where(ne(aiProviders.id, id));
    // Deactivate models of inactive providers.
    await db.update(aiModels).set({ enabled: false }).where(ne(aiModels.providerId, id));
  }

  const [row] = await db
    .update(aiProviders)
    .set({
      name: body?.name,
      baseUrl: body?.baseUrl,
      enabled: body?.enabled,
      updatedAt: new Date(),
    })
    .where(eq(aiProviders.id, id))
    .returning();
  if (!row) return jsonError('Tidak ditemukan', 404);
  return jsonOk(row);
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireSuperadmin();
  if ('error' in auth) return auth.error;
  const { id } = await ctx.params;
  await db.update(aiProviders).set({ deletedAt: new Date() }).where(eq(aiProviders.id, id));
  return jsonOk({ ok: true });
}
