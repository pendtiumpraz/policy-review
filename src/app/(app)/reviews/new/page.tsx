'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, formJson } from '@/lib/client-api';
import { DOC_TYPES } from '@/modules/review/parse';

interface Regulation { id: string; title: string; kind: string; source: string | null; checklist: { id: string; text: string }[]; }
interface Model { id: string; providerId: string; providerCode: string; providerName: string; name: string; modelId: string; enabled: boolean; }
interface Key { id: string; providerId: string; providerName: string; enabled: boolean; }

export default function NewReviewPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [docType, setDocType] = useState('kebijakan_privasi');
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [regulations, setRegulations] = useState<Regulation[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [keys, setKeys] = useState<Key[]>([]);
  const [modelId, setModelId] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      const [r, m, k] = await Promise.all([
        api<{ data: Regulation[] }>('/api/regulations'),
        api<{ data: Model[] }>('/api/ai/models'),
        api<{ data: Key[] }>('/api/ai/keys'),
      ]);
      setRegulations(r.data);
      setModels(m.data.filter((x) => x.enabled));
      setKeys(k.data.filter((x) => x.enabled));
    })().catch(() => {});
  }, []);

  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const submit = async () => {
    setError('');
    if (!title.trim()) { setError('Judul wajib diisi'); return; }
    if (!file && content.trim().length < 50) { setError('Unggah file atau tempel teks dokumen (min. 50 karakter).'); return; }
    setSubmitting(true);
    try {
      const fd = formJson({ title, docType, content, regulationIds: selected, modelId: modelId || null });
      if (file) fd.append('file', file);
      const res = await api<{ data: { id: string } }>('/api/reviews', { method: 'POST', formData: fd });
      setSubmitting(false);
      router.push(`/reviews/${res.data.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal memulai review');
      setSubmitting(false);
    }
  };

  const byokProviderIds = new Set(keys.map((k) => k.providerId));

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 16px' }}>Review Baru</h2>
      {error && <div className="card" style={{ padding: 12, marginBottom: 16, color: 'var(--danger)', borderColor: 'var(--danger)' }}>{error}</div>}

      <div className="card mb-6">
        <div className="card-header"><h3 style={{ margin: 0, fontSize: 16 }}>Dokumen yang Direview</h3></div>
        <div className="card-body">
          <div className="form-group">
            <label className="form-label">Judul Dokumen</label>
            <input className="form-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="mis. Kebijakan Privasi Pelanggan 2026" />
          </div>
          <div className="form-group">
            <label className="form-label">Tipe Dokumen</label>
            <select className="form-select" value={docType} onChange={(e) => setDocType(e.target.value)}>
              {DOC_TYPES.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Unggah File (PDF/DOCX/TXT)</label>
            <input className="form-input" type="file" accept=".pdf,.docx,.doc,.txt,.md" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </div>
          <div className="form-group">
            <label className="form-label">Atau Tempel Teks</label>
            <textarea className="form-textarea" style={{ minHeight: 140 }} value={content} onChange={(e) => setContent(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="card mb-6">
        <div className="card-header">
          <h3 style={{ margin: 0, fontSize: 16 }}>Pilih Regulasi (Bundle)</h3>
          <span className="badge badge-blue">{selected.length} dipilih</span>
        </div>
        <div className="card-body">
          {regulations.length === 0 ? (
            <div className="empty-state"><p>Belum ada regulasi. Tambahkan dulu di menu Regulasi.</p></div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10 }}>
              {regulations.map((r) => (
                <label key={r.id} className={`checkbox-card ${selected.includes(r.id) ? 'selected' : ''}`}>
                  <input type="checkbox" checked={selected.includes(r.id)} onChange={() => toggle(r.id)} />
                  <div>
                    <div style={{ fontWeight: 700 }}>{r.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {r.kind === 'internal' ? 'Internal' : 'Eksternal'}{r.source ? ` · ${r.source}` : ''} · {r.checklist?.length || 0} checklist
                    </div>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card mb-6">
        <div className="card-header"><h3 style={{ margin: 0, fontSize: 16 }}>Model AI</h3></div>
        <div className="card-body">
          <div className="form-hint" style={{ marginBottom: 12 }}>
            Pilih model. Kunci BYOK tenant (jika ada) akan dipakai otomatis; bila tidak ada, kunci platform digunakan.
          </div>
          <select className="form-select" value={modelId} onChange={(e) => setModelId(e.target.value)}>
            <option value="">Otomatis (default)</option>
            {models.map((m) => (
              <option key={m.id} value={m.id}>
                {m.providerName} · {m.name}{byokProviderIds.has(m.providerId) ? ' · BYOK' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button className="btn btn-primary" style={{ padding: '12px 24px', fontSize: 14 }} onClick={submit} disabled={submitting}>
        {submitting ? 'Menjalankan review AI...' : 'Jalankan Review'}
      </button>
    </div>
  );
}
