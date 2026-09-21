import { NextRequest } from 'next/server';
import { randomUUID } from 'node:crypto';
import { db } from '@/lib/db';
import { regulations } from '@/lib/db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { requireUser, jsonOk, jsonError } from '@/lib/server';
import { storeFile, extractText } from '@/lib/storage';

const MAX_FILE_BYTES = 10 * 1024 * 1024;

function errDetail(e: unknown): string {
  if (e instanceof Error) return e.message;
  try {
    return JSON.stringify(e);
  } catch {
    return String(e);
  }
}

export async function GET(req: NextRequest) {
  const r = await requireUser();
  if ('error' in r) return r.error;
  const kind = req.nextUrl.searchParams.get('kind');
  const trashed = req.nextUrl.searchParams.get('trashed') === '1';
  const rows = await db
    .select()
    .from(regulations)
    .where(eq(regulations.tenantId, r.user.tenantId))
    .orderBy(regulations.createdAt);
  const data = rows
    .filter((x) => (trashed ? x.deletedAt !== null : x.deletedAt === null))
    .filter((x) => (kind ? x.kind === kind : true));
  return jsonOk(data);
}

export async function POST(req: NextRequest) {
  const r = await requireUser();
  if ('error' in r) return r.error;

  try {
    const form = await req.formData();
    const title = String(form.get('title') || '').trim();
    const kind = String(form.get('kind') || 'external');
    const source = String(form.get('source') || '').trim() || null;
    const description = String(form.get('description') || '').trim() || null;
    let content = String(form.get('content') || '').trim();

    let checklist: { id: string; text: string }[] = [];
    try {
      const rawChecklist = form.get('checklist');
      if (rawChecklist) {
        const parsed = JSON.parse(String(rawChecklist));
        if (Array.isArray(parsed)) {
          checklist = parsed
            .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
            .map((item) => ({
              id: typeof item.id === 'string' && item.id.trim() ? item.id.trim() : randomUUID(),
              text: String(item.text ?? '').trim(),
            }))
            .filter((item) => item.text.length > 0);
        }
      }
    } catch {
      /* checklist tidak valid — abaikan */
    }

    if (!title) return jsonError('Judul wajib diisi', 422);

    let fileName: string | null = null;
    let filePath: string | null = null;

    const file = form.get('file');
    if (file instanceof File && file.size > 0) {
      if (file.size > MAX_FILE_BYTES) {
        return jsonError('Ukuran file maksimal 10 MB', 422);
      }

      const pastedText = content;

      try {
        const stored = await storeFile(r.user.tenantId, 'regulations', file);
        fileName = stored.fileName;
        filePath = stored.pathname;
      } catch (e) {
        if (!pastedText) {
          return jsonError(`Gagal menyimpan file (konfigurasi blob): ${errDetail(e)}`, 500);
        }
        console.error('[regulations] Penyimpanan file gagal — lanjut menyimpan teks tempel:', errDetail(e));
      }

      if (!pastedText) {
        try {
          content = (await extractText(file)).trim();
          if (!content) {
            return jsonError('Gagal mengekstrak teks: tidak ada teks terbaca dari file (mungkin PDF hasil scan)', 500);
          }
        } catch (e) {
          return jsonError(`Gagal mengekstrak teks: ${errDetail(e)}`, 500);
        }
      }
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
  } catch (e) {
    console.error('[regulations] POST gagal:', e);
    return jsonError(`Gagal menyimpan regulasi: ${errDetail(e)}`, 500);
  }
}
