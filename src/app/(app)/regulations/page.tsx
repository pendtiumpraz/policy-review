'use client';

import { useEffect, useState, useCallback } from 'react';
import { api, formJson } from '@/lib/client-api';

interface Regulation {
  id: string;
  title: string;
  kind: string;
  source: string | null;
  description: string | null;
  checklist: { id: string; text: string }[];
  file_name: string | null;
  created_at: string;
}

export default function RegulationsPage() {
  const [active, setActive] = useState<Regulation[]>([]);
  const [trash, setTrash] = useState<Regulation[]>([]);
  const [tab, setTab] = useState<'external' | 'internal'>('external');
  const [trashMode, setTrashMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [drawer, setDrawer] = useState<{ open: boolean; edit?: Regulation }>({ open: false });

  const load = useCallback(async () => {
    const [a, t] = await Promise.all([
      api<{ data: Regulation[] }>('/api/regulations'),
      api<{ data: Regulation[] }>('/api/regulations?trashed=1'),
    ]);
    setActive(a.data);
    setTrash(t.data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = active.filter((r) => r.kind === tab);

  const remove = async (id: string) => {
    if (!confirm('Pindahkan regulasi ini ke Trash?')) return;
    await api(`/api/regulations/${id}`, { method: 'DELETE' });
    load();
  };
  const restore = async (id: string) => {
    await api(`/api/regulations/${id}/restore`, { method: 'POST' });
    load();
  };
  const hardDelete = async (id: string) => {
    if (!confirm('Hapus permanen? Tindakan ini tidak bisa dibatalkan.')) return;
    await api(`/api/regulations/${id}/force`, { method: 'DELETE' });
    load();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Regulasi</h2>
        {!trashMode && <button className="btn btn-primary" onClick={() => setDrawer({ open: true })}>+ Tambah Regulasi</button>}
      </div>

      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16 }}>
        <div className="tabs">
          <button className={`tab ${!trashMode && tab === 'external' ? 'active' : ''}`} onClick={() => { setTrashMode(false); setTab('external'); }}>Eksternal</button>
          <button className={`tab ${!trashMode && tab === 'internal' ? 'active' : ''}`} onClick={() => { setTrashMode(false); setTab('internal'); }}>Internal</button>
          <button className={`tab ${trashMode ? 'active' : ''}`} onClick={() => setTrashMode(true)}>Trash <span className="count">{trash.length}</span></button>
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Judul</th>
                <th>Jenis</th>
                <th>Sumber</th>
                <th>Checklist</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="empty-state">Memuat...</td></tr>
              ) : trashMode ? (
                trash.length === 0 ? <tr><td colSpan={5} className="empty-state"><h3>Trash kosong</h3></td></tr> :
                trash.map((r) => (
                  <tr key={r.id} style={{ opacity: 0.7 }}>
                    <td style={{ fontWeight: 600 }}>{r.title}</td>
                    <td><span className="badge badge-gray">{r.kind === 'internal' ? 'Internal' : 'Eksternal'}</span></td>
                    <td style={{ color: 'var(--text-secondary)' }}>{r.source || '—'}</td>
                    <td><span className="badge badge-blue">{r.checklist?.length || 0}</span></td>
                    <td>
                      <div className="flex gap-2">
                        <button className="btn btn-sm btn-secondary" onClick={() => restore(r.id)}>Restore</button>
                        <button className="btn btn-sm btn-danger" onClick={() => hardDelete(r.id)}>Hapus Permanen</button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="empty-state">
                  <h3>Belum ada regulasi {tab === 'internal' ? 'internal' : 'eksternal'}</h3>
                  <p>Unggah peraturan eksternal (UU, peraturan pemerintah) atau kebijakan internal.</p>
                </td></tr>
              ) : filtered.map((r) => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 600 }}>{r.title}</td>
                  <td><span className="badge badge-blue">{r.kind === 'internal' ? 'Internal' : 'Eksternal'}</span></td>
                  <td style={{ color: 'var(--text-secondary)' }}>{r.source || '—'}</td>
                  <td><span className="badge badge-blue">{r.checklist?.length || 0} item</span></td>
                  <td>
                    <div className="flex gap-2">
                      <button className="btn btn-sm btn-secondary" onClick={() => setDrawer({ open: true, edit: r })}>Edit</button>
                      <button className="btn btn-sm btn-danger" onClick={() => remove(r.id)}>Hapus</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {drawer.open && (
        <RegulationDrawer
          edit={drawer.edit}
          kind={tab}
          onClose={() => setDrawer({ open: false })}
          onSaved={() => { setDrawer({ open: false }); load(); }}
        />
      )}
    </div>
  );
}

function RegulationDrawer({ edit, kind, onClose, onSaved }: {
  edit?: Regulation; kind: string; onClose: () => void; onSaved: () => void;
}) {
  const [title, setTitle] = useState(edit?.title || '');
  const [source, setSource] = useState(edit?.source || '');
  const [description, setDescription] = useState(edit?.description || '');
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [checklistText, setChecklistText] = useState((edit?.checklist || []).map((c) => c.text).join('\n'));
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!title.trim()) { alert('Judul wajib diisi'); return; }
    setSaving(true);
    try {
      const checkpointed = checklistText.split('\n').filter((l) => l.trim()).map((text) => ({ id: crypto.randomUUID(), text: text.trim() }));
      if (edit) {
        await api(`/api/regulations/${edit.id}`, {
          method: 'PATCH',
          body: { title, source, description, content: content || undefined, kind: edit.kind, checklist: checkpointed },
        });
      } else {
        const fd = formJson({ title, source, description, kind, content, checklist: checkpointed });
        if (file) fd.append('file', file);
        await api('/api/regulations', { method: 'POST', formData: fd });
      }
      onSaved();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Gagal menyimpan');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="drawer-backdrop" onClick={onClose} />
      <div className="drawer">
        <div className="drawer-header">
          <h3>{edit ? 'Edit Regulasi' : 'Tambah Regulasi'}</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="drawer-body">
          <div className="form-group">
            <label className="form-label">Judul</label>
            <input className="form-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="mis. UU No. 27 Tahun 2022 tentang PDP" />
          </div>
          <div className="form-group">
            <label className="form-label">Sumber / Penerbit</label>
            <input className="form-input" value={source} onChange={(e) => setSource(e.target.value)} placeholder="mis. Pemerintah RI / Kebijakan Internal" />
          </div>
          <div className="form-group">
            <label className="form-label">Deskripsi</label>
            <textarea className="form-textarea" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Unggah Dokumen (PDF/DOCX/TXT)</label>
            <input className="form-input" type="file" accept=".pdf,.docx,.doc,.txt,.md" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            <div className="form-hint">Konten akan diekstrak otomatis untuk analisis AI.</div>
          </div>
          <div className="form-group">
            <label className="form-label">Tempel Teks (opsional)</label>
            <textarea className="form-textarea" value={content} onChange={(e) => setContent(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Checklist (satu item per baris)</label>
            <textarea className="form-textarea" value={checklistText} onChange={(e) => setChecklistText(e.target.value)} placeholder={'Ada dasar hukum pemrosesan data\nAda ketentuan masa retensi'} />
            <div className="form-hint">Checklist ini akan ditinjau satu per satu saat review.</div>
          </div>
        </div>
        <div className="drawer-footer">
          <button className="btn btn-secondary" onClick={onClose}>Batal</button>
          <button className="btn btn-primary" onClick={submit} disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</button>
        </div>
      </div>
    </>
  );
}
