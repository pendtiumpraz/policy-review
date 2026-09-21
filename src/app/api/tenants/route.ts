import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { tenants, users } from '@/lib/db/schema';
import { and, asc, eq, inArray } from 'drizzle-orm';
import { requireSuperadmin, jsonOk, jsonError } from '@/lib/server';
import { z } from 'zod';

export async function GET(req: NextRequest) {
  const auth = await requireSuperadmin();
  if ('error' in auth) return auth.error;
  const trashed = req.nextUrl.searchParams.get('trashed') === '1';
  const rows = await db.select().from(tenants);
  const data = rows.filter((x) => (trashed ? x.deletedAt !== null : x.deletedAt === null));
  const ids = data.map((t) => t.id);
  const admins = ids.length > 0
    ? await db
        .select({ id: users.id, tenantId: users.tenantId, email: users.email, role: users.role })
        .from(users)
        .where(and(eq(users.role, 'admin'), inArray(users.tenantId, ids)))
        .orderBy(asc(users.createdAt))
    : [];
  const adminEmailByTenant = new Map<string, string>();
  for (const u of admins) {
    if (!adminEmailByTenant.has(u.tenantId)) adminEmailByTenant.set(u.tenantId, u.email);
  }
  return jsonOk(data.map((row) => ({ ...row, admin_email: adminEmailByTenant.get(row.id) ?? null })));
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
