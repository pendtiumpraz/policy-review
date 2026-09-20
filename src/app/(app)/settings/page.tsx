'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/client-api';

interface Settings { id: string; name: string; slug: string; brandPrimaryColor: string; brandLogoUrl: string | null; tokenQuota: number; }

export default function SettingsPage() {
  const [s, setS] = useState<Settings | null>(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#10b981');
  const [logo, setLogo] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api<{ data: Settings }>('/api/settings').then((r) => {
      setS(r.data);
      setName(r.data.name);
      setColor(r.data.brandPrimaryColor);
      setLogo(r.data.brandLogoUrl || '');
    }).catch(() => {});
  }, []);

  const save = async () => {
    setSaving(true);
    await api('/api/settings', { method: 'PATCH', body: { name, brandPrimaryColor: color, brandLogoUrl: logo || null } });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!s) return <div className="empty-state">Memuat...</div>;

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 16px' }}>Pengaturan & Branding</h2>
      <div className="card" style={{ maxWidth: 560 }}>
        <div className="card-header"><h3 style={{ margin: 0, fontSize: 16 }}>White-label Tenant</h3></div>
        <div className="card-body">
          <div className="form-group">
            <label className="form-label">Nama Organisasi</label>
            <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Warna Brand (Primary)</label>
            <div className="flex items-center gap-3">
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)} style={{ width: 44, height: 44, border: 'none', background: 'none', cursor: 'pointer' }} />
              <input className="form-input" value={color} onChange={(e) => setColor(e.target.value)} />
            </div>
            <div className="form-hint">Mis. hijau Pegadaian <code>#1b9e4b</code>.</div>
          </div>
          <div className="form-group">
            <label className="form-label">URL Logo (opsional)</label>
            <input className="form-input" value={logo} onChange={(e) => setLogo(e.target.value)} placeholder="https://..." />
          </div>
          <button className="btn btn-primary" onClick={save} disabled={saving}>
            {saving ? 'Menyimpan...' : saved ? 'Tersimpan ✓' : 'Simpan'}
          </button>
        </div>
      </div>
      <div className="form-hint" style={{ marginTop: 12 }}>Kuota token tenant diatur oleh superadmin ({s.tokenQuota === 0 ? 'tanpa batas' : s.tokenQuota.toLocaleString()}).</div>
    </div>
  );
}
