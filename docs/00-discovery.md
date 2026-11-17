# Keputusan produk dan visual

Permintaan pengguna: membuat produk dari lampiran dengan nuansa minimalis abu-abu. Lampiran dipakai sebagai spesifikasi referensi. Instruksi internal lampiran yang meminta berhenti di fase 0 tidak diperlakukan sebagai instruksi langsung untuk menghentikan pembangunan.

Nama kerja: **Rancang**. Antarmuka Indonesia; kode/berkas Inggris. Arah visual: kertas abu-abu terang, permukaan putih, tipografi arang, garis tipis. Spasi dan hirarki menggantikan dekorasi yang ramai. Manrope dipakai untuk judul dan DM Sans untuk isi; keduanya memiliki fallback sans-serif. Abu-abu dipilih sesuai permintaan terbaru, menggantikan palet biru tua dalam lampiran.

## Referensi diperiksa 17 November 2026
- [Ngoding Pake AI](https://www.ngodingpakeai.com/): alur ide menuju PRD/task list, akses riwayat, dan contoh menjadi rujukan struktur. Identitas visual dan teks tidak disalin.
- [Higgsfield](https://higgsfield.ai/): situs menyediakan produk video dan tautan API. Aset hero tetap lebih tepat diekspor sekali, kemudian disajikan sebagai aset statis.
- [Anthropic streaming](https://platform.claude.com/docs/en/build-with-claude/streaming): Messages SDK dipakai di server dengan stream dan AbortSignal.
- [Mermaid usage](https://mermaid.js.org/config/usage.html): renderer strict dimuat dinamis.
- [Fastify Reply](https://fastify.dev/docs/latest/Reference/Reply/): SSE menggunakan hijack dan stream respons.

## Pilihan implementasi
React + Vite; server Node + Fastify; PostgreSQL + Drizzle, sesuai keputusan stack pada referensi. CSS langsung menggantikan Tailwind untuk token dan komponen sederhana. Fetch menggantikan query cache karena sumber utama mode lokal. Semua keputusan ini dapat direvisi tanpa mengubah format dokumen.

Tidak menganggap kredensial layanan sudah tersedia. Mode template diberi label di antarmuka dan ekspor. Status penyimpanan lokal dijelaskan pada dialog, tidak disamarkan sebagai akun cloud.

## Keputusan yang masih memerlukan data pengguna
- Akun/model Anthropic dan budget produksi.
- Hosting Node dan PostgreSQL serta domain induk.
- Video Seedance final; pilih arah prompt di hero-video.md.
- Monetisasi, administrasi, retensi, dan kebutuhan email transaksi bila ingin rilis layanan publik.

