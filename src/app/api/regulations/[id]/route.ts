import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { regulations } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { requireUser, jsonOk, jsonError } from '@/lib/server';

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const r = await requireUser();
  if ('error' in r) return r.error;
  const { id } = await ctx.params;
  const [row] = await db
    .select()
    .from(regulations)
    .where(and(eq(regulations.id, id), eq(regulations.tenantId, r.user.tenantId)))
    .limit(1);
  if (!row) return jsonError('Tidak ditemukan', 404);
  return jsonOk(row);
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const r = await requireUser();
  if ('error' in r) return r.error;
  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);
  const [row] = await db
    .update(regulations)
    .set({
      title: body?.title,
      kind: body?.kind,
      source: body?.source,
      description: body?.description,
      content: body?.content,
      checklist: body?.checklist,
      updatedAt: new Date(),
    })
    .where(and(eq(regulations.id, id), eq(regulations.tenantId, r.user.tenantId)))
    .returning();
  if (!row) return jsonError('Tidak ditemukan', 404);
  return jsonOk(row);
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const r = await requireUser();
  if ('error' in r) return r.error;
  const { id } = await ctx.params;
  await db
    .update(regulations)
    .set({ deletedAt: new Date() })
    .where(and(eq(regulations.id, id), eq(regulations.tenantId, r.user.tenantId)));
  return jsonOk({ ok: true });
}
