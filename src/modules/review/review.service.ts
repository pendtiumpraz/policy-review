import { db } from '@/lib/db';
import { regulations } from '@/lib/db/schema';
import { eq, inArray, and } from 'drizzle-orm';
import { runAi } from '@/modules/ai/service';
import { parseAiJson, normalizeResult, docTypeLabel, type NormalizedReview } from './parse';

export interface ReviewInput {
  title: string;
  docType: string;
  docText: string;
  regulationIds: string[];
  modelId?: string | null;
  providerId?: string | null;
}

interface RegulationBrief {
  id: string;
  title: string;
  source: string;
  excerpt: string;
}

function buildSystemPrompt(): string {
  return (
    'Kamu adalah auditor kepatuhan senior untuk kebijakan/SOP internal. ' +
    'Tugasmu mengaudit dokumen internal terhadap (1) kepatuhan terhadap berbagai peraturan ' +
    'yang DIKUTIP pengguna (regulasi eksternal seperti UU PDP, maupun regulasi internal perusahaan), ' +
    'DAN (2) kualitas dokumen itu sendiri. Fokus hanya pada dimensi yang RELEVAN — jangan memaksa ' +
    'semua dimensi ke dokumen yang scope-nya sempit.\n\n' +
    'Output WAJIB berupa JSON valid dengan format berikut (camelCase):\n' +
    JSON.stringify(
      {
        overallScore: '0-100 (integer)',
        complianceLevel: 'compliant/partial/non_compliant',
        summary: 'ringkasan 2-3 kalimat',
        strengths: ['hal yang sudah baik'],
        missingElements: ['elemen penting yang belum ada'],
        priorityActions: [
          { action: '...', priority: 'high/medium/low', deadlineSuggestion: '...' },
        ],
        notApplicableDimensions: ['dimensi yang tidak relevan, dengan alasan singkat'],
        sections: [
          {
            sectionTitle: 'Nama bagian/pasal dokumen',
            status: 'comply/partial/non_comply/missing',
            score: '0-100',
            gapDescription: 'gap yang ditemukan',
            recommendation: 'saran perbaikan konkret',
            reference: 'Pasal/ketentuan yang relevan',
          },
        ],
        regulationResults: [
          { status: 'comply/partial/non_comply', score: '0-100', findings: 'temuan vs regulasi ini' },
        ],
      },
      null,
      2,
    ) +
    '\n`regulationResults` harus berisi SATU objek per regulasi dalam URUTAN PERSIS sama dengan daftar regulasi yang diberikan. ' +
    'Jawab HANYA JSON valid tanpa teks lain.'
  );
}

function buildUserPrompt(input: ReviewInput, briefs: RegulationBrief[]): string {
  const regBlock = briefs.length
    ? briefs
        .map(
          (b, i) =>
            `[Regulasi ${i + 1}]\nJudul: ${b.title}\nSumber: ${b.source || '-'}\nIsi (ringkasan/ekscerpt):\n${b.excerpt}`,
        )
        .join('\n\n')
    : '(Tidak ada regulasi dipilih — audit hanya pada kelengkapan dokumen internal.)';

  return (
    `Audit dokumen internal berikut:\n\n` +
    `Judul: ${input.title}\n` +
    `Tipe Dokumen: ${docTypeLabel(input.docType)}\n\n` +
    `=== DAFTAR REGULASI YANG DIREVIEW ===\n${regBlock}\n=== END REGULASI ===\n\n` +
    `=== ISI DOKUMEN ===\n${input.docText.slice(0, 12000)}\n=== END ===\n\n` +
    'ATURAN PENTING:\n' +
    '1. sections: audit per-bagian DOKUMEN yang ada (bukan per-dimensi yang dipaksa).\n' +
    '2. regulationResults: satu per regulasi, urutan sama persis dengan daftar di atas.\n' +
    '3. Dimensi yang tidak relevan → notApplicableDimensions, jangan masuk missingElements.\n' +
    'Jawab HANYA JSON valid.'
  );
}

export async function generateReview(
  tenantId: string,
  input: ReviewInput,
): Promise<NormalizedReview & { providerId: string; modelId: string; inputTokens: number; outputTokens: number }> {
  const briefs: RegulationBrief[] = [];
  const regulationTitles: { id: string; title: string }[] = [];

  if (input.regulationIds.length) {
    const rows = await db
      .select()
      .from(regulations)
      .where(and(eq(regulations.tenantId, tenantId), inArray(regulations.id, input.regulationIds)));
    // Preserve requested order.
    const byId = new Map(rows.map((r) => [r.id, r]));
    for (const id of input.regulationIds) {
      const r = byId.get(id);
      if (!r) continue;
      regulationTitles.push({ id: r.id, title: r.title });
      briefs.push({
        id: r.id,
        title: r.title,
        source: r.source || '',
        excerpt: (r.content || '').slice(0, 1500) || '(konten tersimpan sebagai file)',
      });
    }
  }

  const out = await runAi(tenantId, buildSystemPrompt(), buildUserPrompt(input, briefs), {
    operation: 'review',
    modelId: input.modelId,
    providerId: input.providerId,
    maxTokens: 5000,
  });

  const raw = parseAiJson<Parameters<typeof normalizeResult>[0]>(out.text);
  const normalized = normalizeResult(raw, regulationTitles);

  return {
    ...normalized,
    providerId: out.resolved.providerId,
    modelId: out.resolved.modelId,
    inputTokens: out.inputTokens,
    outputTokens: out.outputTokens,
  };
}
