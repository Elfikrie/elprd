# Deploy Netlify + Supabase

Repo: https://github.com/Elfikrie/elprd
Netlify project: elprd-rancang (845c96a7-cc2d-4913-89c0-3c2752ac3387), tim elfikrie
Supabase project: elprd (hieomcgaxjkrktuvhdgb), region Tokyo / ap-northeast-1

## Arsitektur deployment
Client React di CDN Netlify, API Fastify di Netlify Server, database PostgreSQL di Supabase. API berada pada origin yang sama dengan client, melalui /api/*. Tidak diperlukan CORS lintas domain pada deployment ini. Netlify Server masih Early Access; gunakan Node 24+ dan CLI 27.17+.

## Environment Netlify
Pada Project configuration → Environment variables, tambahkan:
- DATABASE_URL: URI Session pooler Supabase, port 5432, role rancang_api. Disimpan sebagai secret production pada scope Builds, Functions, Runtime; tidak termasuk Post processing.
- WEB_ORIGIN: https://elprd-rancang.netlify.app
- ANTHROPIC_MODEL: claude-sonnet-4-5-20250929 (tersedia pada respons API getAIGatewayProviders saat persiapan deployment).
- DAILY_GENERATION_LIMIT: 10.
- NODE_ENV: production.

Jangan menambahkan DATABASE_URL atau API key ke variabel VITE_. VITE_API_URL=same-origin merupakan nilai publik yang sudah didefinisikan di netlify.toml.

Netlify AI Gateway memasok ANTHROPIC_API_KEY/ANTHROPIC_BASE_URL saat runtime pada paket yang mendukungnya. Tidak perlu menyalin key gateway ke client. Bila memakai akun Anthropic sendiri, isi kedua variabel sesuai provider; biarkan BASE_URL tidak disetel untuk endpoint resmi default.

## Supabase
Database produksi sudah dipasang pada proyek di atas. Netlify Server memakai Session pooler dengan pool maksimal tiga koneksi dan idle timeout 20 detik. Ini menghindari masalah pipelining postgres.js pada Transaction pooler. Simpan password hanya dalam DATABASE_URL pada pengaturan environment Netlify. Karakter khusus password perlu URL-encoding.

Migrasi membuat schema rancang beserta tabel users, sessions, plans, generation_quotas, dan schema_migrations. Schema ini tidak ditambahkan ke exposed schemas Data API. Semua tabel memakai RLS tanpa policy publik; role khusus rancang_api hanya memiliki CRUD tabel aplikasi dan SELECT metadata migrasi. Fastify memeriksa kepemilikan pada setiap query. Tidak memakai Supabase Auth; autentikasi email/password aplikasi tetap berada di Fastify. Role runtime tidak boleh menjalankan db:migrate: migrasi memakai koneksi admin atau Supabase MCP.

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
npm test menjalankan 12 pengujian. Migrasi diuji pada PostgreSQL WASM (PGlite), termasuk foreign key, indeks, RLS, akses role backend, serta penolakan akses publik dan DDL. Uji koneksi Supabase produksi juga lulus: health, CRUD, foreign-key cascade, penolakan CREATE TABLE, dan rollback seluruh data uji. Advisor security dan health tidak melaporkan temuan.

## Status
Supabase produksi sudah siap dan teruji. CLI Netlify sudah terotorisasi pada akun GitHub pengguna, tim elfikrie. Proyek elprd-rancang dibuat pada tim tersebut dengan DATABASE_URL secret serta konfigurasi produksi tersimpan. Proyek awal elprd pada tim School tidak menjadi target deployment. Publikasi client dan server masih harus diverifikasi melalui build dan smoke test Netlify.
