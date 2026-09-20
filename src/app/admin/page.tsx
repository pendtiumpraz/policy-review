'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/client-api';

interface Provider { id: string; code: string; name: string; enabled: boolean; base_url: string | null; }
interface Model { id: string; providerId: string; providerName: string; name: string; modelId: string; enabled: boolean; }
interface Tenant { id: string; name: string; slug: string; token_quota: number; brand_primary_color: string; }

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState<'providers' | 'models' | 'tenants'>('providers');
  const [providers, setProviders] = useState<Provider[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [showProvider, setShowProvider] = useState(false);
  const [showModel, setShowModel] = useState(false);
  const [showTenant, setShowTenant] = useState(false);

  const load = useCallback(async () => {
    const [p, m, t] = await Promise.all([
      api<{ data: Provider[] }>('/api/ai/providers'),
      api<{ data: Model[] }>('/api/ai/models'),
      api<{ data: Tenant[] }>('/api/tenants'),
    ]);
    setProviders(p.data);
    setModels(m.data);
    setTenants(t.data);
  }, []);

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') { router.push('/login'); return; }
    if ((session?.user as { role?: string })?.role !== 'superadmin') { router.push('/dashboard'); return; }
    load();
  }, [status, session, router, load]);

  if (status !== 'authenticated') return <div className="empty-state">Memuat...</div>;

  const toggleProvider = async (id: string, enabled: boolean) => {
    await api(`/api/ai/providers/${id}`, { method: 'PATCH', body: { enabled } });
    load();
  };
  const toggleModel = async (id: string, enabled: boolean) => {
    await api(`/api/ai/models/${id}`, { method: 'PATCH', body: { enabled } });
    load();
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div className="flex items-center gap-3">
          <div className="logo-mark">SA</div>
          <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>Superadmin</h2>
        </div>
        <button className="btn btn-secondary" onClick={() => signOut({ callbackUrl: '/login' })}>Keluar</button>
      </div>

      <div className="tabs mb-6">
        <button className={`tab ${tab === 'providers' ? 'active' : ''}`} onClick={() => setTab('providers')}>Provider AI</button>
        <button className={`tab ${tab === 'models' ? 'active' : ''}`} onClick={() => setTab('models')}>Model</button>
        <button className={`tab ${tab === 'tenants' ? 'active' : ''}`} onClick={() => setTab('tenants')}>Tenant</button>
      </div>

      {tab === 'providers' && (
        <div className="card">
          <div className="card-header">
            <h3 style={{ margin: 0 }}>Provider</h3>
            <button className="btn btn-primary btn-sm" onClick={() => setShowProvider(true)}>+ Provider</button>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead><tr><th>Nama</th><th>Code</th><th>Base URL</th><th>Status</th><th>Aksi</th></tr></thead>
              <tbody>
                {providers.map((p) => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td><code>{p.code}</code></td>
                    <td style={{ color: 'var(--text-muted)' }}>{p.base_url || '—'}</td>
                    <td><span className={`badge ${p.enabled ? 'badge-green' : 'badge-gray'}`}>{p.enabled ? 'Aktif' : 'Nonaktif'}</span></td>
                    <td><button className="btn btn-sm btn-secondary" onClick={() => toggleProvider(p.id, !p.enabled)}>{p.enabled ? 'Nonaktifkan' : 'Aktifkan'}</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'models' && (
        <div className="card">
          <div className="card-header">
            <h3 style={{ margin: 0 }}>Model</h3>
            <button className="btn btn-primary btn-sm" onClick={() => setShowModel(true)}>+ Model</button>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead><tr><th>Nama</th><th>Provider</th><th>Model ID</th><th>Status</th><th>Aksi</th></tr></thead>
              <tbody>
                {models.map((m) => (
                  <tr key={m.id}>
                    <td style={{ fontWeight: 600 }}>{m.name}</td>
                    <td>{m.providerName}</td>
                    <td><code>{m.modelId}</code></td>
                    <td><span className={`badge ${m.enabled ? 'badge-green' : 'badge-gray'}`}>{m.enabled ? 'Aktif' : 'Nonaktif'}</span></td>
                    <td><button className="btn btn-sm btn-secondary" onClick={() => toggleModel(m.id, !m.enabled)}>{m.enabled ? 'Nonaktifkan' : 'Aktifkan'}</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'tenants' && (
        <div className="card">
          <div className="card-header">
            <h3 style={{ margin: 0 }}>Tenant</h3>
            <button className="btn btn-primary btn-sm" onClick={() => setShowTenant(true)}>+ Tenant</button>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead><tr><th>Nama</th><th>Slug</th><th>Kuota Token</th><th>Warna</th><th>Aksi</th></tr></thead>
              <tbody>
                {tenants.map((t) => (
                  <tr key={t.id}>
                    <td style={{ fontWeight: 600 }}>{t.name}</td>
                    <td>{t.slug}</td>
                    <td>{t.token_quota === 0 ? '∞' : t.token_quota.toLocaleString()}</td>
                    <td><span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 4, background: t.brand_primary_color }} /></td>
                    <td><button className="btn btn-sm btn-secondary" onClick={async () => {
                      const q = prompt('Kuota token (0 = tanpa batas):', String(t.token_quota));
                      if (q === null) return;
                      await api(`/api/tenants/${t.id}`, { method: 'PATCH', body: { tokenQuota: Number(q) || 0 } });
                      load();
                    }}>Set Kuota</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showProvider && <ProviderForm onClose={() => setShowProvider(false)} onSaved={() => { setShowProvider(false); load(); }} />}
      {showModel && <ModelForm providers={providers} onClose={() => setShowModel(false)} onSaved={() => { setShowModel(false); load(); }} />}
      {showTenant && <TenantForm onClose={() => setShowTenant(false)} onSaved={() => { setShowTenant(false); load(); }} />}
    </div>
  );
}

function ProviderForm({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const submit = async () => {
    await api('/api/ai/providers', { method: 'POST', body: { code, name, baseUrl } });
    onSaved();
  };
  return <FormShell title="Tambah Provider" onClose={onClose} onSubmit={submit} onSaved={onSaved}>
    <div className="form-group"><label className="form-label">Code</label><input className="form-input" value={code} onChange={(e) => setCode(e.target.value)} placeholder="openai / anthropic / ..." /></div>
    <div className="form-group"><label className="form-label">Nama</label><input className="form-input" value={name} onChange={(e) => setName(e.target.value)} /></div>
    <div className="form-group"><label className="form-label">Base URL</label><input className="form-input" value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} /></div>
  </FormShell>;
}

function ModelForm({ providers, onClose, onSaved }: { providers: Provider[]; onClose: () => void; onSaved: () => void }) {
  const [providerId, setProviderId] = useState(providers[0]?.id || '');
  const [name, setName] = useState('');
  const [modelId, setModelId] = useState('');
  const [description, setDescription] = useState('');
  const submit = async () => {
    await api('/api/ai/models', { method: 'POST', body: { providerId, name, modelId, description } });
    onSaved();
  };
  return <FormShell title="Tambah Model" onClose={onClose} onSubmit={submit} onSaved={onSaved}>
    <div className="form-group"><label className="form-label">Provider</label><select className="form-select" value={providerId} onChange={(e) => setProviderId(e.target.value)}>{providers.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
    <div className="form-group"><label className="form-label">Nama Tampilan</label><input className="form-input" value={name} onChange={(e) => setName(e.target.value)} /></div>
    <div className="form-group"><label className="form-label">Model ID</label><input className="form-input" value={modelId} onChange={(e) => setModelId(e.target.value)} placeholder="gpt-4o-mini" /></div>
    <div className="form-group"><label className="form-label">Deskripsi</label><input className="form-input" value={description} onChange={(e) => setDescription(e.target.value)} /></div>
  </FormShell>;
}

function TenantForm({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [tokenQuota, setTokenQuota] = useState(0);
  const submit = async () => {
    await api('/api/tenants', { method: 'POST', body: { name, slug, tokenQuota: Number(tokenQuota) || 0 } });
    onSaved();
  };
  return <FormShell title="Tambah Tenant" onClose={onClose} onSubmit={submit} onSaved={onSaved}>
    <div className="form-group"><label className="form-label">Nama</label><input className="form-input" value={name} onChange={(e) => setName(e.target.value)} /></div>
    <div className="form-group"><label className="form-label">Slug</label><input className="form-input" value={slug} onChange={(e) => setSlug(e.target.value)} /></div>
    <div className="form-group"><label className="form-label">Kuota Token (0 = ∞)</label><input className="form-input" type="number" value={tokenQuota} onChange={(e) => setTokenQuota(Number(e.target.value))} /></div>
  </FormShell>;
}

function FormShell({ title, onClose, onSubmit, children, onSaved }: {
  title: string; onClose: () => void; onSubmit: () => Promise<void>; children: React.ReactNode; onSaved: () => void;
}) {
  const [saving, setSaving] = useState(false);
  return (
    <>
      <div className="drawer-backdrop" onClick={onClose} />
      <div className="drawer">
        <div className="drawer-header"><h3>{title}</h3><button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button></div>
        <div className="drawer-body">{children}</div>
        <div className="drawer-footer">
          <button className="btn btn-secondary" onClick={onClose}>Batal</button>
          <button className="btn btn-primary" disabled={saving} onClick={async () => { setSaving(true); try { await onSubmit(); } catch (e) { alert(e instanceof Error ? e.message : 'Gagal'); } setSaving(false); }}>Simpan</button>
        </div>
      </div>
    </>
  );
}
