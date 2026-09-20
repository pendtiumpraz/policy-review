import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { regulations } from '@/lib/db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { requireUser, jsonOk, jsonError } from '@/lib/server';
import { storeFile, extractText } from '@/lib/storage';

export async function GET(req: NextRequest) {
  const r = await requireUser();
  if ('error' in r) return r.error;
  const kind = req.nextUrl.searchParams.get('kind');
  const rows = await db
    .select()
    .from(regulations)
    .where(and(eq(regulations.tenantId, r.user.tenantId), isNull(regulations.deletedAt)))
    .orderBy(regulations.createdAt);
  const data = kind ? rows.filter((x) => x.kind === kind) : rows;
  return jsonOk(data);
}

export async function POST(req: NextRequest) {
  const r = await requireUser();
  if ('error' in r) return r.error;

  const form = await req.formData();
  const title = String(form.get('title') || '').trim();
  const kind = String(form.get('kind') || 'external');
  const source = String(form.get('source') || '').trim() || null;
  const description = String(form.get('description') || '').trim() || null;
  let content = String(form.get('content') || '').trim();
  let checklist: { id: string; text: string }[] = [];
  try {
    const rawChecklist = form.get('checklist');
    if (rawChecklist) checklist = JSON.parse(String(rawChecklist));
  } catch {
    /* ignore */
  }

  if (!title) return jsonError('Judul wajib diisi', 422);

  let fileName: string | null = null;
  let filePath: string | null = null;

  const file = form.get('file');
  if (file instanceof File && file.size > 0) {
    const stored = await storeFile(r.user.tenantId, 'regulations', file);
    fileName = stored.fileName;
    filePath = stored.pathname;
    if (!content) content = await extractText(file);
  }

  const [row] = await db
    .insert(regulations)
    .values({
      tenantId: r.user.tenantId,
      title,
      kind,
      source,
      description,
      content: content || null,
      fileName,
      filePath,
      checklist,
      createdBy: r.user.id,
    })
    .returning();

  return jsonOk(row, 201);
}
