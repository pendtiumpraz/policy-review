import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ShieldIcon, PlugIcon, ChartIcon, BookIcon, EditIcon, PaletteIcon, BoltIcon, LockIcon, TargetIcon, Logo } from '@/components/icons';
import DemoSimulation from '@/components/DemoSimulation';

const G = '#059669';

export default async function LandingPage() {
  const session = await getServerSession(authOptions);
  const authed = !!session?.user;

  return (
    <div style={{ background: '#F1F5F9', color: '#0F172A', fontFamily: "'Inter', system-ui, sans-serif", minHeight: '100vh' }}>
      {/* Nav */}
      <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(241,245,249,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #D8E0EA' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 5%', maxWidth: 1180, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 800, fontSize: 18 }}>
            <Logo size={30} />
            PolicyReview<span style={{ color: G }}>.</span>
          </div>
          <nav style={{ display: 'flex', alignItems: 'center', gap: 24, fontSize: 14, color: '#475569' }}>
            <a href="#fitur" style={{ color: 'inherit' }}>Fitur</a>
            <a href="#simulasi" style={{ color: 'inherit' }}>Simulasi</a>
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
        </div>
      </header>

      {/* Hero */}
      <section style={{ maxWidth: 1180, margin: '0 auto', padding: '70px 5% 56px', display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: 48, alignItems: 'center' }}>
        <div>
          <div className="pill">Multi-tenant · AI-agnostic · BYOK · White-label</div>
          <h1 style={{ fontSize: 54, lineHeight: 1.06, margin: '18px 0', letterSpacing: '-0.035em', fontWeight: 900 }}>
            Review <span style={{ color: 'transparent', background: 'linear-gradient(120deg,#059669,#34D399)', WebkitBackgroundClip: 'text', backgroundClip: 'text' }}>kebijakan & regulasi</span> perusahaan, akurat dan bisa dipertanggungjawabkan.
          </h1>
          <p style={{ fontSize: 17, lineHeight: 1.7, color: '#475569', maxWidth: 500, margin: '0 0 30px' }}>
            Tim hukum & kepatuhan butuh kejelasan, bukan tebakan. PolicyReview mengaudit SOP dan kebijakan internal terhadap regulasi eksternal (UU PDP) dan ketentuan internal — dengan AI yang kamu pegang kendalinya, data terisolasi per organisasi, dan hasil yang bisa diedit.
          </p>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Link href="/register" className="cta" style={{ padding: '15px 28px', fontSize: 15 }}>Coba Gratis — Tanpa Kartu Kredit</Link>
            <a href="#simulasi" className="ghost-cta">Lihat Simulasi</a>
          </div>
          <div style={{ display: 'flex', gap: 30, marginTop: 36 }}>
            {[
              ['13+', 'Model AI'],
              ['2 sumber', 'Regulasi in/eksternal'],
              ['100%', 'Hasil editable'],
              ['0', 'Kebocoran antar tenant'],
            ].map(([v, l]) => (
              <div key={l}><div style={{ fontSize: 26, fontWeight: 900, color: G, letterSpacing: '-0.02em' }}>{v}</div><div style={{ fontSize: 12, color: '#5B6B80' }}>{l}</div></div>
            ))}
          </div>
        </div>

        <div style={{ position: 'relative' }}>
          <div className="hero-glow" />
          <DemoSimulation />
        </div>
      </section>

      {/* Kenapa / problem */}
      <section style={{ background: '#fff', borderTop: '1px solid #D8E0EA', borderBottom: '1px solid #D8E0EA', padding: '72px 5%' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <div className="section-eyebrow">Kenapa PolicyReview</div>
          <h2 style={{ fontSize: 34, fontWeight: 900, letterSpacing: '-0.025em', margin: '8px 0 16px', maxWidth: 720 }}>
            Review manual lambat, rawan terlewat, dan susah diaudit.
          </h2>
          <p style={{ fontSize: 16, color: '#475569', lineHeight: 1.7, maxWidth: 720, margin: 0 }}>
            Menelaah ratusan pasal per dokumen terhadap banyak regulasi memakan waktu berminggu-minggu, dan hasilnya tersebar di spreadsheet yang tidak konsisten. PolicyReview membuat setiap celah kepatuhan terlihat jelas, lengkap dengan rekomendasi & referensi pasal — lalu tetap bisa kamu koreksi dan simpan.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginTop: 36 }}>
            {[
              [LockIcon, 'Isolasi total', 'Setiap organisasi (tenant) punya data, kunci AI, kuota, dan hasil yang benar-benar terpisah. Tanpa foreign key & kebocoran silang.'],
              [PaletteIcon, 'White-label', 'Warna & logo mengikuti identitas brand tiap organisasi (hijau Pegadaian, dst), bukan template generik.'],
              [PlugIcon, 'AI yang kamu pegang', 'Provider agnostik: bawa kunci sendiri (BYOK) atau pakai kunci platform. Ganti model kapan saja tanpa ubah kode.'],
              [ChartIcon, 'Terkendali & terukur', 'Kuota token per tenant, tercatat tiap pemanggilan. Kamu tahu persis berapa yang terpakai.'],
            ].map(([Icon, t, d]) => (
              <div key={t as string} className="why-card">
                <Icon />
                <h3>{t as string}</h3>
                <p>{d as string}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fitur */}
      <section id="fitur" style={{ maxWidth: 1180, margin: '0 auto', padding: '72px 5%' }}>
        <div className="section-eyebrow" style={{ textAlign: 'center' }}>Fitur</div>
        <h2 style={{ textAlign: 'center', fontSize: 34, fontWeight: 900, letterSpacing: '-0.025em', margin: '8px 0 8px' }}>Semua yang dibutuhkan tim kepatuhan</h2>
        <p style={{ textAlign: 'center', color: '#475569', marginBottom: 44, fontSize: 16 }}>Dari unggah regulasi sampai review yang bisa diedit.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20 }}>
          {[
            [BookIcon, 'Regulasi internal & eksternal', 'Unggah UU/peraturan pemerintah ataupun kebijakan internal. Lengkap dengan checklist untuk ditinjau satu per satu.'],
            [BoltIcon, 'Review AI sekali klik', 'Pilih dokumen + bundle regulasi, pilih model, jalankan. AI mengembalikan audit terstruktur dalam hitungan detik.'],
            [EditIcon, 'Hasil yang bisa diedit', 'Output AI diparsing jadi skor, ringkasan, analisis per-bagian, per-regulasi, dan checklist — semuanya bisa diedit & disimpan.'],
            [ShieldIcon, 'Soft delete + audit trail', 'CRUD penuh: soft delete, trash view, restore, dan hapus permanen. Riwayat tidak pernah hilang begitu saja.'],
            [TargetIcon, 'Prioritas tindak lanjut', 'Dapatkan daftar tindakan prioritas (high/medium/low) dengan saran tenggat — langsung jadi backlog timmu.'],
            [ChartIcon, 'Skor kepatuhan', 'Skor 0–100 + level kepatuhan per dokumen, sehingga mudah dibandingkan antar waktu dan antar kebijakan.'],
          ].map(([Icon, t, d]) => (
            <div key={t as string} className="feat-card">
              <div className="feat-ic"><Icon /></div>
              <h3>{t as string}</h3>
              <p>{d as string}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Simulasi */}
      <section id="simulasi" style={{ background: '#0b1220', color: '#E9EEF4', padding: '72px 5%' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <div className="section-eyebrow" style={{ color: '#34D399', textAlign: 'center' }}>Simulasi</div>
          <h2 style={{ textAlign: 'center', fontSize: 34, fontWeight: 900, letterSpacing: '-0.025em', margin: '8px 0 8px' }}>Coba alurnya langsung</h2>
          <p style={{ textAlign: 'center', color: '#8494A8', marginBottom: 36, fontSize: 16 }}>Klik tiap langkah — ini cara kerja PolicyReview sebelum kamu daftar.</p>
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            <DemoSimulation />
          </div>
        </div>
      </section>

      {/* Cara kerja */}
      <section id="cara" style={{ maxWidth: 1080, margin: '0 auto', padding: '72px 5%' }}>
        <div className="section-eyebrow" style={{ textAlign: 'center' }}>Cara kerja</div>
        <h2 style={{ textAlign: 'center', fontSize: 34, fontWeight: 900, letterSpacing: '-0.025em', margin: '8px 0 44px' }}>Tiga langkah menuju kepatuhan</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 36 }}>
          {[
            ['1', 'Unggah regulasi & dokumen', 'Masukkan regulasi eksternal/internal dan dokumen kebijakan yang ingin direview. Teks diekstrak otomatis dari PDF/DOCX.'],
            ['2', 'Pilih bundle & model AI', 'Pilih peraturan yang berlaku, checklist satu-per-satu, dan model AI aktif (BYOK atau platform).'],
            ['3', 'Edit & simpan hasil', 'AI mengembalikan JSON audit → tampilan review editable → simpan ke database. Unduh, tindak lanjuti, selesai.'],
          ].map(([n, t, d]) => (
            <div key={n} style={{ position: 'relative' }}>
              <div style={{ width: 52, height: 52, marginBottom: 18, borderRadius: '50%', background: 'linear-gradient(135deg,#059669,#34D399)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 900, color: '#fff' }}>{n}</div>
              <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>{t}</h3>
              <p style={{ color: '#475569', lineHeight: 1.65, fontSize: 14, margin: 0 }}>{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ maxWidth: 1080, margin: '0 auto', padding: '40px 5% 88px', textAlign: 'center' }}>
        <div style={{ background: 'linear-gradient(135deg,#0B1220,#0F172A)', borderRadius: 24, padding: '56px 40px', color: '#fff' }}>
          <h2 style={{ fontSize: 34, fontWeight: 900, letterSpacing: '-0.025em', marginBottom: 12 }}>Kepatuhan bukan lagi tebak-tebakan.</h2>
          <p style={{ color: '#94A3B8', marginBottom: 28, fontSize: 16 }}>Mulai hari ini — satu organisasi, seluruh regulasi, satu dashboard.</p>
          <Link href="/register" className="cta" style={{ padding: '16px 34px', fontSize: 16 }}>Buat Organisasi Gratis</Link>
          <div style={{ color: '#8494A8', fontSize: 12, marginTop: 18 }}>Tanpa kartu kredit · Deploy ke Vercel dalam hitungan menit</div>
        </div>
      </section>

      <footer style={{ borderTop: '1px solid #D8E0EA', padding: '28px 5%', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, color: '#5B6B80', fontSize: 13, maxWidth: 1180, margin: '0 auto' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Logo size={18} /> © {new Date().getFullYear()} PolicyReview — Multi-tenant AI policy review.</span>
        <span>Neon Postgres · Vercel Blob · AI-agnostic</span>
      </footer>

      <style>{`
        .cta { background: linear-gradient(135deg,#059669,#34D399); color:#fff; padding:11px 20px; border-radius:10px; font-weight:700; text-decoration:none; display:inline-block; box-shadow:0 10px 24px -10px rgba(5,150,105,0.6); transition: transform .15s ease, box-shadow .15s ease; }
        .cta:hover { transform: translateY(-2px); box-shadow:0 16px 30px -12px rgba(5,150,105,0.7); }
        .ghost-cta { padding:14px 24px; border-radius:10px; font-weight:700; color:#0F172A; border:1px solid #D8E0EA; text-decoration:none; transition: background .15s; }
        .ghost-cta:hover { background:#F8FAFC; }
        .pill { display:inline-block; padding:6px 14px; border-radius:100px; background:#e6f4ef; color:#059669; font-size:12px; font-weight:700; }
        .section-eyebrow { font-size:13px; font-weight:800; letter-spacing:.08em; text-transform:uppercase; color:#059669; }
        .feat-card { background:#fff; border:1px solid #D8E0EA; border-radius:16px; padding:26px; transition: transform .18s, box-shadow .18s; }
        .feat-card:hover { transform: translateY(-4px); box-shadow:0 20px 40px -24px rgba(5,150,105,0.35); }
        .feat-ic { width:46px; height:46px; border-radius:12px; background:#e6f4ef; color:#059669; display:flex; align-items:center; justify-content:center; margin-bottom:16px; }
        .feat-ic svg { width:22px; height:22px; }
        .feat-card h3 { margin:0 0 8px; font-size:16px; font-weight:800; }
        .feat-card p { margin:0; color:#5B6B80; line-height:1.6; font-size:14px; }
        .why-card { padding: 4px 0; }
        .why-card svg { color:#059669; width:24px; height:24px; margin-bottom:12px; }
        .why-card h3 { margin:0 0 6px; font-size:16px; font-weight:800; }
        .why-card p { margin:0; color:#5B6B80; line-height:1.65; font-size:14px; }
        .hero-glow { position:absolute; width:440px; height:440px; background:radial-gradient(circle, rgba(52,211,153,0.35), transparent 65%); filter:blur(24px); top:-40px; right:-30px; }
      `}</style>
    </div>
  );
}
