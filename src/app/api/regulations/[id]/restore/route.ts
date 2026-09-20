import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { regulations } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { requireUser, jsonOk } from '@/lib/server';

export async function POST(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const r = await requireUser();
  if ('error' in r) return r.error;
  const { id } = await ctx.params;
  await db
    .update(regulations)
    .set({ deletedAt: null, updatedAt: new Date() })
    .where(and(eq(regulations.id, id), eq(regulations.tenantId, r.user.tenantId)));
  return jsonOk({ ok: true });
}
