'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/client-api';
import { DocIcon } from '@/components/icons';

interface Review { id: string; title: string; docType: string; riskScore: number; status: string; createdAt: string; }
interface Regulation { id: string; kind: string; }

export default function DashboardPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [regs, setRegs] = useState<Regulation[]>([]);
  const [usage, setUsage] = useState<{ total: number; quota: number; unlimited: boolean } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [r, g, u] = await Promise.all([
        api<{ data: Review[] }>('/api/reviews'),
        api<{ data: Regulation[] }>('/api/regulations'),
        api<{ data: { total: number; quota: number; unlimited: boolean } }>('/api/ai/usage'),
      ]);
      setReviews(r.data.filter((x) => x.status === 'completed'));
      setRegs(g.data);
      setUsage(u.data);
      setLoading(false);
    })().catch(() => setLoading(false));
  }, []);

  const avg = reviews.length ? Math.round(reviews.reduce((a, r) => a + (r.riskScore || 0), 0) / reviews.length) : '—';
  const internal = regs.filter((r) => r.kind === 'internal').length;
  const external = regs.filter((r) => r.kind === 'external').length;

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 16px' }}>Dashboard</h2>
      <div className="kpi-grid mb-6">
        {[
          { label: 'Total Review', value: reviews.length },
          { label: 'Rata-rata Skor', value: avg },
          { label: 'Regulasi Internal', value: internal },
          { label: 'Regulasi Eksternal', value: external },
        ].map((c, i) => (
          <div className="kpi-card" key={i}>
            <h3>{c.value}</h3>
            <p>{c.label}</p>
          </div>
        ))}
      </div>

      {usage && (
        <div className="card mb-6" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 700 }}>Kuota Token</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {usage.unlimited ? 'Kuota tanpa batas' : `${usage.quota.toLocaleString()} token`}
              </div>
            </div>
            <div style={{ fontWeight: 800, color: !usage.unlimited && usage.total >= usage.quota ? 'var(--danger)' : 'var(--primary)' }}>
              {usage.total.toLocaleString()} token terpakai
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h3 style={{ margin: 0, fontSize: 16 }}>Review Terbaru</h3>
          <Link href="/reviews/new" className="btn btn-primary">+ Review Baru</Link>
        </div>
        {loading ? (
          <div className="empty-state">Memuat...</div>
        ) : reviews.length === 0 ? (
          <div className="empty-state">
            <div className="feat-ic" style={{ width: 52, height: 52, borderRadius: 14 }}><DocIcon /></div>
            <h3>Belum ada review</h3>
            <p>Mulai review kebijakan atau SOP perusahaan Anda.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead><tr><th>Judul</th><th>Skor</th><th>Tanggal</th></tr></thead>
              <tbody>
                {reviews.slice(0, 8).map((r) => (
                  <tr key={r.id}>
                    <td><Link href={`/reviews/${r.id}`} style={{ fontWeight: 600 }}>{r.title}</Link></td>
                    <td><span className="badge badge-green">{r.riskScore}</span></td>
                    <td style={{ color: 'var(--text-muted)' }}>{new Date(r.createdAt).toLocaleDateString('id-ID')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
