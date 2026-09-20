import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { aiModels, aiProviders } from '@/lib/db/schema';
import { eq, isNull } from 'drizzle-orm';
import { requireSuperadmin, requireUser, jsonOk, jsonError } from '@/lib/server';
import { z } from 'zod';

export async function GET(req: NextRequest) {
  await requireUser();
  const trashed = req.nextUrl.searchParams.get('trashed') === '1';
  const rows = await db
    .select({
      id: aiModels.id,
      providerId: aiModels.providerId,
      providerCode: aiProviders.code,
      providerName: aiProviders.name,
      name: aiModels.name,
      modelId: aiModels.modelId,
      description: aiModels.description,
      enabled: aiModels.enabled,
      deletedAt: aiModels.deletedAt,
    })
    .from(aiModels)
    .leftJoin(aiProviders, eq(aiModels.providerId, aiProviders.id));
  const data = rows.filter((x) => (trashed ? x.deletedAt !== null : x.deletedAt === null));
  return jsonOk(data);
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
