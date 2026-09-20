'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/client-api';
import type { ReviewResult, RegulationChecklistEntry } from '@/lib/types';

interface Review {
  id: string;
  title: string;
  docType: string;
  status: string;
  riskScore: number;
  errorMessage: string | null;
  reviewSummary: ReviewResult | null;
  regulationChecklist: RegulationChecklistEntry[];
}

const SECTION_STATUS = [
  { value: 'comply', label: 'Patuh' },
  { value: 'partial', label: 'Sebagian' },
  { value: 'non_comply', label: 'Tidak Patuh' },
  { value: 'missing', label: 'Belum Ada' },
];

const REG_STATUS = [
  { value: 'comply', label: 'Patuh' },
  { value: 'partial', label: 'Sebagian' },
  { value: 'non_comply', label: 'Tidak Patuh' },
];

const toneColor: Record<string, string> = {
  comply: 'var(--success)',
  partial: 'var(--warning)',
  non_comply: 'var(--danger)',
  missing: 'var(--text-muted)',
};

const levelLabel: Record<string, string> = {
  compliant: 'Patuh',
  partial: 'Patuh Sebagian',
  non_compliant: 'Tidak Patuh',
};

export default function ReviewDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [review, setReview] = useState<Review | null>(null);
  const [result, setResult] = useState<ReviewResult | null>(null);
  const [checklist, setChecklist] = useState<RegulationChecklistEntry[]>([]);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await api<{ data: Review }>(`/api/reviews/${params.id}`);
      setReview(res.data);
      setResult(res.data.reviewSummary);
      setChecklist(res.data.regulationChecklist || []);
      setTitle(res.data.title);
      setLoading(false);
    })().catch(() => setLoading(false));
  }, [params.id]);

  const patchResult = (patch: Partial<ReviewResult>) => setResult((r) => (r ? { ...r, ...patch } : r));

  const save = async () => {
    setSaving(true);
    await api(`/api/reviews/${params.id}`, {
      method: 'PATCH',
      body: { title, reviewSummary: result, regulationChecklist: checklist },
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggleCheck = (regulationId: string, itemId: string) => {
    setChecklist((c) =>
      c.map((e) =>
        e.regulationId === regulationId
          ? {
              ...e,
              checked: e.checked.includes(itemId) ? e.checked.filter((x) => x !== itemId) : [...e.checked, itemId],
            }
          : e,
      ),
    );
  };

  if (loading) return <div className="empty-state">Memuat...</div>;
  if (!review || !result) {
    return (
      <div>
        <button className="btn btn-secondary mb-4" onClick={() => router.push('/reviews')}>Kembali</button>
        <div className="empty-state">
          <h3>Hasil tidak ditemukan</h3>
          <p>{review?.errorMessage || 'Review ini tidak tersedia.'}</p>
        </div>
      </div>
    );
  }

  const color = levelColor(result.complianceLevel);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button className="btn btn-secondary" onClick={() => router.push('/reviews')}>Kembali</button>
        <input className="form-input" style={{ flex: 1, fontWeight: 700 }} value={title} onChange={(e) => setTitle(e.target.value)} />
        <span className="badge badge-blue">{review.docType.replace(/_/g, ' ')}</span>
        <button className="btn btn-primary" onClick={save} disabled={saving}>
          {saving ? 'Menyimpan...' : saved ? 'Tersimpan ✓' : 'Simpan Perubahan'}
        </button>
      </div>

      {/* Score + summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 20 }}>
        <div className="card" style={{ padding: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>Skor Kepatuhan</div>
          <div className="score-circle" style={{ background: `${color}20`, border: `4px solid ${color}`, color }}>
            <input
              value={result.overallScore}
              onChange={(e) => patchResult({ overallScore: Math.max(0, Math.min(100, Number(e.target.value) || 0)) })}
              style={{ width: 60, border: 'none', background: 'transparent', fontSize: 34, fontWeight: 900, color: 'inherit', textAlign: 'center', outline: 'none' }}
            />
          </div>
          <select className="form-select" style={{ textAlign: 'center', fontWeight: 700, color }} value={result.complianceLevel} onChange={(e) => patchResult({ complianceLevel: e.target.value as ReviewResult['complianceLevel'] })}>
            <option value="compliant">Patuh</option>
            <option value="partial">Patuh Sebagian</option>
            <option value="non_compliant">Tidak Patuh</option>
          </select>
          <div style={{ marginTop: 8, fontWeight: 800, color }}>{levelLabel[result.complianceLevel]}</div>
        </div>
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ margin: '0 0 12px', fontSize: 16 }}>Ringkasan</h3>
          <textarea className="form-textarea" style={{ minHeight: 120 }} value={result.summary} onChange={(e) => patchResult({ summary: e.target.value })} />
        </div>
      </div>

      {/* strengths / missing */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 20 }}>
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ margin: '0 0 10px', fontSize: 15, color: 'var(--success)' }}>Hal yang Sudah Baik</h3>
          <textarea className="form-textarea" style={{ minHeight: 100 }} value={result.strengths.join('\n')} onChange={(e) => patchResult({ strengths: e.target.value.split('\n').filter(Boolean) })} />
        </div>
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ margin: '0 0 10px', fontSize: 15, color: 'var(--danger)' }}>Elemen yang Belum Ada</h3>
          <textarea className="form-textarea" style={{ minHeight: 100 }} value={result.missingElements.join('\n')} onChange={(e) => patchResult({ missingElements: e.target.value.split('\n').filter(Boolean) })} />
        </div>
      </div>

      {/* Regulation results */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header"><h3 style={{ margin: 0, fontSize: 16 }}>Hasil per Regulasi</h3></div>
        <div className="card-body">
          {result.regulationResults.length === 0 ? (
            <div className="empty-state"><p>Belum ada hasil regulasi.</p></div>
          ) : result.regulationResults.map((rr, i) => (
            <div key={rr.regulationId} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: i < result.regulationResults.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ width: 220, flexShrink: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{rr.title}</div>
                <select className="form-select" style={{ marginTop: 4 }} value={rr.status} onChange={(e) => patchResult({ regulationResults: result.regulationResults.map((x, j) => (j === i ? { ...x, status: e.target.value as typeof x.status } : x)) })}>
                  {REG_STATUS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
                <div style={{ marginTop: 4, fontWeight: 800, color: toneColor[rr.status] }}>{rr.score}</div>
              </div>
              <textarea className="form-textarea" style={{ flex: 1, minHeight: 70 }} value={rr.findings} onChange={(e) => patchResult({ regulationResults: result.regulationResults.map((x, j) => (j === i ? { ...x, findings: e.target.value } : x)) })} />
            </div>
          ))}
        </div>
      </div>

      {/* Checklist one-by-one */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <h3 style={{ margin: 0, fontSize: 16 }}>Checklist Pemeriksaan</h3>
          <span className="badge badge-blue">{checklist.reduce((a, e) => a + e.checked.length, 0)}/{checklist.reduce((a, e) => a + e.items.length, 0)}</span>
        </div>
        <div className="card-body">
          {checklist.length === 0 ? (
            <div className="empty-state"><p>Belum ada checklist.</p></div>
          ) : checklist.map((e) => (
            <div key={e.regulationId} style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>{e.regulationId}</div>
              {e.items.length === 0 ? <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>—</div> :
                e.items.map((it) => (
                  <label key={it.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', cursor: 'pointer', fontSize: 13 }}>
                    <input type="checkbox" checked={e.checked.includes(it.id)} onChange={() => toggleCheck(e.regulationId, it.id)} />
                    <span style={e.checked.includes(it.id) ? { color: 'var(--success)', textDecoration: 'line-through' } : {}}>{it.text}</span>
                  </label>
                ))}
            </div>
          ))}
        </div>
      </div>

      {/* Sections editable */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header"><h3 style={{ margin: 0, fontSize: 16 }}>Analisis per Bagian</h3></div>
        <div className="table-container">
          <table className="data-table">
            <thead><tr><th>Bagian</th><th>Status</th><th>Skor</th><th>Kesenjangan</th><th>Rekomendasi</th><th>Referensi</th></tr></thead>
            <tbody>
              {result.sections.map((s, i) => (
                <tr key={i}>
                  <td><input className="form-input" value={s.sectionTitle} onChange={(e) => patchResult({ sections: result.sections.map((x, j) => (j === i ? { ...x, sectionTitle: e.target.value } : x)) })} /></td>
                  <td>
                    <select className="form-select" value={s.status} onChange={(e) => patchResult({ sections: result.sections.map((x, j) => (j === i ? { ...x, status: e.target.value as typeof x.status } : x)) })}>
                      {SECTION_STATUS.map((st) => <option key={st.value} value={st.value}>{st.label}</option>)}
                    </select>
                  </td>
                  <td><input className="form-input" type="number" style={{ width: 60, color: toneColor[s.status], fontWeight: 700 }} value={s.score} onChange={(e) => patchResult({ sections: result.sections.map((x, j) => (j === i ? { ...x, score: Number(e.target.value) || 0 } : x)) })} /></td>
                  <td><textarea className="form-textarea" style={{ minHeight: 50, minWidth: 160 }} value={s.gapDescription} onChange={(e) => patchResult({ sections: result.sections.map((x, j) => (j === i ? { ...x, gapDescription: e.target.value } : x)) })} /></td>
                  <td><textarea className="form-textarea" style={{ minHeight: 50, minWidth: 160 }} value={s.recommendation} onChange={(e) => patchResult({ sections: result.sections.map((x, j) => (j === i ? { ...x, recommendation: e.target.value } : x)) })} /></td>
                  <td><input className="form-input" style={{ width: 120 }} value={s.reference} onChange={(e) => patchResult({ sections: result.sections.map((x, j) => (j === i ? { ...x, reference: e.target.value } : x)) })} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Priority actions */}
      <div className="card">
        <div className="card-header"><h3 style={{ margin: 0, fontSize: 16 }}>Tindakan Prioritas</h3></div>
        <div className="card-body">
          <textarea className="form-textarea" style={{ minHeight: 100 }} value={result.priorityActions.map((a) => `[${a.priority}] ${a.action} (${a.deadlineSuggestion})`).join('\n')} onChange={(e) => {
            const actions = e.target.value.split('\n').filter(Boolean).map((line) => {
              const m = line.match(/^\[(high|medium|low)\]\s*(.*?)\s*\((.*?)\)\s*$/);
              if (m) return { priority: m[1] as 'high' | 'medium' | 'low', action: m[2], deadlineSuggestion: m[3] };
              return { priority: 'medium' as const, action: line, deadlineSuggestion: '' };
            });
            patchResult({ priorityActions: actions });
          }} />
        </div>
      </div>
    </div>
  );
}

function levelColor(l: string) {
  return l === 'compliant' ? 'var(--success)' : l === 'partial' ? 'var(--warning)' : 'var(--danger)';
}
