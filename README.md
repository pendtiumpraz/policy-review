# Policy Review

Platform review kebijakan/SOP **multi-tenant** berbasis AI — white-label, AI-agnostic, BYOK, dan kuota token. Full-stack **Next.js** (App Router) + Neon Postgres (Drizzle) + Vercel Blob.

## Fitur

- **Multi-tenant isolation** — data & AI setiap tenant terpisah (`tenant_id` scoping).
- **White-label** — warna brand & logo per tenant (default hijau ala Pegadaian).
- **AI-agnostic** — provider & model dikelola superadmin (aktif/nonaktif): OpenAI, Anthropic, Google Gemini, DeepSeek, **9inference**.
- **BYOK** — tenant dapat membawa API key sendiri per provider (dienkripsi AES-256-GCM saat disimpan).
- **Kuota token** — usage dicatat per AI call; tenant dapat dibatasi kuota oleh superadmin.
- **Regulasi** — unggah regulasi **eksternal** (UU/peraturan) maupun **internal** perusahaan, lengkap dengan checklist.
- **Review dokumen** — unggah/paste kebijakan, pilih regulasi (bundle + checklist satu-per-satu), pilih model, jalankan review AI.
- **Hasil JSON → tampilan editable** — output AI (skor, ringkasan, per-bagian, per-regulasi, checklist, tindakan prioritas) diparsing menjadi UI yang dapat diedit dan disimpan kembali ke database.
- **Soft delete & restore**, CRUD satu halaman (drawer kanan), sidebar ikon 1 warna.

## Stack

- Next.js 15 (App Router) + React 19 + TypeScript
- Drizzle ORM + `postgres` (Neon Postgres)
- NextAuth v4 (credentials)
- Vercel Blob (dokumen)
- SDK AI: `openai`, `@anthropic-ai/sdk`, `@google/genai` (9inference/DeepSeek via kompatibel OpenAI)

## Setup lokal

```bash
npm install
# isi .env (lihat .env.example)
npm run db:migrate   # buat tabel + seed provider/model + superadmin
npm run dev
```

Variabel wajib di `.env`: `DATABASE_URL`, `BLOB_READ_WRITE_TOKEN`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `CREDENTIALS_ENCRYPTION_KEY`, `SUPERADMIN_EMAIL`, `SUPERADMIN_PASSWORD`.

## Deploy ke Vercel

1. Push repo ini ke GitHub.
2. Import ke Vercel (framework Preset: Next.js).
3. Set environment variables (salin dari `.env`), termasuk `DATABASE_URL` dan `BLOB_READ_WRITE_TOKEN`.
4. Deploy. Jalankan migrasi sekali (`npm run db:migrate`) via Vercel CLI atau lokal yang menunjuk ke DB produksi.

## Deploy / pasca-deploy

Setelah **setiap deploy**, wajib menjalankan migrasi DB terhadap database produksi agar skema selalu sinkron (mis. tabel `usage_counters` dari migrasi 0005 — tanpa ini pembuatan review akan gagal karena relasi tidak ditemukan):

```bash
# pastikan DATABASE_URL menunjuk ke database produksi
npm run db:migrate
```

Migrasi saat ini: `0001_init`, `0002_9inference`, `0003_reset_active`, `0004_9inference_package`, `0005_usage_counters`.

## Login

Akun default (superadmin) disimpan saat migrasi pertama:

| Role | Email | Password |
|------|-------|----------|
| Superadmin | `admin@sainskerta.net` | `SainskertaADM2026!` |

Superadmin login di `/login` lalu otomatis diarahkan ke `/admin` (kelola provider, model, tenant).
Akun tenant dibuat lewat halaman `/register`, atau oleh superadmin via panggilan API.
