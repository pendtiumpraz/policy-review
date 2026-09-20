import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { tenantAiKeys, aiProviders } from '@/lib/db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { requireUser, jsonOk, jsonError } from '@/lib/server';
import { encryptSecret } from '@/lib/crypto';
import { z } from 'zod';

export async function GET() {
  const r = await requireUser();
  if ('error' in r) return r.error;
  const rows = await db
    .select({
      id: tenantAiKeys.id,
      providerId: tenantAiKeys.providerId,
      providerCode: aiProviders.code,
      providerName: aiProviders.name,
      baseUrl: tenantAiKeys.baseUrl,
      enabled: tenantAiKeys.enabled,
      createdAt: tenantAiKeys.createdAt,
    })
    .from(tenantAiKeys)
    .leftJoin(aiProviders, eq(tenantAiKeys.providerId, aiProviders.id))
    .where(and(eq(tenantAiKeys.tenantId, r.user.tenantId), isNull(tenantAiKeys.deletedAt)));
  return jsonOk(rows);
}

const schema = z.object({
  providerId: z.string().min(1),
  apiKey: z.string().min(1),
  baseUrl: z.string().optional().or(z.literal('')),
});

export async function POST(req: NextRequest) {
  const r = await requireUser();
  if ('error' in r) return r.error;
  const body = await req.json().catch(() => null);
  const p = schema.safeParse(body);
  if (!p.success) return jsonError('Data tidak valid', 422, p.error.flatten().fieldErrors);

  const cipher = encryptSecret(p.data.apiKey);

  // Upsert by tenant + provider.
  const existing = await db
    .select()
    .from(tenantAiKeys)
    .where(and(eq(tenantAiKeys.tenantId, r.user.tenantId), eq(tenantAiKeys.providerId, p.data.providerId), isNull(tenantAiKeys.deletedAt)))
    .limit(1);

  if (existing[0]) {
    const [row] = await db
      .update(tenantAiKeys)
      .set({ apiKeyCipher: cipher, baseUrl: p.data.baseUrl || null, enabled: true, updatedAt: new Date() })
      .where(eq(tenantAiKeys.id, existing[0].id))
      .returning();
    return jsonOk({ id: row.id, providerId: row.providerId });
  }

  const [row] = await db
    .insert(tenantAiKeys)
    .values({ tenantId: r.user.tenantId, providerId: p.data.providerId, apiKeyCipher: cipher, baseUrl: p.data.baseUrl || null })
    .returning();
  return jsonOk({ id: row.id, providerId: row.providerId }, 201);
}
