# Database hosted Rancang

Project: `hieomcgaxjkrktuvhdgb` (`elprd`), region `ap-northeast-1`.

Berkas pada `migrations/` mencerminkan tiga migrasi yang sudah diterapkan melalui Supabase MCP. Nama versi berasal dari riwayat migrasi database. Jangan menjalankan ulang SQL tersebut secara manual pada database yang sama.

Schema `rancang` tidak diekspos ke Data API. Role `rancang_api` hanya diberi akses CRUD pada tabel aplikasi dan SELECT pada metadata migrasi; tanpa CREATE, superuser, atau BYPASSRLS. Policy RLS khusus role backend memakai izin penuh pada tabel aplikasi karena otorisasi pengguna dan filter kepemilikan dijalankan oleh Fastify. Role `anon` dan `authenticated` tidak mendapat akses schema.

Password login role backend disetel terpisah dan tidak disimpan di repository ataupun riwayat migrasi. Pada instalasi baru, role dibuat NOLOGIN sampai password kuat dipasang oleh operator. Migrasi hardening mengasumsikan fungsi event trigger `public.rls_auto_enable()` bawaan proyek tersedia.

Netlify Server menggunakan shared **Session pooler** port 5432, dengan pool maksimal tiga koneksi dan idle timeout 20 detik. Pilihan ini menghindari ketidakcocokan pipelining postgres.js dengan Transaction pooler. Host harus disalin dari panel Connect proyek, bukan ditebak dari region.

Verifikasi produksi: lima tabel memiliki RLS, advisor security/health tanpa temuan, koneksi role backend berhasil, CRUD dan foreign-key cascade lulus dalam transaksi yang dibatalkan, serta CREATE TABLE ditolak.
