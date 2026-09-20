import type { ReviewResult, RegulationResult, ReviewSection } from '@/lib/types';

export const DOC_TYPES = [
  { value: 'kebijakan_privasi', label: 'Kebijakan Privasi' },
  { value: 'sop_data_handling', label: 'SOP Penanganan Data' },
  { value: 'sop_breach_response', label: 'SOP Breach Response' },
  { value: 'peraturan_perusahaan', label: 'Peraturan Perusahaan' },
  { value: 'sop_dsr', label: 'SOP Hak Subjek Data' },
  { value: 'sop_retensi', label: 'SOP Retensi Data' },
  { value: 'other', label: 'Lainnya' },
];

export function docTypeLabel(v: string) {
  return DOC_TYPES.find((d) => d.value === v)?.label || v;
}

/** Strip markdown fences + trailing commas, then parse. */
export function parseAiJson<T>(text: string): T {
  let t = text.trim();
  t = t.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '');
  const start = t.indexOf('{');
  const end = t.lastIndexOf('}');
  if (start >= 0 && end > start) t = t.slice(start, end + 1);
  t = t.replace(/,\s*([}\]])/g, '$1');
  return JSON.parse(t) as T;
}

interface RawAiSection {
  sectionTitle?: string;
  status?: string;
  score?: number;
  gapDescription?: string;
  recommendation?: string;
  reference?: string;
}

interface RawAiResult {
  overallScore?: number;
  complianceLevel?: string;
  summary?: string;
  strengths?: string[];
  missingElements?: string[];
  priorityActions?: { action?: string; priority?: string; deadlineSuggestion?: string }[];
  notApplicableDimensions?: string[];
  regulationResults?: { status?: string; score?: number; findings?: string }[];
  sections?: RawAiSection[];
}

const SECTION_STATUSES = ['comply', 'partial', 'non_comply', 'missing'] as const;

function normStatus(s: string | undefined): ReviewSection['status'] {
  const v = (s || '').toLowerCase();
  return (SECTION_STATUSES.includes(v as (typeof SECTION_STATUSES)[number]) ? v : 'missing') as ReviewSection['status'];
}

function normRegStatus(s: string | undefined): RegulationResult['status'] {
  const v = (s || '').toLowerCase();
  if (v === 'comply' || v === 'partial') return v;
  return 'non_comply';
}

export interface NormalizedReview {
  result: ReviewResult;
  sections: ReviewSection[];
}

export function normalizeResult(
  raw: RawAiResult,
  regulationTitles: { id: string; title: string }[],
): NormalizedReview {
  const overallScore = Math.max(0, Math.min(100, Math.round(Number(raw.overallScore) || 0)));
  const level = raw.complianceLevel || (overallScore >= 70 ? 'compliant' : overallScore >= 40 ? 'partial' : 'non_compliant');

  const sections: ReviewSection[] = (raw.sections || []).map(
    (s): ReviewSection => ({
      sectionTitle: s.sectionTitle || 'Bagian',
      status: normStatus(s.status),
      score: Math.max(0, Math.min(100, Math.round(Number(s.score) || 0))),
      gapDescription: s.gapDescription || '',
      recommendation: s.recommendation || '',
      reference: s.reference || '',
    }),
  );

  const regulationResults: RegulationResult[] = regulationTitles.map((r, i) => {
    const rr = raw.regulationResults?.[i];
    return {
      regulationId: r.id,
      title: r.title,
      status: normRegStatus(rr?.status),
      score: Math.max(0, Math.min(100, Math.round(Number(rr?.score) || 0))),
      findings: rr?.findings || '',
    };
  });

  const result: ReviewResult = {
    overallScore,
    complianceLevel: (['compliant', 'partial', 'non_compliant'].includes(level)
      ? level
      : 'partial') as ReviewResult['complianceLevel'],
    summary: raw.summary || '',
    strengths: raw.strengths || [],
    missingElements: raw.missingElements || [],
    priorityActions: (raw.priorityActions || []).map((a) => ({
      action: a.action || '',
      priority: (a.priority === 'high' || a.priority === 'low' ? a.priority : 'medium') as 'high' | 'medium' | 'low',
      deadlineSuggestion: a.deadlineSuggestion || '',
    })),
    notApplicableDimensions: raw.notApplicableDimensions || [],
    regulationResults,
    sections,
  };

  return { result, sections };
}
