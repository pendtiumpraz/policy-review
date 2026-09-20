import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { aiProviders, aiModels } from '@/lib/db/schema';
import { eq, isNull, and } from 'drizzle-orm';
import { requireSuperadmin, requireUser, jsonOk, jsonError } from '@/lib/server';
import { z } from 'zod';

export async function GET() {
  await requireUser();
  const providers = await db.select().from(aiProviders).where(isNull(aiProviders.deletedAt));
  return jsonOk(providers);
}

const createSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  baseUrl: z.string().url().optional().or(z.literal('')),
  enabled: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  const auth = await requireSuperadmin();
  if ('error' in auth) return auth.error;
  const body = await req.json().catch(() => null);
  const p = createSchema.safeParse(body);
  if (!p.success) return jsonError('Data tidak valid', 422, p.error.flatten().fieldErrors);
  const existing = await db.select().from(aiProviders).where(eq(aiProviders.code, p.data.code)).limit(1);
  if (existing.length) return jsonError('Kode provider sudah ada', 409);
  const [row] = await db
    .insert(aiProviders)
    .values({ code: p.data.code, name: p.data.name, baseUrl: p.data.baseUrl || null, enabled: p.data.enabled ?? true })
    .returning();
  return jsonOk(row, 201);
}
