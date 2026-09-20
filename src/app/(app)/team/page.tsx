'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/client-api';

interface Member { id: string; name: string | null; email: string; role: string; status: string; }

export default function TeamPage() {
  const [active, setActive] = useState<Member[]>([]);
  const [trash, setTrash] = useState<Member[]>([]);
  const [trashMode, setTrashMode] = useState(false);
  const [drawer, setDrawer] = useState<{ open: boolean; edit?: Member }>({ open: false });

  const load = useCallback(async () => {
    const [a, t] = await Promise.all([
      api<{ data: Member[] }>('/api/team'),
      api<{ data: Member[] }>('/api/team?trashed=1'),
    ]);
    setActive(a.data);
    setTrash(t.data);
  }, []);

  useEffect(() => { load(); }, [load]);

  const remove = async (id: string) => {
    if (!confirm('Pindahkan anggota ini ke Trash?')) return;
    await api(`/api/team/${id}`, { method: 'DELETE' });
    load();
  };
  const hardDelete = async (id: string) => {
    if (!confirm('Hapus permanen anggota ini?')) return;
    await api(`/api/team/${id}/force`, { method: 'DELETE' });
    load();
  };
  const restore = async (id: string) => {
    await api(`/api/team/${id}/restore`, { method: 'POST' });
    load();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Anggota</h2>
        {!trashMode && <button className="btn btn-primary" onClick={() => setDrawer({ open: true })}>+ Tambah Anggota</button>}
      </div>

      <div className="tabs mb-4">
        <button className={`tab ${!trashMode ? 'active' : ''}`} onClick={() => setTrashMode(false)}>Aktif <span className="count">{active.length}</span></button>
        <button className={`tab ${trashMode ? 'active' : ''}`} onClick={() => setTrashMode(true)}>Trash <span className="count">{trash.length}</span></button>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="data-table">
            <thead><tr><th>Nama</th><th>Email</th><th>Role</th><th>Aksi</th></tr></thead>
            <tbody>
              {trashMode ? (
                trash.length === 0 ? <tr><td colSpan={4} className="empty-state"><h3>Trash kosong</h3></td></tr> :
                trash.map((m) => (
                  <tr key={m.id} style={{ opacity: 0.7 }}>
                    <td style={{ fontWeight: 600 }}>{m.name || '—'}</td>
                    <td>{m.email}</td>
                    <td><span className="badge badge-gray">{m.role}</span></td>
                    <td>
                      <div className="flex gap-2">
                        <button className="btn btn-sm btn-secondary" onClick={() => restore(m.id)}>Restore</button>
                        <button className="btn btn-sm btn-danger" onClick={() => hardDelete(m.id)}>Hapus Permanen</button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : active.length === 0 ? (
                <tr><td colSpan={4} className="empty-state"><h3>Belum ada anggota</h3></td></tr>
              ) : active.map((m) => (
                <tr key={m.id}>
                  <td style={{ fontWeight: 600 }}>{m.name || '—'}</td>
                  <td>{m.email}</td>
                  <td><span className={`badge ${m.role === 'admin' ? 'badge-blue' : 'badge-gray'}`}>{m.role}</span></td>
                  <td>
                    <div className="flex gap-2">
                      <button className="btn btn-sm btn-secondary" onClick={() => setDrawer({ open: true, edit: m })}>Edit</button>
                      <button className="btn btn-sm btn-danger" onClick={() => remove(m.id)}>Hapus</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {drawer.open && (
        <MemberDrawer
          edit={drawer.edit}
          onClose={() => setDrawer({ open: false })}
          onSaved={() => { setDrawer({ open: false }); load(); }}
        />
      )}
    </div>
  );
}

function MemberDrawer({ edit, onClose, onSaved }: { edit?: Member; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ name: edit?.name || '', email: edit?.email || '', password: '', role: edit?.role || 'member' });
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    setSaving(true);
    try {
      if (edit) {
        await api(`/api/team/${edit.id}`, { method: 'PATCH', body: { name: form.name, role: form.role } });
      } else {
        await api('/api/team', { method: 'POST', body: form });
      }
      onSaved();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Gagal');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="drawer-backdrop" onClick={onClose} />
      <div className="drawer">
        <div className="drawer-header"><h3>{edit ? 'Edit Anggota' : 'Tambah Anggota'}</h3><button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button></div>
        <div className="drawer-body">
          <div className="form-group"><label className="form-label">Nama</label><input className="form-input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></div>
          {!edit && <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} /></div>}
          {!edit && <div className="form-group"><label className="form-label">Password</label><input className="form-input" type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} /></div>}
          <div className="form-group">
            <label className="form-label">Role</label>
            <select className="form-select" value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}>
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
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
