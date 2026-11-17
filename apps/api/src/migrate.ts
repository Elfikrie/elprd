// Perintah migrasi eksplisit; tidak berjalan otomatis ketika server mulai menerima request.
import 'dotenv/config';
import { z } from 'zod';
import { applyMigrations } from './db/migrations';
await applyMigrations(z.string().url().parse(process.env.DATABASE_URL));
console.log('Migrasi schema rancang selesai.');

