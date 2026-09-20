'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/client-api';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', orgName: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api('/api/auth/register', { method: 'POST', body: form });
      router.push('/login?registered=1');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mendaftar');
    } finally {
      setLoading(false);
    }
  };

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <form onSubmit={submit} className="card" style={{ width: 400, padding: 32 }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>Buat organisasi baru</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 20 }}>
          Organisasi Anda menjadi tenant terisolasi dengan kunci AI sendiri.
        </p>
        <div className="form-group">
          <label className="form-label">Nama Anda</label>
          <input className="form-input" value={form.name} onChange={set('name')} />
        </div>
        <div className="form-group">
          <label className="form-label">Nama Organisasi</label>
          <input className="form-input" value={form.orgName} onChange={set('orgName')} />
        </div>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input className="form-input" type="email" value={form.email} onChange={set('email')} />
        </div>
        <div className="form-group">
          <label className="form-label">Password (min. 8 karakter)</label>
          <input className="form-input" type="password" value={form.password} onChange={set('password')} />
        </div>
        {error && <div style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 12 }}>{error}</div>}
        <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
          {loading ? 'Mendaftar...' : 'Daftar'}
        </button>
        <div style={{ marginTop: 16, textAlign: 'center', fontSize: 13, color: 'var(--text-secondary)' }}>
          Sudah punya akun? <Link href="/login" style={{ color: 'var(--primary)' }}>Masuk</Link>
        </div>
      </form>
    </div>
  );
}
