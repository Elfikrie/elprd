# Rancang

Website generator draf PRD berbahasa Indonesia dengan tampilan minimalis abu-abu.

**Aplikasi live:** [elprd-rancang.netlify.app](https://elprd-rancang.netlify.app). Client React dan API Fastify berjalan pada Netlify; database PostgreSQL berada di Supabase. Deployment terhubung ke branch `main` repositori ini.

## Jalankan client
Butuh Node.js 24 atau lebih baru.
```sh
npm ci
npm run dev
```
Buka http://127.0.0.1:5178. Tanpa konfigurasi tambahan, aplikasi memakai **template deterministik**, bukan AI. Riwayat disimpan di localStorage browser; unduh .md untuk cadangan.

Fitur: input ide dan kebutuhan, enam template, pilihan platform/detail, 11 bagian PRD, diagram Mermaid, Markdown, unduhan, salin bagian, pencarian, arsip/pulihkan, hapus dengan konfirmasi, dan layout responsif.

## Mode AI dengan server terpisah
1. Salin .env.example menjadi .env.
2. Jalankan `docker compose up -d db`, lalu `npm run db:migrate`.
3. Isi DATABASE_URL, ANTHROPIC_API_KEY, ANTHROPIC_MODEL, WEB_ORIGIN.
4. Jalankan `npm run dev:api`.
5. Client membaca env dari apps/web: buat apps/web/.env.local berisi `VITE_API_URL=http://127.0.0.1:3001`, lalu mulai ulang client.
6. Klik Masuk, buat akun, dan susun plan.

Model harus tersedia pada akun Anthropic. API key tidak disertakan. Biaya API bergantung model/kuota akun. Server membatasi 10 percobaan generate/hari/pengguna (UTC), 3 permintaan/menit/IP, dan 10.000 token keluaran per percobaan. Kegagalan tetap memakai kuota untuk membatasi biaya nyata.

Untuk produksi: deploy client dan server HTTPS di domain induk yang sama agar cookie SameSite=Lax bekerja. WEB_ORIGIN harus tepat sama dengan origin client; set NODE_ENV=production. Gunakan password database produksi sendiri. Jangan gunakan kredensial Compose lokal di internet. Dockerfile server: `docker build -f apps/api/Dockerfile -t rancang-api .`.

## Perintah
- `npm run build` — typecheck seluruh client/server lalu build client ke dist.
- `npm test` — uji domain dan integrasi HTTP memakai repositori/LLM palsu.
- `npm run typecheck` — pemeriksaan TypeScript strict.
- `node tests/browser-qa.mjs` — QA E2E Edge Windows, perlu client aktif di port 5178. Menghasilkan screenshot dan laporan di artifacts.

## Struktur
- apps/web — React, Vite, React Router, CSS.
- apps/api — Node.js, Fastify, sesi cookie, Anthropic SSE, ekspor server.
- packages/shared — Zod, tipe, template, generator lokal.
- tests — unit, HTTP integration, browser QA.
- docs — keputusan, arsitektur, API, status, video.

## Batas versi ini
Deployment Netlify memakai mode AI dengan database Supabase dan Netlify AI Gateway. Versi Sites sebelumnya tetap berupa client statis dalam mode template. Streaming AI menampilkan progres penerimaan; dokumen tampil setelah JSON lengkap lolos validasi.

Belum ada penagihan, pemulihan password/email verification, versi historis sebuah plan, sinkronisasi antarperangkat pada mode lokal, atau model picker. Daftar server dibatasi 100 plan terbaru; pagination penuh belum diimplementasikan. Mermaid dirender strict di client dengan fallback kode; server membatasi konten berbahaya tetapi belum memvalidasi seluruh grammar Mermaid.

Video Seedance belum dibuat. Hero memakai ilustrasi SVG orisinal; petunjuk dan tiga prompt disediakan di [docs/hero-video.md](docs/hero-video.md). Tidak ada klaim metrik Lighthouse atau performa jaringan yang belum diukur.

Lihat [status dan verifikasi](docs/verification.md), [arsitektur](docs/architecture.md), dan [kontrak API](docs/api.md).


## Deployment Netlify dan Supabase
Entry Netlify Server tersedia di netlify/server/index.ts. Client dan API memakai satu origin; PostgreSQL ditempatkan di schema rancang pada Supabase. Lihat [panduan deployment](docs/netlify-supabase.md) untuk environment, migrasi, dan status aktual.

