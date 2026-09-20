import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { reviews } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { requireUser, jsonOk, jsonError } from '@/lib/server';

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const r = await requireUser();
  if ('error' in r) return r.error;
  const { id } = await ctx.params;
  const [row] = await db
    .select()
    .from(reviews)
    .where(and(eq(reviews.id, id), eq(reviews.tenantId, r.user.tenantId)))
    .limit(1);
  if (!row) return jsonError('Tidak ditemukan', 404);
  return jsonOk(row);
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const r = await requireUser();
  if ('error' in r) return r.error;
  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);
  if (!body) return jsonError('Data tidak valid', 422);

  const patch: Record<string, unknown> = { updatedAt: new Date() };
  if (typeof body.title === 'string') patch.title = body.title;
  if (typeof body.docType === 'string') patch.docType = body.docType;
  if (body.reviewSummary !== undefined) {
    patch.reviewSummary = body.reviewSummary;
    if (body.reviewSummary?.overallScore != null) patch.riskScore = body.reviewSummary.overallScore;
  }
  if (body.regulationChecklist !== undefined) patch.regulationChecklist = body.regulationChecklist;

  const [row] = await db
    .update(reviews)
    .set(patch)
    .where(and(eq(reviews.id, id), eq(reviews.tenantId, r.user.tenantId)))
    .returning();
  if (!row) return jsonError('Tidak ditemukan', 404);
  return jsonOk(row);
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const r = await requireUser();
  if ('error' in r) return r.error;
  const { id } = await ctx.params;
  await db
    .update(reviews)
    .set({ deletedAt: new Date() })
    .where(and(eq(reviews.id, id), eq(reviews.tenantId, r.user.tenantId)));
  return jsonOk({ ok: true });
}
