import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { aiModels, aiProviders } from '@/lib/db/schema';
import { eq, isNull } from 'drizzle-orm';
import { requireSuperadmin, requireUser, jsonOk, jsonError } from '@/lib/server';
import { z } from 'zod';

export async function GET() {
  await requireUser();
  const models = await db
    .select({
      id: aiModels.id,
      providerId: aiModels.providerId,
      providerCode: aiProviders.code,
      providerName: aiProviders.name,
      name: aiModels.name,
      modelId: aiModels.modelId,
      description: aiModels.description,
      enabled: aiModels.enabled,
    })
    .from(aiModels)
    .leftJoin(aiProviders, eq(aiModels.providerId, aiProviders.id))
    .where(isNull(aiModels.deletedAt));
  return jsonOk(models);
}

const createSchema = z.object({
  providerId: z.string(),
  name: z.string().min(1),
  modelId: z.string().min(1),
  description: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const auth = await requireSuperadmin();
  if ('error' in auth) return auth.error;
  const body = await req.json().catch(() => null);
  const p = createSchema.safeParse(body);
  if (!p.success) return jsonError('Data tidak valid', 422, p.error.flatten().fieldErrors);
  const [row] = await db
    .insert(aiModels)
    .values({
      providerId: p.data.providerId,
      name: p.data.name,
      modelId: p.data.modelId,
      description: p.data.description || null,
    })
    .returning();
  return jsonOk(row, 201);
}
