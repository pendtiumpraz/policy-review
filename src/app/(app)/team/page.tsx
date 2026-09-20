'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/client-api';

interface Member { id: string; name: string | null; email: string; role: string; status: string; }

export default function TeamPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'member' });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const r = await api<{ data: Member[] }>('/api/team');
    setMembers(r.data);
  }, []);

  useEffect(() => { load(); }, [load]);

  const submit = async () => {
    setSaving(true);
    try {
      await api('/api/team', { method: 'POST', body: form });
      setShow(false);
      setForm({ name: '', email: '', password: '', role: 'member' });
      load();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Gagal');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Anggota</h2>
        <button className="btn btn-primary" onClick={() => setShow(true)}>+ Tambah Anggota</button>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="data-table">
            <thead><tr><th>Nama</th><th>Email</th><th>Role</th></tr></thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id}>
                  <td style={{ fontWeight: 600 }}>{m.name || '—'}</td>
                  <td>{m.email}</td>
                  <td><span className={`badge ${m.role === 'admin' ? 'badge-blue' : 'badge-gray'}`}>{m.role}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {show && (
        <>
          <div className="drawer-backdrop" onClick={() => setShow(false)} />
          <div className="drawer">
            <div className="drawer-header"><h3>Tambah Anggota</h3><button className="btn btn-ghost btn-icon" onClick={() => setShow(false)}>✕</button></div>
            <div className="drawer-body">
              <div className="form-group"><label className="form-label">Nama</label><input className="form-input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></div>
              <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} /></div>
              <div className="form-group"><label className="form-label">Password</label><input className="form-input" type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} /></div>
              <div className="form-group">
                <label className="form-label">Role</label>
                <select className="form-select" value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}>
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="drawer-footer">
              <button className="btn btn-secondary" onClick={() => setShow(false)}>Batal</button>
              <button className="btn btn-primary" onClick={submit} disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
