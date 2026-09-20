'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/client-api';
import { Logo } from '@/components/icons';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', orgName: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api('/api/auth/register', { method: 'POST', body: form });
      router.push('/login?registered=1');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mendaftar');
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#f7faf8' }}>
      <div className="auth-brand" style={{ flex: '1 1 52%', display: 'none' }}>
        <div style={{ padding: 40, maxWidth: 460 }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontWeight: 800, fontSize: 20, color: '#fff', marginBottom: '11vh' }}>
            <Logo size={34} tone="light" />
            PolicyReview<span style={{ opacity: 0.6 }}>.</span>
          </Link>
          <h1 style={{ color: '#fff', fontSize: 38, lineHeight: 1.15, fontWeight: 900, letterSpacing: '-0.03em', margin: '0 0 16px' }}>
            Tenant Anda sendiri,<br /><em style={{ fontStyle: 'normal', color: '#a8f0c6' }}>terisolasi penuh</em>.
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: 15, lineHeight: 1.7 }}>
            Data, kunci AI (BYOK), kuota token, dan hasil review tiap organisasi dipisah dari organisasi lain.
          </p>
        </div>
      </div>

      <div style={{ flex: '1 1 48%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <form onSubmit={submit} style={{ width: 400 }}>
          <div style={{ marginBottom: 26 }}>
            <h2 style={{ fontSize: 26, fontWeight: 900, margin: 0, letterSpacing: '-0.02em' }}>Buat organisasi</h2>
            <p style={{ color: '#5b6f64', margin: '6px 0 0', fontSize: 14 }}>Anda menjadi admin tenant baru.</p>
          </div>

          <div className="form-group"><label className="form-label">Nama Anda</label><input className="form-input" style={{ padding: '12px 14px' }} value={form.name} onChange={set('name')} /></div>
          <div className="form-group"><label className="form-label">Nama Organisasi</label><input className="form-input" style={{ padding: '12px 14px' }} value={form.orgName} onChange={set('orgName')} /></div>
          <div className="form-group"><label className="form-label">Email</label><input className="form-input" style={{ padding: '12px 14px' }} type="email" value={form.email} onChange={set('email')} /></div>
          <div className="form-group"><label className="form-label">Password <span style={{ color: '#9aada2', fontWeight: 500 }}>(min. 8)</span></label><input className="form-input" style={{ padding: '12px 14px' }} type="password" value={form.password} onChange={set('password')} /></div>

          {error && <div style={{ color: '#dc2626', fontSize: 13, marginBottom: 14, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 12px' }}>{error}</div>}

          <button className="cta" style={{ width: '100%', border: 'none', padding: '13px', fontSize: 15, display: 'flex', justifyContent: 'center', cursor: 'pointer' }} disabled={loading}>
            {loading ? 'Membuat...' : 'Buat Organisasi'}
          </button>

          <p style={{ textAlign: 'center', marginTop: 22, fontSize: 14, color: '#5b6f64' }}>
            Sudah punya akun? <Link href="/login" style={{ color: '#0f9d58', fontWeight: 700 }}>Masuk</Link>
          </p>
        </form>
      </div>

      <style>{`
        .auth-brand { display:flex; flex-direction:column; justify-content:center; background: linear-gradient(150deg,#08633a 0%,#0f9d58 55%,#19c26b 100%); position:relative; overflow:hidden; }
        .auth-brand::after { content:''; position:absolute; width:480px; height:480px; border-radius:50%; background:radial-gradient(circle, rgba(255,255,255,0.14), transparent 60%); right:-120px; bottom:-140px; }
        @media (min-width: 860px) { .auth-brand { display:flex !important; } }
        .cta { background: linear-gradient(135deg,#0f9d58,#19c26b); color:#fff; border-radius:10px; font-weight:800; box-shadow:0 12px 26px -12px rgba(15,157,88,0.7); transition: transform .15s, box-shadow .15s; }
        .cta:hover { transform: translateY(-2px); }
        .cta:disabled { opacity:.6; cursor:not-allowed; }
      `}</style>
    </div>
  );
}
