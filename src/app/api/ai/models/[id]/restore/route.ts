import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { aiModels } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireSuperadmin, jsonOk } from '@/lib/server';

export async function POST(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireSuperadmin();
  if ('error' in auth) return auth.error;
  const { id } = await ctx.params;
  await db.update(aiModels).set({ deletedAt: null, updatedAt: new Date() }).where(eq(aiModels.id, id));
  return jsonOk({ ok: true });
}
