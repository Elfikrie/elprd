// Migrasi SQL eksplisit, transaksional, dan dikunci agar aman dijalankan ulang.
import 'dotenv/config';
import postgres from 'postgres';
import { readFile } from 'node:fs/promises';
import { z } from 'zod';
const url = z.string().url().parse(process.env.DATABASE_URL);
const db = postgres(url, { max: 1 });
try {
  await db.begin(async transaction => {
    await transaction`SELECT pg_advisory_xact_lock(8172601)`;
    await transaction`CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())`;
    const rows = await transaction`SELECT name FROM schema_migrations WHERE name = '0001_initial'`;
    if (!rows.length) {
      const migration = await readFile(new URL('../migrations/0001_initial.sql', import.meta.url), 'utf8');
      await transaction.unsafe(migration);
      await transaction`INSERT INTO schema_migrations(name) VALUES ('0001_initial')`;
    }
  });
  console.log('Migrasi selesai.');
} finally { await db.end(); }

