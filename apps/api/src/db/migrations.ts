// Migrasi idempotent memakai lock transaksi dan menolak versi berbeda yang sudah terpasang.
import postgres from 'postgres';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { connectionOptions } from './connection';
export async function applyMigrations(url: string): Promise<void> {
  const db = postgres(url, { ...connectionOptions(url), max: 1 });
  const migration = (await readFile(new URL('../../migrations/0001_initial.sql', import.meta.url), 'utf8')).replace(/\r\n/g, '\n').trim() + '\n';
  const checksum = createHash('sha256').update(migration).digest('hex');
  try {
    await db.begin(async transaction => {
      await transaction`SELECT pg_advisory_xact_lock(8172601)`;
      await transaction`CREATE SCHEMA IF NOT EXISTS rancang`;
      await transaction`REVOKE ALL ON SCHEMA rancang FROM PUBLIC`;
      await transaction`CREATE TABLE IF NOT EXISTS rancang.schema_migrations (name TEXT PRIMARY KEY, checksum TEXT NOT NULL, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())`;
      await transaction`ALTER TABLE rancang.schema_migrations ENABLE ROW LEVEL SECURITY`;
      const rows = await transaction`SELECT checksum FROM rancang.schema_migrations WHERE name = '0001_initial'`;
      if (rows.length && rows[0].checksum !== checksum) throw new Error('Checksum migrasi berbeda. Tinjau migrasi sebelum melanjutkan.');
      if (!rows.length) {
        await transaction.unsafe(migration);
        await transaction`INSERT INTO rancang.schema_migrations(name, checksum) VALUES ('0001_initial', ${checksum})`;
      }
    });
  } finally { await db.end(); }
}
