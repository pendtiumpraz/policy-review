'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/client-api';
import { AiIcon, ReviewIcon, TeamIcon, EditIcon, TrashIcon, RestoreIcon, KeyIcon, PowerIcon, PlusIcon, Logo } from '@/components/icons';

interface Provider { id: string; code: string; name: string; enabled: boolean; base_url: string | null; }
interface Model { id: string; providerId: string; providerName: string; name: string; modelId: string; enabled: boolean; }
interface Tenant { id: string; name: string | null; slug: string | null; token_quota: number | null; brand_primary_color: string | null; }
interface Key { id: string; providerId: string; }

type Tab = 'providers' | 'models' | 'tenants';

const MENU: { key: Tab; label: string; Icon: typeof AiIcon }[] = [
  { key: 'providers', label: 'Provider AI', Icon: AiIcon },
  { key: 'models', label: 'Model', Icon: ReviewIcon },
  { key: 'tenants', label: 'Tenant', Icon: TeamIcon },
];

function fmtQuota(n: number | null | undefined): string {
  if (n == null || n <= 0) return '∞';
  return n.toLocaleString();
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('providers');
  const [trashMode, setTrashMode] = useState(false);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [providersTrash, setProvidersTrash] = useState<Provider[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [modelsTrash, setModelsTrash] = useState<Model[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [tenantsTrash, setTenantsTrash] = useState<Tenant[]>([]);
  const [keys, setKeys] = useState<Key[]>([]);
  const [providerForm, setProviderForm] = useState<{ open: boolean; edit?: Provider }>({ open: false });
  const [modelForm, setModelForm] = useState<{ open: boolean; edit?: Model }>({ open: false });
  const [showTenant, setShowTenant] = useState(false);
  const [keyFor, setKeyFor] = useState<Provider | null>(null);

  const load = useCallback(async () => {
    try {
      const [p, pt, m, mt, t, tt, k] = await Promise.all([
        api<{ data: Provider[] }>('/api/ai/providers'),
        api<{ data: Provider[] }>('/api/ai/providers?trashed=1'),
        api<{ data: Model[] }>('/api/ai/models'),
        api<{ data: Model[] }>('/api/ai/models?trashed=1'),
        api<{ data: Tenant[] }>('/api/tenants'),
        api<{ data: Tenant[] }>('/api/tenants?trashed=1'),
        api<{ data: Key[] }>('/api/ai/keys'),
      ]);
      setProviders(p.data); setProvidersTrash(pt.data);
      setModels(m.data); setModelsTrash(mt.data);
      setTenants(t.data ?? []); setTenantsTrash(tt.data ?? []);
      setKeys(k.data);
    } catch (e) {
      console.error('admin load error', e);
    }
  }, []);

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') { router.push('/login'); return; }
    if ((session?.user as { role?: string })?.role !== 'superadmin') { router.push('/dashboard'); return; }
    load();
  }, [status, session, router, load]);

  if (status !== 'authenticated') return <div className="empty-state">Memuat...</div>;

  const act = (fn: () => Promise<unknown>) => async () => { try { await fn(); } catch (e) { alert(e instanceof Error ? e.message : 'Gagal'); } load(); };

  const toggleProvider = (id: string, enabled: boolean) => act(() => api(`/api/ai/providers/${id}`, { method: 'PATCH', body: { enabled } }));
  const toggleModel = (id: string, enabled: boolean) => act(() => api(`/api/ai/models/${id}`, { method: 'PATCH', body: { enabled } }));
  const restoreProvider = (id: string) => act(() => api(`/api/ai/providers/${id}/restore`, { method: 'POST' }));
  const forceProvider = (id: string) => { if (confirm('Hapus permanen provider ini?')) act(() => api(`/api/ai/providers/${id}/force`, { method: 'DELETE' }))(); };
  const delProvider = (id: string) => act(() => api(`/api/ai/providers/${id}`, { method: 'DELETE' }));
  const restoreModel = (id: string) => act(() => api(`/api/ai/models/${id}/restore`, { method: 'POST' }));
  const forceModel = (id: string) => { if (confirm('Hapus permanen model ini?')) act(() => api(`/api/ai/models/${id}/force`, { method: 'DELETE' }))(); };
  const delModel = (id: string) => act(() => api(`/api/ai/models/${id}`, { method: 'DELETE' }));
  const restoreTenant = (id: string) => act(() => api(`/api/tenants/${id}/restore`, { method: 'POST' }));
  const forceTenant = (id: string) => { if (confirm('Hapus permanen tenant ini?')) act(() => api(`/api/tenants/${id}/force`, { method: 'DELETE' }))(); };
  const delTenant = (id: string) => act(() => api(`/api/tenants/${id}`, { method: 'DELETE' }));
  const keyByProvider = new Map(keys.map((k) => [k.providerId, k]));

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <Logo size={30} />
          <div><div>Superadmin</div><div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 400 }}>Platform</div></div>
        </div>
        <nav>
          {MENU.map((m) => (
            <button key={m.key} className={`menu-item ${tab === m.key ? 'active' : ''}`} style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left' }} onClick={() => { setTab(m.key); setTrashMode(false); }}>
              <m.Icon /><span>{m.label}</span>
            </button>
          ))}
        </nav>
        <div style={{ padding: 14, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button className="btn btn-secondary btn-sm" style={{ width: '100%' }} onClick={() => signOut({ callbackUrl: '/login' })}>Keluar</button>
        </div>
      </aside>

      <main className="app-main">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>{MENU.find((m) => m.key === tab)?.label}</h2>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div className="tabs">
              <button className={`tab ${!trashMode ? 'active' : ''}`} onClick={() => setTrashMode(false)}>Aktif</button>
              <button className={`tab ${trashMode ? 'active' : ''}`} onClick={() => setTrashMode(true)}>Trash <span className="count">{tab === 'providers' ? providersTrash.length : tab === 'models' ? modelsTrash.length : tenantsTrash.length}</span></button>
            </div>
            {!trashMode && tab === 'providers' && <button className="btn btn-primary btn-sm" onClick={() => setProviderForm({ open: true })}><PlusIcon /> Provider</button>}
            {!trashMode && tab === 'models' && <button className="btn btn-primary btn-sm" onClick={() => setModelForm({ open: true })}><PlusIcon /> Model</button>}
            {!trashMode && tab === 'tenants' && <button className="btn btn-primary btn-sm" onClick={() => setShowTenant(true)}><PlusIcon /> Tenant</button>}
          </div>
        </div>

        <div className="card">
          <div className="table-container">
            <table className="data-table">
              {tab === 'providers' && (
                <>
                  <thead><tr><th>Nama</th><th>Code</th><th>Base URL</th><th>Key</th><th>Status</th><th /><th /></tr></thead>
                  <tbody>
                    {trashMode ? providersTrash.map((p) => (
                      <tr key={p.id} style={{ opacity: 0.75 }}>
                        <td style={{ fontWeight: 600 }}>{p.name}</td><td><code>{p.code}</code></td><td style={{ color: 'var(--text-muted)' }}>{p.base_url || '—'}</td><td>—</td>
                        <td><span className="badge badge-gray">Terhapus</span></td>
                        <td /><td><div className="row-actions"><button className="icon-btn" title="Restore" onClick={() => restoreProvider(p.id)}><RestoreIcon /></button><button className="icon-btn danger" title="Hapus permanen" onClick={() => forceProvider(p.id)}><TrashIcon /></button></div></td>
                      </tr>
                    )) : providers.map((p) => (
                      <tr key={p.id}>
                        <td style={{ fontWeight: 600 }}>{p.name}</td><td><code>{p.code}</code></td><td style={{ color: 'var(--text-muted)' }}>{p.base_url || '—'}</td>
                        <td>{keyByProvider.has(p.id) ? <span className="badge badge-green">Ada</span> : <span className="badge badge-gray">Belum</span>}</td>
                        <td><span className={`badge ${p.enabled ? 'badge-green' : 'badge-gray'}`}>{p.enabled ? 'Aktif' : 'Nonaktif'}</span></td>
                        <td /><td>
                          <div className="row-actions">
                            <button className="icon-btn" title="Set key platform" onClick={() => setKeyFor(p)}><KeyIcon /></button>
                            <button className="icon-btn" title="Aktifkan/nonaktifkan" onClick={() => toggleProvider(p.id, !p.enabled)}><PowerIcon /></button>
                            <button className="icon-btn" title="Edit" onClick={() => setProviderForm({ open: true, edit: p })}><EditIcon /></button>
                            <button className="icon-btn danger" title="Hapus" onClick={() => delProvider(p.id)}><TrashIcon /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </>
              )}

              {tab === 'models' && (
                <>
                  <thead><tr><th>Nama</th><th>Provider</th><th>Model ID</th><th>Status</th><th /><th /></tr></thead>
                  <tbody>
                    {trashMode ? modelsTrash.map((m) => (
                      <tr key={m.id} style={{ opacity: 0.75 }}>
                        <td style={{ fontWeight: 600 }}>{m.name}</td><td>{m.providerName}</td><td><code>{m.modelId}</code></td><td><span className="badge badge-gray">Terhapus</span></td>
                        <td /><td><div className="row-actions"><button className="icon-btn" title="Restore" onClick={() => restoreModel(m.id)}><RestoreIcon /></button><button className="icon-btn danger" title="Hapus permanen" onClick={() => forceModel(m.id)}><TrashIcon /></button></div></td>
                      </tr>
                    )) : models.map((m) => (
                      <tr key={m.id}>
                        <td style={{ fontWeight: 600 }}>{m.name}</td><td>{m.providerName}</td><td><code>{m.modelId}</code></td>
                        <td><span className={`badge ${m.enabled ? 'badge-green' : 'badge-gray'}`}>{m.enabled ? 'Aktif' : 'Nonaktif'}</span></td>
                        <td /><td>
                          <div className="row-actions">
                            <button className="icon-btn" title="Aktifkan/nonaktifkan" onClick={() => toggleModel(m.id, !m.enabled)}><PowerIcon /></button>
                            <button className="icon-btn" title="Edit" onClick={() => setModelForm({ open: true, edit: m })}><EditIcon /></button>
                            <button className="icon-btn danger" title="Hapus" onClick={() => delModel(m.id)}><TrashIcon /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </>
              )}

              {tab === 'tenants' && (
                <>
                  <thead><tr><th>Nama</th><th>Slug</th><th>Kuota Token</th><th>Warna</th><th /><th /></tr></thead>
                  <tbody>
                    {trashMode ? tenantsTrash.map((t) => (
                      <tr key={t.id} style={{ opacity: 0.75 }}>
                        <td style={{ fontWeight: 600 }}>{t.name ?? '—'}</td><td>{t.slug ?? '—'}</td><td>{fmtQuota(t.token_quota)}</td>
                        <td><span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 4, background: t.brand_primary_color || '#0f9d58' }} /></td>
                        <td /><td><div className="row-actions"><button className="icon-btn" title="Restore" onClick={() => restoreTenant(t.id)}><RestoreIcon /></button><button className="icon-btn danger" title="Hapus permanen" onClick={() => forceTenant(t.id)}><TrashIcon /></button></div></td>
                      </tr>
                    )) : tenants.map((t) => (
                      <tr key={t.id}>
                        <td style={{ fontWeight: 600 }}>{t.name ?? '—'}</td><td>{t.slug ?? '—'}</td><td>{fmtQuota(t.token_quota)}</td>
                        <td><span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 4, background: t.brand_primary_color || '#0f9d58' }} /></td>
                        <td /><td>
                          <div className="row-actions">
                            <button className="icon-btn" title="Set kuota" onClick={async () => { const q = prompt('Kuota token (0 = tanpa batas):', String(t.token_quota ?? 0)); if (q === null) return; await api(`/api/tenants/${t.id}`, { method: 'PATCH', body: { tokenQuota: Number(q) || 0 } }); load(); }}><EditIcon /></button>
                            <button className="icon-btn danger" title="Hapus" onClick={() => delTenant(t.id)}><TrashIcon /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </>
              )}
            </table>
          </div>
        </div>
      </main>

      {providerForm.open && <ProviderForm edit={providerForm.edit} onClose={() => setProviderForm({ open: false })} onSaved={() => { setProviderForm({ open: false }); load(); }} />}
      {modelForm.open && <ModelForm providers={providers} edit={modelForm.edit} onClose={() => setModelForm({ open: false })} onSaved={() => { setModelForm({ open: false }); load(); }} />}
      {showTenant && <TenantForm onClose={() => setShowTenant(false)} onSaved={() => { setShowTenant(false); load(); }} />}
      {keyFor && <KeyForm provider={keyFor} onClose={() => setKeyFor(null)} onSaved={() => { setKeyFor(null); load(); }} />}
    </div>
  );
}

function KeyForm({ provider, onClose, onSaved }: { provider: Provider; onClose: () => void; onSaved: () => void }) {
  const [apiKey, setApiKey] = useState('');
  const submit = async () => { if (!apiKey.trim()) { alert('Isi API key'); return; } await api('/api/ai/keys', { method: 'POST', body: { providerId: provider.id, apiKey: apiKey.trim() } }); onSaved(); };
  return (
    <>
      <div className="drawer-backdrop" onClick={onClose} />
      <div className="drawer">
        <div className="drawer-header"><h3>Kunci Platform · {provider.name}</h3><button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button></div>
        <div className="drawer-body">
          <div className="form-group">
            <label className="form-label">API Key</label>
            <input className="form-input" type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="bearer token / sk-..." />
            <div className="form-hint">Tersimpan di database (terenkripsi AES-256-GCM). Dipakai semua tenant yang tidak BYOK.</div>
          </div>
        </div>
        <div className="drawer-footer"><button className="btn btn-secondary" onClick={onClose}>Batal</button><button className="btn btn-primary" onClick={submit}>Simpan</button></div>
      </div>
    </>
  );
}

function ProviderForm({ edit, onClose, onSaved }: { edit?: Provider; onClose: () => void; onSaved: () => void }) {
  const [code, setCode] = useState(edit?.code || '');
  const [name, setName] = useState(edit?.name || '');
  const [baseUrl, setBaseUrl] = useState(edit?.base_url || '');
  const onSubmit = () => edit
    ? api(`/api/ai/providers/${edit.id}`, { method: 'PATCH', body: { name, baseUrl: baseUrl || null } })
    : api('/api/ai/providers', { method: 'POST', body: { code, name, baseUrl } });
  return <FormShell title={edit ? 'Edit Provider' : 'Tambah Provider'} onClose={onClose} onSubmit={onSubmit} onSaved={onSaved}>
    {!edit && <div className="form-group"><label className="form-label">Code</label><input className="form-input" value={code} onChange={(e) => setCode(e.target.value)} placeholder="openai / anthropic / 9inference" /></div>}
    <div className="form-group"><label className="form-label">Nama</label><input className="form-input" value={name} onChange={(e) => setName(e.target.value)} /></div>
    <div className="form-group"><label className="form-label">Base URL</label><input className="form-input" value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} /></div>
  </FormShell>;
}

function ModelForm({ providers, edit, onClose, onSaved }: { providers: Provider[]; edit?: Model; onClose: () => void; onSaved: () => void }) {
  const [providerId, setProviderId] = useState(edit?.providerId || providers[0]?.id || '');
  const [name, setName] = useState(edit?.name || '');
  const [modelId, setModelId] = useState(edit?.modelId || '');
  const [description, setDescription] = useState('');
  const onSubmit = () => edit
    ? api(`/api/ai/models/${edit.id}`, { method: 'PATCH', body: { name, modelId } })
    : api('/api/ai/models', { method: 'POST', body: { providerId, name, modelId, description } });
  return <FormShell title={edit ? 'Edit Model' : 'Tambah Model'} onClose={onClose} onSubmit={onSubmit} onSaved={onSaved}>
    {!edit && <div className="form-group"><label className="form-label">Provider</label><select className="form-select" value={providerId} onChange={(e) => setProviderId(e.target.value)}>{providers.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>}
    <div className="form-group"><label className="form-label">Nama Tampilan</label><input className="form-input" value={name} onChange={(e) => setName(e.target.value)} /></div>
    <div className="form-group"><label className="form-label">Model ID</label><input className="form-input" value={modelId} onChange={(e) => setModelId(e.target.value)} placeholder="gpt-4o-mini" /></div>
    {!edit && <div className="form-group"><label className="form-label">Deskripsi</label><input className="form-input" value={description} onChange={(e) => setDescription(e.target.value)} /></div>}
  </FormShell>;
}

function TenantForm({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [tokenQuota, setTokenQuota] = useState(0);
  return <FormShell title="Tambah Tenant" onClose={onClose} onSubmit={() => api('/api/tenants', { method: 'POST', body: { name, slug, tokenQuota: Number(tokenQuota) || 0 } })} onSaved={onSaved}>
    <div className="form-group"><label className="form-label">Nama</label><input className="form-input" value={name} onChange={(e) => setName(e.target.value)} /></div>
    <div className="form-group"><label className="form-label">Slug</label><input className="form-input" value={slug} onChange={(e) => setSlug(e.target.value)} /></div>
    <div className="form-group"><label className="form-label">Kuota Token (0 = ∞)</label><input className="form-input" type="number" value={tokenQuota} onChange={(e) => setTokenQuota(Number(e.target.value))} /></div>
  </FormShell>;
}

function FormShell({ title, onClose, onSubmit, children, onSaved }: {
  title: string; onClose: () => void; onSubmit: () => Promise<unknown>; children: React.ReactNode; onSaved: () => void;
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
          <button className="btn btn-primary" disabled={saving} onClick={async () => { setSaving(true); try { await onSubmit(); onSaved(); } catch (e) { alert(e instanceof Error ? e.message : 'Gagal'); } setSaving(false); }}>Simpan</button>
        </div>
      </div>
    </>
  );
}
