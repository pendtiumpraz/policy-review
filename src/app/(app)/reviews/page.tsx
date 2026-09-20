'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { api } from '@/lib/client-api';

interface Review {
  id: string;
  title: string;
  doc_type: string;
  risk_score: number;
  status: string;
  created_at: string;
}

const STATUS: Record<string, { label: string; cls: string }> = {
  completed: { label: 'Selesai', cls: 'badge-green' },
  processing: { label: 'Memproses', cls: 'badge-amber' },
  pending: { label: 'Menunggu', cls: 'badge-amber' },
  failed: { label: 'Gagal', cls: 'badge-red' },
};

export default function ReviewsPage() {
  const [mode, setMode] = useState<'active' | 'trash'>('active');
  const [active, setActive] = useState<Review[]>([]);
  const [trash, setTrash] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    const [a, t] = await Promise.all([
      api<{ data: Review[] }>('/api/reviews'),
      api<{ data: Review[] }>('/api/reviews?trashed=1'),
    ]);
    setActive(a.data);
    setTrash(t.data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const list = (mode === 'active' ? active : trash).filter(
    (r) => r.title?.toLowerCase().includes(search.toLowerCase()) || r.doc_type?.toLowerCase().includes(search.toLowerCase()),
  );

  const del = async (id: string) => {
    if (!confirm('Pindahkan review ini ke trash?')) return;
    await api(`/api/reviews/${id}`, { method: 'DELETE' });
    load();
  };
  const restore = async (id: string) => {
    await api(`/api/reviews/${id}/restore`, { method: 'POST' });
    load();
  };
  const hardDelete = async (id: string) => {
    if (!confirm('Hapus permanen review ini?')) return;
    await api(`/api/reviews/${id}/force`, { method: 'DELETE' });
    load();
  };

  const avg = active.length ? Math.round(active.reduce((a, r) => a + (r.risk_score || 0), 0) / active.length) : '—';

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Review Kebijakan</h2>
        <Link href="/reviews/new" className="btn btn-primary">+ Review Baru</Link>
      </div>

      <div className="kpi-grid mb-4">
        <div className="kpi-card"><h3>{active.length}</h3><p>Total Review</p></div>
        <div className="kpi-card"><h3>{avg}</h3><p>Rata-rata Skor</p></div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="tabs">
            <button className={`tab ${mode === 'active' ? 'active' : ''}`} onClick={() => setMode('active')}>Aktif <span className="count">{active.length}</span></button>
            <button className={`tab ${mode === 'trash' ? 'active' : ''}`} onClick={() => setMode('trash')}>Trash <span className="count">{trash.length}</span></button>
          </div>
          <input className="form-input" style={{ width: 240 }} placeholder="Cari..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="table-container">
          <table className="data-table">
            <thead><tr><th>Judul</th><th>Tipe</th><th>Skor</th><th>Status</th><th>Tanggal</th><th>Aksi</th></tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="empty-state">Memuat...</td></tr>
              ) : list.length === 0 ? (
                <tr><td colSpan={6} className="empty-state"><h3>Belum ada review</h3><p>Mulai review kebijakan atau SOP Anda.</p></td></tr>
              ) : list.map((r) => {
                const s = STATUS[r.status] || { label: r.status, cls: 'badge-gray' };
                return (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 600 }}>{r.title}</td>
                    <td><span className="badge badge-blue">{r.doc_type?.replace(/_/g, ' ')}</span></td>
                    <td><span style={{ fontWeight: 800, fontSize: 16, color: (r.risk_score || 0) >= 70 ? 'var(--success)' : (r.risk_score || 0) >= 40 ? 'var(--warning)' : 'var(--danger)' }}>{r.risk_score || 0}</span></td>
                    <td><span className={`badge ${s.cls}`}>{s.label}</span></td>
                    <td style={{ color: 'var(--text-muted)' }}>{new Date(r.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    <td>
                      <div className="flex gap-2">
                        {mode === 'active' ? (
                          <>
                            <Link href={`/reviews/${r.id}`} className="btn btn-sm btn-secondary">Lihat</Link>
                            <button className="btn btn-sm btn-danger" onClick={() => del(r.id)}>Hapus</button>
                          </>
                        ) : (
                          <>
                            <button className="btn btn-sm btn-secondary" onClick={() => restore(r.id)}>Restore</button>
                            <button className="btn btn-sm btn-danger" onClick={() => hardDelete(r.id)}>Hapus Permanen</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
