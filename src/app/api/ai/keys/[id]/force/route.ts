import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { tenantAiKeys } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { requireUser, jsonOk } from '@/lib/server';

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const r = await requireUser();
  if ('error' in r) return r.error;
  const { id } = await ctx.params;
  await db
    .delete(tenantAiKeys)
    .where(and(eq(tenantAiKeys.id, id), eq(tenantAiKeys.tenantId, r.user.tenantId)));
  return jsonOk({ ok: true });
}
