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

## Deployment berikutnya
1. Jalankan `npm test` dan `npm run typecheck`.
2. Push perubahan ke branch `main`; Netlify membangun di Linux dan mempublikasikan otomatis setelah build berhasil.
3. Migrasi baru, bila ada, harus dijalankan dengan akun admin melalui Supabase, bukan role runtime `rancang_api`.
4. Verifikasi `/api/health`, daftar/masuk, generate SSE, unduhan, dan riwayat setelah login ulang.

Folder `.netlify` diabaikan Git; konfigurasi lokal dan kredensial tidak dikirim ke repositori. Perubahan dokumentasi saja dapat memakai `[skip ci]` pada pesan commit agar tidak membuat deployment baru.

Jangan deploy dengan DATABASE_URL kosong: server melakukan validasi awal dan tidak akan mempublikasikan backend yang tidak terkonfigurasi.

## Validasi yang tersedia
npm test menjalankan 22 pengujian. Migrasi diuji pada PostgreSQL WASM (PGlite), termasuk foreign key, indeks, RLS, akses role backend, serta penolakan akses publik dan DDL. Uji koneksi Supabase produksi juga lulus: health, CRUD, foreign-key cascade, penolakan CREATE TABLE, dan rollback seluruh data uji. Advisor security dan health tidak melaporkan temuan. Parser AI menerima JSON polos atau satu blok kode JSON lengkap; prosa tambahan, keluaran parsial, struktur tidak valid, dan pola diagram berbahaya tetap ditolak.

AI menyusun delapan bagian wajib dengan batas panjang per bagian. Jika Claude 4.5 mengembalikan `max_tokens`, server melanjutkan JSON dari titik terpotong memakai assistant prefill, maksimal sekali. Anggaran output maksimal 16.000 token per permintaan (10.000 awal + 6.000 kelanjutan). Model lain mendapat satu anggaran 16.000 token tanpa prefill agar kompatibel dengan model baru yang tidak mendukungnya. Pembatalan pengguna menghentikan kelanjutan. Error SSE membedakan batas output, format dokumen, penolakan AI, timeout, pembatasan layanan, dan kegagalan penyimpanan; log mencatat kode/tahap/stop reason tanpa isi PRD atau kredensial.

## Status
Client dan server dipublikasikan di https://elprd-rancang.netlify.app pada tim elfikrie. GitHub `Elfikrie/elprd`, branch `main`, sudah terhubung ke continuous deployment. Supabase produksi sudah siap dan teruji. DATABASE_URL tersimpan sebagai secret produksi di elprd-rancang; salinannya pada proyek awal elprd di tim School sudah dihapus dengan persetujuan pemilik. Health database, pendaftaran, login, pencabutan sesi saat logout, serta penolakan Origin asing sudah lulus pengujian HTTP produksi.

Deployment terverifikasi: `6afc06d9d076562e078b2fd0`, source commit `ff11afe`, dipublikasikan 17 November 2026. Regresi produksi memakai input persis `website umkm untuk laundry`, detail Lengkap: Anthropic melalui AI Gateway menghasilkan PRD 8 bagian; streaming selesai, riwayat tersimpan setelah login ulang, ekspor Markdown, pemisahan akses antar akun, arsip, dan hapus seluruhnya lulus. Akun serta dokumen pengujian telah dibersihkan.
