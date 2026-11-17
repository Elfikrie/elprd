# Deploy Netlify + Supabase

Repo: https://github.com/Elfikrie/elprd
Netlify project: elprd (b56216ae-d864-4ccd-89a0-6ebe6b514332)

## Arsitektur deployment
Client React di CDN Netlify, API Fastify di Netlify Server, database PostgreSQL di Supabase. API berada pada origin yang sama dengan client, melalui /api/*. Tidak diperlukan CORS lintas domain pada deployment ini. Netlify Server masih Early Access; gunakan Node 24+ dan CLI 27.17+.

## Environment Netlify
Pada Project configuration → Environment variables, tambahkan:
- DATABASE_URL: URI Transaction pooler Supabase, port 6543. Gunakan scope All/default agar migrasi build dan server dapat memakainya.
- WEB_ORIGIN: https://elprd.netlify.app
- ANTHROPIC_MODEL: claude-sonnet-4-5-20250929 (tersedia pada respons API getAIGatewayProviders saat persiapan deployment).
- DAILY_GENERATION_LIMIT: 10.
- NODE_ENV: production.

Jangan menambahkan DATABASE_URL atau API key ke variabel VITE_. VITE_API_URL=same-origin merupakan nilai publik yang sudah didefinisikan di netlify.toml.

Netlify AI Gateway memasok ANTHROPIC_API_KEY/ANTHROPIC_BASE_URL saat runtime pada paket yang mendukungnya. Tidak perlu menyalin key gateway ke client. Bila memakai akun Anthropic sendiri, isi kedua variabel sesuai provider; biarkan BASE_URL tidak disetel untuk endpoint resmi default.

## Supabase
Gunakan proyek baru atau database yang sudah diotorisasi untuk aplikasi ini. Dari Connect, pilih Transaction pooler. Simpan password hanya dalam DATABASE_URL pada pengaturan environment Netlify. Karakter khusus password perlu URL-encoding.

Migrasi membuat schema rancang beserta tabel users, sessions, plans, generation_quotas, dan schema_migrations. Schema ini tidak perlu ditambahkan ke exposed schemas Data API. Semua tabel memakai RLS tanpa policy publik; koneksi backend menggunakan pemilik tabel dan memeriksa kepemilikan pada setiap query. Tidak memakai Supabase Auth; autentikasi email/password aplikasi tetap berada di Fastify.

Migrasi ini untuk instalasi baru. Bila sebelumnya pernah menjalankan versi awal yang memakai tabel public, data lama tidak dipindahkan atau dihapus secara otomatis. Migrasi data perlu rencana terpisah.

## Langkah deploy setelah akses siap
1. Otorisasi Netlify CLI sekali melalui login ticket.
2. Pastikan DATABASE_URL tersedia pada environment production.
3. Jalankan migrasi dengan environment production, lalu build client/server.
4. Deploy production ke site ID di atas.
5. Verifikasi /api/health, daftar/masuk, generate SSE, unduhan, dan riwayat setelah login ulang.
6. Hubungkan continuous deployment ke branch main jika belum terhubung.

Jangan deploy dengan DATABASE_URL kosong: server melakukan validasi awal dan tidak akan mempublikasikan backend yang tidak terkonfigurasi.

## Validasi yang tersedia
npm test menjalankan 11 pengujian. Migrasi diuji pada PostgreSQL WASM (PGlite), termasuk foreign key, indeks, RLS, serta penolakan akses role tanpa izin. Ini tidak menggantikan pengujian koneksi Supabase produksi.

## Status
Build produksi dan 11 pengujian berhasil. Proyek Netlify sudah dibuat, dengan WEB_ORIGIN, NODE_ENV, DAILY_GENERATION_LIMIT, dan ANTHROPIC_MODEL tersimpan. Koneksi pengelolaan Supabase sudah tersedia; pemilik akan membuat proyek elprd sendiri. CLI Netlify masih melaporkan ticket otorisasi pending. Deployment belum dipublikasikan, menunggu otorisasi CLI dan DATABASE_URL Supabase.
