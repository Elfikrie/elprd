# Rancangan sistem

## Dua mode
Mode lokal: React memvalidasi ide dengan Zod, menyusun draf dari template, menyimpan plan pada localStorage, dan mengunduh Blob Markdown. Data tidak dikirim ke server.

Mode AI: React mengirim input ke Node.js. Node memvalidasi Origin/sesi/kuota, meneruskan ke Anthropic, memvalidasi JSON, menyimpan pada PostgreSQL, dan mengirim event complete. Ekspor dilakukan server.

```mermaid
flowchart LR
  U[Pengguna] --> W[React client]
  W -->|Mode lokal| L[(Browser localStorage)]
  W -->|Cookie dan HTTPS| A[Node.js Fastify]
  A --> P[(PostgreSQL)]
  A --> C[Anthropic Messages API]
```

```mermaid
sequenceDiagram
  actor User as Pengguna
  participant Web as React
  participant API as Node API
  participant LLM as Anthropic
  participant DB as PostgreSQL
  User->>Web: Kirim ide
  Web->>API: POST /api/plans/generate
  API->>DB: Validasi sesi dan reservasi kuota
  API->>LLM: Stream Messages
  LLM-->>API: Potongan teks
  API-->>Web: SSE delta
  API->>API: Parse dan validasi Zod
  API->>DB: Simpan plan
  API-->>Web: SSE complete
  User->>Web: Unduh Markdown
  Web->>API: GET /api/plans/:id/export
  API-->>Web: text/markdown
```

```mermaid
erDiagram
  USERS ||--o{ SESSIONS : owns
  USERS ||--o{ PLANS : owns
  USERS ||--o{ GENERATION_QUOTAS : has
  USERS {
    uuid id PK
    text email UK
    text password_hash
    timestamptz created_at
  }
  SESSIONS {
    text token_hash PK
    uuid user_id FK
    timestamptz expires_at
  }
  PLANS {
    uuid id PK
    uuid user_id FK
    jsonb document
    timestamptz created_at
  }
  GENERATION_QUOTAS {
    uuid user_id PK,FK
    date day PK
    integer count
  }
```

Indeks: sessions.expires_at; plans(user_id, created_at DESC). Migrasi dijalankan sekali secara transaksional dengan advisory lock. Password memakai argon2. Token sesi acak 256 bit disimpan sebagai SHA-256, berlaku 14 hari. Cookie httpOnly, SameSite=Lax, secure di produksi. Semua mutasi memeriksa Origin tepat dan body maksimal 24 KB.

## Kontrak PRD
Minimal delapan bagian wajib: overview, goals, users, features, architecture, diagrams, tasks, questions. Mode template membuat 11 bagian; mode AI menerima 8–16 bagian dengan ID unik. Semua asumsi ditandai. Markdown mentah tidak mengeksekusi HTML. Mermaid strict memakai fallback kode bila parsing gagal.

## Batas arsitektur
- Node tidak dihosting di Sites statis; perlu deployment terpisah.
- Di versi ini JSONB menyimpan satu versi plan. Riwayat versi belum dibuat.
- Otorisasi berada di server/repository, tidak mengandalkan tombol client.
- Satu proses Node menyimpan pembatas satu generation aktif/pengguna di memori; kuota harian tetap atomik di database.
- Backup dan pemantauan produksi harus disiapkan sebelum menerima pengguna nyata.

