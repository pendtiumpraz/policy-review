'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BoltIcon, LockIcon, TargetIcon, Logo } from '@/components/icons';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await signIn('credentials', { email, password, redirect: false });
    setLoading(false);
    if (res?.error) { setError('Email atau password salah, atau akun belum aktif.'); return; }
    router.push('/dashboard');
    router.refresh();
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#F1F5F9' }}>
      {/* Brand panel */}
      <div className="auth-brand" style={{ flex: '1 1 52%', display: 'none' }}>
        <div style={{ padding: 40, maxWidth: 460 }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontWeight: 800, fontSize: 20, color: '#fff', marginBottom: '13vh' }}>
            <Logo size={34} tone="light" />
            PolicyReview<span style={{ opacity: 0.6 }}>.</span>
          </Link>
          <h1 style={{ color: '#fff', fontSize: 40, lineHeight: 1.15, fontWeight: 900, letterSpacing: '-0.03em', margin: '0 0 16px' }}>
            Kepatuhan jadi<br />lebih <em style={{ fontStyle: 'normal', color: '#34D399' }}>terukur</em>.
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: 15, lineHeight: 1.7, marginBottom: 32 }}>
            Satu platform untuk mereview kebijakan & regulasi — data terisolasi per organisasi, AI agnostik, hasil bisa diedit.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              [BoltIcon, 'Review AI dalam sekali klik'],
              [LockIcon, 'Isolasi penuh antar tenant'],
              [TargetIcon, 'Hasil audit yang bisa diedit'],
            ].map(([Icon, t]) => (
              <div key={t as string} style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#fff', fontSize: 14, fontWeight: 600 }}>
                <span style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon />
                </span>
                {t as string}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div style={{ flex: '1 1 48%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <form onSubmit={submit} style={{ width: 380 }}>
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 26, fontWeight: 900, margin: 0, letterSpacing: '-0.02em' }}>Selamat datang kembali</h2>
            <p style={{ color: '#5B6B80', margin: '6px 0 0', fontSize: 14 }}>Masuk untuk melanjutkan ke dashboard.</p>
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" style={{ padding: '12px 14px' }} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@organisasi.id" autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
              Password
              <span style={{ color: '#5B6B80', fontWeight: 500, cursor: 'default' }}>Lupa?</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input className="form-input" style={{ padding: '12px 44px 12px 14px' }} type={show ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
              <button type="button" onClick={() => setShow((s) => !s)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer', color: '#7E8FA6', fontSize: 13, fontWeight: 700 }}>
                {show ? 'Sembunyi' : 'Lihat'}
              </button>
            </div>
          </div>

          {error && <div style={{ color: '#dc2626', fontSize: 13, marginBottom: 14, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 12px' }}>{error}</div>}

          <button className="cta" style={{ width: '100%', border: 'none', padding: '13px', fontSize: 15, justifyContent: 'center', display: 'flex', cursor: 'pointer' }} disabled={loading}>
            {loading ? 'Masuk...' : 'Masuk'}
          </button>

          <p style={{ textAlign: 'center', marginTop: 22, fontSize: 14, color: '#5B6B80' }}>
            Belum punya organisasi? <Link href="/register" style={{ color: '#059669', fontWeight: 700 }}>Daftar gratis</Link>
          </p>
        </form>
      </div>

      <style>{`
        .auth-brand { display:flex; flex-direction:column; justify-content:center; background: linear-gradient(150deg,#047857 0%,#059669 55%,#34D399 100%); position:relative; overflow:hidden; }
        .auth-brand::after { content:''; position:absolute; width:480px; height:480px; border-radius:50%; background:radial-gradient(circle, rgba(255,255,255,0.14), transparent 60%); right:-120px; bottom:-140px; }
        @media (min-width: 860px) { .auth-brand { display:flex !important; } }
        .cta { background: linear-gradient(135deg,#059669,#34D399); color:#fff; border-radius:10px; font-weight:800; box-shadow:0 12px 26px -12px rgba(5,150,105,0.7); transition: transform .15s, box-shadow .15s; }
        .cta:hover { transform: translateY(-2px); }
        .cta:disabled { opacity:.6; cursor:not-allowed; }
      `}</style>
    </div>
  );
}
