'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/client-api';

interface Model { id: string; providerId: string; providerCode: string; providerName: string; name: string; modelId: string; enabled: boolean; }
interface Key { id: string; providerId: string; providerCode: string; providerName: string; enabled: boolean; }
interface Provider { id: string; code: string; name: string; enabled: boolean; }
interface Usage { total: number; quota: number; unlimited: boolean; remaining: number | null; }

export default function AiPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [keys, setKeys] = useState<Key[]>([]);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [drawer, setDrawer] = useState<Provider | null>(null);

  const load = useCallback(async () => {
    const [p, m, k, u] = await Promise.all([
      api<{ data: Provider[] }>('/api/ai/providers'),
      api<{ data: Model[] }>('/api/ai/models'),
      api<{ data: Key[] }>('/api/ai/keys'),
      api<{ data: Usage }>('/api/ai/usage'),
    ]);
    setProviders(p.data.filter((x) => x.enabled));
    setModels(m.data);
    setKeys(k.data);
    setUsage(u.data);
  }, []);

  useEffect(() => { load(); }, [load]);

  const keyByProvider = new Map(keys.map((k) => [k.providerId, k]));

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 16px' }}>AI & Kunci</h2>

      {usage && (
        <div className="kpi-grid mb-6">
          <div className="kpi-card"><h3>{usage.total.toLocaleString()}</h3><p>Token Terpakai</p></div>
          <div className="kpi-card"><h3>{usage.unlimited ? '∞' : usage.quota.toLocaleString()}</h3><p>Kuota</p></div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h3 style={{ margin: 0, fontSize: 16 }}>Provider AI & BYOK</h3>
        </div>
        <div className="card-body">
          <div className="form-hint" style={{ marginBottom: 16 }}>
            Provider & model dikelola superadmin. Anda (tenant) dapat membawa kunci sendiri (BYOK) per provider,
            atau memakai kunci platform bila tersedia. Data & kunci tiap tenant terisolasi.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
            {providers.map((p) => {
              const key = keyByProvider.get(p.id);
              const providerModels = models.filter((m) => m.providerId === p.id && m.enabled);
              return (
                <div className="card" key={p.id} style={{ padding: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ fontWeight: 800, textTransform: 'capitalize' }}>{p.name}</div>
                    {key?.enabled ? <span className="badge badge-green">BYOK</span> : <span className="badge badge-gray">Platform</span>}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
                    {providerModels.length} model · {providerModels.slice(0, 3).map((m) => m.modelId).join(', ')}
                  </div>
                  <button className="btn btn-sm btn-secondary" onClick={() => setDrawer(p)}>{key ? 'Kelola Kunci' : 'Tambah Kunci (BYOK)'}</button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {drawer && (
        <KeyDrawer provider={drawer} existing={keyByProvider.get(drawer.id)} onClose={() => setDrawer(null)} onSaved={() => { setDrawer(null); load(); }} />
      )}
    </div>
  );
}

function KeyDrawer({ provider, existing, onClose, onSaved }: {
  provider: Provider; existing?: Key; onClose: () => void; onSaved: () => void;
}) {
  const [apiKey, setApiKey] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!existing && !apiKey.trim()) { alert('Isi API key'); return; }
    setSaving(true);
    try {
      if (existing) {
        await api(`/api/ai/keys/${existing.id}`, { method: 'PATCH', body: apiKey.trim() ? { apiKey: apiKey, enabled: existing.enabled } : { enabled: existing.enabled } });
      } else {
        await api('/api/ai/keys', { method: 'POST', body: { providerId: provider.id, apiKey: apiKey.trim() } });
      }
      onSaved();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Gagal menyimpan');
    } finally {
      setSaving(false);
    }
  };

  const disable = async () => {
    if (!existing) return;
    await api(`/api/ai/keys/${existing.id}`, { method: 'PATCH', body: { enabled: false } });
    onSaved();
  };

  return (
    <>
      <div className="drawer-backdrop" onClick={onClose} />
      <div className="drawer">
        <div className="drawer-header"><h3>Kunci {provider.name}</h3><button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button></div>
        <div className="drawer-body">
          <div className="form-group">
            <label className="form-label">API Key {existing ? '(biarkan kosong untuk tetap)' : ''}</label>
            <input className="form-input" type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="sk-..." />
            <div className="form-hint">Kunci dienkripsi (AES-256-GCM) sebelum disimpan.</div>
          </div>
        </div>
        <div className="drawer-footer">
          {existing && <button className="btn btn-danger" onClick={disable}>Nonaktifkan</button>}
          <button className="btn btn-secondary" onClick={onClose}>Batal</button>
          <button className="btn btn-primary" onClick={submit} disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</button>
        </div>
      </div>
    </>
  );
}
