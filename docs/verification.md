# Status verifikasi

Tanggal pengerjaan: 17 November 2026.

## Tersedia
- Client responsif dengan mode template eksplisit.
- PRD, diagram, task list, riwayat lokal, pencarian, arsip/pulihkan, hapus, ekspor .md.
- Source Node API, PostgreSQL/Drizzle, migrasi SQL, auth argon2, cookie, quota, SSE, adapter Anthropic.
- Uji unit, HTTP integration dengan fake provider, dan skenario browser otomatis.

## Hasil aktual
- TypeScript strict dan build produksi: lulus. Vite memperingatkan chunk Mermaid besar; renderer dimuat dinamis.
- Unit/integrasi: 15/15 lulus pada 4 berkas, termasuk migrasi PostgreSQL WASM, pembatasan role, dan regresi JSON AI berpagar Markdown.
- Browser Edge headless: 15 alur lulus; desktop 1440×1100 dan mobile 375×812. Tidak ada pageerror atau overflow horizontal.
- Diagram: tiga diagram template ter-render; unduhan studio-abu.md memuat judul dan blok Mermaid.
- Persistensi setelah refresh, pencarian, arsip/pulihkan, pembatalan hapus, hapus, filter template, dan dialog Escape: lulus.
- npm audit pada pemasangan dependensi terakhir: 0 kerentanan.
- Screenshot dan browser-result.json disimpan di artifacts (diabaikan Git).

## Deployment produksi
- Client dan Fastify dipublikasikan di https://elprd-rancang.netlify.app, dengan database Supabase proyek elprd.
- Build Netlify berjalan di Linux dengan Node 24 dan terhubung ke branch main GitHub.
- Supabase nyata: koneksi TLS, health, CRUD, foreign-key cascade, penolakan DDL role runtime, dan rollback data uji lulus. Security dan health advisor tidak melaporkan temuan.
- HTTP produksi: halaman utama 200, health database ok, akses tanpa sesi 401, Origin asing 403, pendaftaran dan login berhasil; cookie Secure/HttpOnly/SameSite=Lax dan pencabutan sesi saat logout terverifikasi.
- AI nyata melalui Netlify AI Gateway: PRD 10 bagian dan SSE complete berhasil. Riwayat setelah login ulang, unduhan Markdown berisi Mermaid, arsip, dan hapus lulus; akun lain ditolak saat membaca, mengubah, atau menghapus dokumen. Seluruh data akun uji dibersihkan.
- Deployment Netlify terverifikasi: `6afbfe59b1251188aab33860`, source commit `11d645d`.

## Batas verifikasi
- Pemeriksaan visual langsung di URL Netlify belum selesai karena kontrol browser tidak tersedia; hasil browser di atas berasal dari build lokal sebelumnya.
- Container Docker produksi belum dijalankan; backend produksi memakai Netlify Server.
- Audit Lighthouse dan simulasi 4G belum dijalankan.
- Seedance: aset video belum tersedia.
- Grammar diagram dari AI divalidasi client; server baru memeriksa struktur JSON dan pola konten berbahaya.


