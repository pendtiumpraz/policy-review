import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { tenants, users } from '@/lib/db/schema';
import { eq, isNull } from 'drizzle-orm';
import { requireSuperadmin, jsonOk, jsonError } from '@/lib/server';
import { z } from 'zod';

export async function GET(req: NextRequest) {
  const auth = await requireSuperadmin();
  if ('error' in auth) return auth.error;
  const trashed = req.nextUrl.searchParams.get('trashed') === '1';
  const rows = await db.select().from(tenants);
  const data = rows.filter((x) => (trashed ? x.deletedAt !== null : x.deletedAt === null));
  return jsonOk(data);
}

const schema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  tokenQuota: z.number().int().min(0).optional(),
});

export async function POST(req: NextRequest) {
  const auth = await requireSuperadmin();
  if ('error' in auth) return auth.error;
  const body = await req.json().catch(() => null);
  const p = schema.safeParse(body);
  if (!p.success) return jsonError('Data tidak valid', 422, p.error.flatten().fieldErrors);

  const [tenant] = await db
    .insert(tenants)
    .values({ name: p.data.name, slug: p.data.slug, tokenQuota: p.data.tokenQuota ?? 0 })
    .returning();
  return jsonOk(tenant, 201);
}
