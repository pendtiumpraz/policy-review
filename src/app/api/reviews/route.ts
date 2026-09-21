import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { reviews, documents, regulations } from '@/lib/db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { requireUser, jsonOk, jsonError } from '@/lib/server';
import { storeFile, extractText } from '@/lib/storage';
import { generateReview } from '@/modules/review/review.service';
import type { RegulationChecklistEntry } from '@/lib/types';

export const maxDuration = 60;

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
  const trashed = req.nextUrl.searchParams.get('trashed') === '1';
  const all = await db
    .select()
    .from(reviews)
    .where(eq(reviews.tenantId, r.user.tenantId))
    .orderBy(reviews.createdAt);
  const data = trashed ? all.filter((x) => x.deletedAt !== null) : all.filter((x) => x.deletedAt === null);
  return jsonOk(data);
}

export async function POST(req: NextRequest) {
  const r = await requireUser();
  if ('error' in r) return r.error;

  try {
    const form = await req.formData();
    const title = String(form.get('title') || '').trim();
    const docType = String(form.get('docType') || 'kebijakan_privasi');
    const modelId = form.get('modelId') ? String(form.get('modelId')) : null;
    const providerId = form.get('providerId') ? String(form.get('providerId')) : null;
    let content = String(form.get('content') || '').trim();
    let regulationIds: string[] = [];
    try {
      const raw = form.get('regulationIds');
      if (raw) regulationIds = JSON.parse(String(raw));
    } catch {
      /* ignore */
    }

    if (!title) return jsonError('Judul wajib diisi', 422);

    let fileName: string | null = null;
    let filePath: string | null = null;
    let documentId: string | null = null;

    const file = form.get('file');
    if (file instanceof File && file.size > 0) {
      if (file.size > MAX_FILE_BYTES) {
        return jsonError('Ukuran file maksimal 10 MB', 422);
      }

      const hasPastedText = content.length >= 50;

      try {
        const stored = await storeFile(r.user.tenantId, 'documents', file);
        fileName = stored.fileName;
        filePath = stored.pathname;
      } catch (e) {
        if (!hasPastedText) {
          return jsonError(`Gagal menyimpan file (konfigurasi blob): ${errDetail(e)}`, 500);
        }
        console.error('[reviews] Penyimpanan file gagal — lanjut dengan teks tempel:', errDetail(e));
      }

      if (!hasPastedText) {
        try {
          content = (await extractText(file)).trim();
        } catch (e) {
          return jsonError(`Gagal mengekstrak teks: ${errDetail(e)}`, 500);
        }
      }
    }

    if (!content) {
      return jsonError('Gagal mengekstrak teks: tidak ada teks terbaca dari file (mungkin PDF hasil scan). Silakan tempel teks dokumen secara manual.', 500);
    }
    if (content.length < 50) {
      return jsonError('Teks dokumen minimal 50 karakter (atau unggah file PDF/DOCX).', 422);
    }

    // Store document record for re-review / audit trail.
    if (content) {
      const [doc] = await db
        .insert(documents)
        .values({
          tenantId: r.user.tenantId,
          title,
          docType,
          extractedText: content,
          fileName,
          filePath,
          createdBy: r.user.id,
        })
        .returning();
      documentId = doc.id;
    }

    // Build checklist entries from selected regulations.
    let regulationChecklist: RegulationChecklistEntry[] = [];
    if (regulationIds.length) {
      const regs = await db
        .select()
        .from(regulations)
        .where(and(eq(regulations.tenantId, r.user.tenantId), inArray(regulations.id, regulationIds)));
      const byId = new Map(regs.map((x) => [x.id, x]));
      regulationChecklist = regulationIds
        .filter((id) => byId.has(id))
        .map((id) => ({ regulationId: id, items: byId.get(id)!.checklist || [], checked: [] }));
    }

    const [review] = await db
      .insert(reviews)
      .values({
        tenantId: r.user.tenantId,
        title,
        docType,
        documentId,
        regulationIds,
        regulationChecklist,
        status: 'processing',
        createdBy: r.user.id,
      })
      .returning();

    try {
      const out = await generateReview(r.user.tenantId, {
        title,
        docType,
        docText: content,
        regulationIds,
        modelId,
        providerId,
      });

      await db
        .update(reviews)
        .set({
          status: 'completed',
          riskScore: out.result.overallScore,
          reviewSummary: out.result,
          providerId: out.providerId,
          modelId: out.modelId,
          updatedAt: new Date(),
        })
        .where(eq(reviews.id, review.id));

      return jsonOk({ id: review.id }, 201);
    } catch (e) {
      await db
        .update(reviews)
        .set({ status: 'failed', errorMessage: e instanceof Error ? e.message : 'Gagal review', updatedAt: new Date() })
        .where(eq(reviews.id, review.id));
      return jsonError(e instanceof Error ? e.message : 'Gagal menjalankan review AI', 502);
    }
  } catch (e) {
    console.error('[reviews] POST persiapan gagal:', e);
    return jsonError(`Gagal membuat review: ${errDetail(e)}`, 500);
  }
}
