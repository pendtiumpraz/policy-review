import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { requireUser, jsonOk } from '@/lib/server';

export async function POST(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const r = await requireUser();
  if ('error' in r) return r.error;
  const { id } = await ctx.params;
  await db
    .update(users)
    .set({ deletedAt: null, updatedAt: new Date() })
    .where(and(eq(users.id, id), eq(users.tenantId, r.user.tenantId)));
  return jsonOk({ ok: true });
}
