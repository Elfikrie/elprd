// Uji migrasi di PostgreSQL WASM serta konfigurasi pool tanpa menghubungi layanan cloud.
import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { PGlite } from '@electric-sql/pglite';
import { connectionOptions } from '../apps/api/src/db/connection';
import { runtimeSchema } from '../apps/api/src/runtime';
describe('deployment Netlify dan Supabase', () => {
  it('membuat schema terisolasi, foreign key, indeks dan RLS', async () => {
    const db = new PGlite();
    try {
      await db.exec(await readFile(new URL('../apps/api/migrations/0001_initial.sql', import.meta.url), 'utf8'));
      const tables = await db.query<{ relname: string; relrowsecurity: boolean }>("select relname, relrowsecurity from pg_class where relnamespace = 'rancang'::regnamespace and relkind = 'r'");
      expect(tables.rows).toHaveLength(4);
      expect(tables.rows.every(row => row.relrowsecurity)).toBe(true);
      const indexes = await db.query<{ indexname: string }>("select indexname from pg_indexes where schemaname='rancang'");
      expect(indexes.rows.map(row => row.indexname)).toContain('plans_owner_created_idx');
      await expect(db.exec("insert into rancang.plans(id,user_id,document) values ('e6b40b12-3582-4c8c-ae03-d4b6a5c83383','f9abc273-5de4-4e29-b437-f636d18b5eb1','{}')")).rejects.toThrow();
      await db.exec('create role rancang_anon; set role rancang_anon');
      await expect(db.query('select * from rancang.users')).rejects.toThrow();
    } finally { await db.close(); }
  }, 20000);
  it('memakai TLS dan tanpa prepared statements untuk Supabase pooler', () => {
    const options = connectionOptions('postgres://user:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres');
    expect(options.ssl).toBe('require'); expect(options.prepare).toBe(false);
    expect(options.idle_timeout).toBeLessThan(60); expect(options.max).toBeLessThanOrEqual(3);
    expect(connectionOptions('postgres://user:password@localhost:5432/rancang').ssl).toBeUndefined();
  });
  it('menerima kredensial gateway yang baru disuntikkan saat runtime dan menolak DB kosong', () => {
    const env = { DATABASE_URL: 'postgres://user:password@localhost/db', WEB_ORIGIN: 'https://elprd.netlify.app', ANTHROPIC_MODEL: 'configured-model' };
    expect(runtimeSchema.safeParse(env).success).toBe(true);
    expect(runtimeSchema.safeParse({ ...env, DATABASE_URL: '' }).success).toBe(false);
  });
});
