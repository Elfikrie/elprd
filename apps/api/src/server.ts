// Bootstrap produksi; konfigurasi wajib divalidasi sebelum menerima permintaan.
import 'dotenv/config';
import { z } from 'zod';
import { createApp } from './app';
import { postgresRepository } from './db/postgres-repository';
import { AnthropicProvider } from './provider';
const env = z.object({
  DATABASE_URL: z.string().url(), ANTHROPIC_API_KEY: z.string().min(1), ANTHROPIC_MODEL: z.string().min(1),
  WEB_ORIGIN: z.string().url(), PORT: z.coerce.number().int().min(1).max(65535).default(3001),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'), DAILY_GENERATION_LIMIT: z.coerce.number().int().min(1).max(100).default(10),
}).parse(process.env);
const repository = postgresRepository(env.DATABASE_URL);
const app = await createApp({ repository, provider: new AnthropicProvider(env.ANTHROPIC_API_KEY, env.ANTHROPIC_MODEL), origin: env.WEB_ORIGIN, secureCookies: env.NODE_ENV === 'production', dailyLimit: env.DAILY_GENERATION_LIMIT, health: repository.health, logger: true });
app.addHook('onClose', async () => repository.close());
for (const signal of ['SIGINT', 'SIGTERM'] as const) process.on(signal, () => { void app.close(); });
await app.listen({ port: env.PORT, host: '0.0.0.0' });

