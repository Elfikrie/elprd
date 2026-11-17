# Kontrak API

JSON error: `{"code":"INVALID_INPUT","message":"Pesan bahasa Indonesia"}`. Input ditentukan pada packages/shared/schema.ts. Semua mutasi memerlukan header Origin sama dengan WEB_ORIGIN. Endpoint privat memerlukan cookie rancang_session.

| Metode | Path | Auth | Input | Respons |
| --- | --- | --- | --- | --- |
| GET | /api/health | Tidak | — | 200 status ok / 503 unavailable |
| GET | /api/auth/me | Opsional | — | email atau null |
| POST | /api/auth/register | Tidak | email, password 10–128 karakter | 201 email + cookie |
| POST | /api/auth/login | Tidak | email, password | 200 email + cookie |
| POST | /api/auth/logout | Opsional | {} | success; hapus sesi |
| GET | /api/plans | Ya | — | 100 plan terbaru |
| GET | /api/plans/:id | Ya | UUID | Plan / 404 |
| PATCH | /api/plans/:id | Ya | archived boolean | Plan |
| DELETE | /api/plans/:id | Ya | — | success |
| POST | /api/plans/generate | Ya | PlanInput | SSE |
| GET | /api/plans/:id/export | Ya | UUID | text/markdown, filename aman |

PlanInput: idea 20–6000 karakter; name maksimal 80; audience maksimal 400; features maksimal 2000; platform Website/Aplikasi mobile/Website & mobile; detail Ringkas/Lengkap.

SSE event:
- delta: `{"text":"potongan teks"}` — progres penerimaan.
- complete: seluruh Plan tervalidasi, termasuk input, sections, createdAt, updatedAt, archived, mode.
- error: `{"code":"GENERATION_FAILED","message":"..."}` — tidak menyimpan plan parsial.
- Komentar heartbeat dikirim tiap 15 detik.
- Pembatalan browser menutup koneksi dan membatalkan provider.

Batas: global 120/menit/IP, register/login 5/menit/IP, generate 3/menit/IP, 10 percobaan/hari/pengguna default. Gagal atau dibatalkan tetap memakai kuota. Origin salah 403, sesi salah 401, kepemilikan salah 404, kuota 429, input invalid 400.

## Uji manual
1. Jalankan database, migrasi, API, dan client sesuai README.
2. Daftar dari tombol Masuk; cek sesi tetap aktif setelah refresh.
3. Isi ide, susun plan, perhatikan progres, lalu unduh Markdown.
4. Arsipkan, pulihkan, cari, dan hapus plan.
5. Matikan API; pastikan error terlihat dan input tidak hilang.
6. Coba dari akun kedua; plan akun pertama harus tidak terbaca.

