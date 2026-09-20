import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { tenants } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireUser, jsonOk, jsonError } from '@/lib/server';

export async function GET() {
  const r = await requireUser();
  if ('error' in r) return r.error;
  const [tenant] = await db.select().from(tenants).where(eq(tenants.id, r.user.tenantId)).limit(1);
  return jsonOk(tenant);
}

export async function PATCH(req: NextRequest) {
  const r = await requireUser();
  if ('error' in r) return r.error;
  const body = await req.json().catch(() => null);
  if (!body) return jsonError('Data tidak valid', 422);

  const [row] = await db
    .update(tenants)
    .set({
      name: body.name,
      brandPrimaryColor: body.brandPrimaryColor,
      brandLogoUrl: body.brandLogoUrl,
      updatedAt: new Date(),
    })
    .where(eq(tenants.id, r.user.tenantId))
    .returning();
  return jsonOk(row);
}
