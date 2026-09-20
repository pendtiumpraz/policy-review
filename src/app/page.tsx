import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const G = '#0f9d58';

export default async function LandingPage() {
  const session = await getServerSession(authOptions);
  const authed = !!session?.user;

  return (
    <div style={{ background: '#f7faf8', color: '#0b1f15', fontFamily: "'Inter', system-ui, sans-serif", minHeight: '100vh' }}>
      {/* Nav */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 5%', maxWidth: 1180, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 800, fontSize: 18 }}>
          <span style={{ display: 'inline-flex', width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg,#0f9d58,#19c26b)', color: '#fff', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 900 }}>PR</span>
          PolicyReview<span style={{ color: G }}>.</span>
        </div>
        <nav style={{ display: 'flex', alignItems: 'center', gap: 22, fontSize: 14, color: '#2a3d33' }}>
          <a href="#fitur" style={{ color: 'inherit' }}>Fitur</a>
          <a href="#cara" style={{ color: 'inherit' }}>Cara Kerja</a>
          {authed ? (
            <Link href="/dashboard" className="cta">Buka Dashboard</Link>
          ) : (
            <>
              <Link href="/login" style={{ color: 'inherit', fontWeight: 600 }}>Masuk</Link>
              <Link href="/register" className="cta">Mulai Gratis</Link>
            </>
          )}
        </nav>
      </header>

      {/* Hero */}
      <section style={{ maxWidth: 1180, margin: '0 auto', padding: '64px 5% 48px', display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: 48, alignItems: 'center' }}>
        <div>
          <div className="pill">Multi-tenant · AI-agnostic · BYOK</div>
          <h1 style={{ fontSize: 52, lineHeight: 1.08, margin: '18px 0', letterSpacing: '-0.03em', fontWeight: 900 }}>
            Review <span style={{ color: 'transparent', background: 'linear-gradient(120deg,#0f9d58,#19c26b)', WebkitBackgroundClip: 'text', backgroundClip: 'text' }}>kebijakan & regulasi</span> perusahaan pakai AI yang kamu pegang kendalinya.
          </h1>
          <p style={{ fontSize: 17, lineHeight: 1.65, color: '#3c5247', maxWidth: 480, margin: '0 0 28px' }}>
            Audit kepatuhan SOP & kebijakan internal terhadap regulasi eksternal (UU PDP) dan ketentuan internal — dengan provider AI pilihanmu, data terisolasi per tenant, dan hasil yang bisa diedit.
          </p>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Link href="/register" className="cta" style={{ padding: '14px 26px', fontSize: 15 }}>Coba Sekarang</Link>
            <Link href="/login" className="ghost-cta">Demo Langsung</Link>
          </div>
          <div style={{ display: 'flex', gap: 26, marginTop: 34 }}>
            {[
              ['13+', 'Model AI'],
              ['2 sumber', 'Regulasi in/ext'],
              ['100%', 'Editable hasil'],
            ].map(([v, l]) => (
              <div key={l}><div style={{ fontSize: 24, fontWeight: 900, color: G }}>{v}</div><div style={{ fontSize: 12, color: '#5b6f64' }}>{l}</div></div>
            ))}
          </div>
        </div>

        {/* Mock dashboard */}
        <div style={{ position: 'relative' }}>
          <div className="hero-glow" />
          <div style={{ position: 'relative', background: '#0b1220', borderRadius: 20, padding: 22, boxShadow: '0 40px 80px -30px rgba(15,157,88,0.45)', color: '#e6f1eb' }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <span style={{ width: 10, height: 10, borderRadius: 5, background: '#ff5f57' }} />
              <span style={{ width: 10, height: 10, borderRadius: 5, background: '#febc2e' }} />
              <span style={{ width: 10, height: 10, borderRadius: 5, background: '#28c840' }} />
            </div>
            <div style={{ display: 'flex', gap: 14 }}>
              <div style={{ width: 104, borderRadius: 10, background: '#131c2c', padding: 10, display: 'flex', flexDirection: 'column', gap: 6, alignSelf: 'flex-start' }}>
                {['#0f9d58', '#f59e0b', '#3b82f6', '#8b5cf6', '#ef4444'].map((c, i) => (
                  <div key={c} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px', borderRadius: 6, background: i === 0 ? 'rgba(255,255,255,0.06)' : 'transparent' }}>
                    <span style={{ width: 8, height: 8, borderRadius: 3, background: c }} />
                    <span style={{ width: 40, height: 5, borderRadius: 3, background: '#2a3850' }} />
                  </div>
                ))}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                  {['Skor 86', 'Patuh 12', 'Gap 3'].map((t, i) => (
                    <div key={t} style={{ flex: 1, background: '#131c2c', borderRadius: 8, padding: '12px 10px' }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: i === 1 ? '#19c26b' : i === 2 ? '#f59e0b' : '#fff' }}>{t.split(' ')[0] === 'Patuh' ? '12' : t.split(' ')[0] === 'Gap' ? '3' : '86'}</div>
                      <div style={{ fontSize: 9, color: '#7c8ba0' }}>{t.split(' ')[1] || t}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#131c2c', borderRadius: 8, padding: 12, marginBottom: 10 }}>
                  <div style={{ width: 46, height: 46, borderRadius: 50, border: '4px solid #19c26b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 900, color: '#19c26b' }}>86</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700 }}>
                      <span>Kepatuhan</span><span style={{ color: '#19c26b' }}>Patuh</span>
                    </div>
                    <div style={{ height: 6, borderRadius: 3, background: '#222e44', marginTop: 8 }}><div style={{ width: '86%', height: 6, borderRadius: 3, background: 'linear-gradient(90deg,#0f9d58,#19c26b)' }} /></div>
                  </div>
                </div>
                {['Dasar hukum pemrosesan → Patuh', 'Masa retensi data → Sebagian', 'Hak subjek data → Patuh'].map((r) => (
                  <div key={r} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, padding: '8px 12px', borderRadius: 8, background: '#131c2c', marginBottom: 6, color: '#c3d2c9' }}>
                    <span>{r.split(' → ')[0]}</span>
                    <span style={{ color: r.includes('Sebagian') ? '#f59e0b' : '#19c26b', fontWeight: 700 }}>{r.split(' → ')[1]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="fitur" style={{ maxWidth: 1180, margin: '0 auto', padding: '40px 5% 64px' }}>
        <h2 style={{ textAlign: 'center', fontSize: 32, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 8 }}>Dibangun untuk kepatuhan yang serius</h2>
        <p style={{ textAlign: 'center', color: '#4b6156', marginBottom: 40 }}>Semua yang kamu butuhkan untuk meninjau kebijakan tanpa kebocoran data.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
          {[
            ['🛡️', 'Multi-tenant terisolasi', 'Data, kunci AI, dan hasil review tiap organisasi benar-benar terpisah.'],
            ['🔌', 'AI-agnostic + BYOK', 'Provider & model dikelola superadmin. Bawa kunci sendiri atau pakai kunci platform.'],
            ['📊', 'Kuota token', 'Kontrol pemakaian token per tenant, tercatat otomatis tiap pemanggilan AI.'],
            ['📚', 'Regulasi in & external', 'Unggah UU/peraturan eksternal ataupun kebijakan internal, lengkap dengan checklist.'],
            ['✍️', 'Hasil editable', 'Output AI diparsing jadi tampilan review yang bisa kamu edit dan simpan ulang.'],
            ['🎨', 'White-label', 'Warna brand & logo tiap tenant menyesuaikan identitas organisasimu.'],
          ].map(([ic, t, d]) => (
            <div key={t} className="feat-card">
              <div className="feat-ic">{ic}</div>
              <h3>{t}</h3>
              <p>{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="cara" style={{ background: '#0b1220', color: '#e8f2ec', padding: '64px 5%' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: 30, fontWeight: 900, marginBottom: 40 }}>Cara kerjanya</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 32 }}>
            {[
              ['1', 'Unggah regulasi & dokumen', 'Masukkan regulasi eksternal/internal dan dokumen kebijakan yang ingin direview.'],
              ['2', 'Pilih bundle + model AI', 'Pilih peraturan yang berlaku, checklist satu-per-satu, dan model AI aktif.'],
              ['3', 'Edit & simpan hasil', 'AI kembalikan JSON audit → tampilan review yang bisa diedit → simpan ke database.'],
            ].map(([n, t, d]) => (
              <div key={n} style={{ textAlign: 'center' }}>
                <div style={{ width: 52, height: 52, margin: '0 auto 16px', borderRadius: '50%', background: 'linear-gradient(135deg,#0f9d58,#19c26b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 900, color: '#fff' }}>{n}</div>
                <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>{t}</h3>
                <p style={{ color: '#9fb2a8', lineHeight: 1.6, fontSize: 14 }}>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ maxWidth: 1080, margin: '0 auto', padding: '72px 5%', textAlign: 'center' }}>
        <h2 style={{ fontSize: 36, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 12 }}>Siap meninjau kebijakan dengan benar?</h2>
        <p style={{ color: '#4b6156', marginBottom: 28 }}>Mulai gratis — deploy ke Vercel dalam hitungan menit.</p>
        <Link href="/register" className="cta" style={{ padding: '16px 32px', fontSize: 16 }}>Buat Organisasi</Link>
      </section>

      <footer style={{ borderTop: '1px solid #e2ece6', padding: '28px 5%', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, color: '#6a7f73', fontSize: 13, maxWidth: 1180, margin: '0 auto' }}>
        <span>© {new Date().getFullYear()} PolicyReview — Multi-tenant AI policy review.</span>
        <span>Neon Postgres · Vercel Blob · AI-agnostic</span>
      </footer>

      <style>{`
        .cta { background: linear-gradient(135deg,#0f9d58,#19c26b); color:#fff; padding:11px 20px; border-radius:10px; font-weight:700; text-decoration:none; display:inline-block; box-shadow:0 10px 24px -10px rgba(15,157,88,0.6); transition: transform .15s ease, box-shadow .15s ease; }
        .cta:hover { transform: translateY(-2px); box-shadow:0 16px 30px -12px rgba(15,157,88,0.7); }
        .ghost-cta { padding:13px 24px; border-radius:10px; font-weight:700; color:#0b1f15; border:1px solid #d7e3dc; text-decoration:none; transition: background .15s; }
        .ghost-cta:hover { background:#eef5f1; }
        .pill { display:inline-block; padding:6px 14px; border-radius:100px; background:#e4f4ea; color:#0f9d58; font-size:12px; font-weight:700; }
        .feat-card { background:#fff; border:1px solid #e5efe9; border-radius:16px; padding:24px; transition: transform .18s, box-shadow .18s; }
        .feat-card:hover { transform: translateY(-4px); box-shadow:0 20px 40px -24px rgba(15,157,88,0.35); }
        .feat-ic { font-size:26px; margin-bottom:14px; }
        .feat-card h3 { margin:0 0 8px; font-size:16px; font-weight:800; }
        .feat-card p { margin:0; color:#5b6f64; line-height:1.6; font-size:14px; }
        .hero-glow { position:absolute; width:420px; height:420px; background:radial-gradient(circle, rgba(25,194,107,0.35), transparent 65%); filter:blur(20px); top:-40px; right:-30px; }
      `}</style>
    </div>
  );
}
