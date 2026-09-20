import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { tenants } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireSuperadmin, jsonOk } from '@/lib/server';

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireSuperadmin();
  if ('error' in auth) return auth.error;
  const { id } = await ctx.params;
  await db.delete(tenants).where(eq(tenants.id, id));
  return jsonOk({ ok: true });
}
