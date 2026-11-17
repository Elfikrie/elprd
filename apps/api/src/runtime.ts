// Konfigurasi bersama Node lokal dan Netlify; rahasia tetap berada di environment server.
import { z } from 'zod';
import { createApp } from './app';
import { postgresRepository } from './db/postgres-repository';
import { AnthropicProvider } from './provider';
export const runtimeSchema = z.object({
  DATABASE_URL: z.string().url(),
  ANTHROPIC_API_KEY: z.string().optional(),
  ANTHROPIC_BASE_URL: z.string().url().optional(),
  ANTHROPIC_MODEL: z.string().min(1),
  WEB_ORIGIN: z.string().url(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DAILY_GENERATION_LIMIT: z.coerce.number().int().min(1).max(100).default(10),
});
export async function createRuntime(environment: NodeJS.ProcessEnv, hosted = false) {
  const env = runtimeSchema.parse(environment);
  const repository = postgresRepository(env.DATABASE_URL);
  const app = await createApp({
    repository,
    provider: new AnthropicProvider(env.ANTHROPIC_API_KEY, env.ANTHROPIC_MODEL, env.ANTHROPIC_BASE_URL),
    origin: new URL(env.WEB_ORIGIN).origin,
    secureCookies: hosted || env.NODE_ENV === 'production',
    dailyLimit: env.DAILY_GENERATION_LIMIT,
    health: repository.health,
    logger: true,
    cors: !hosted,
  });
  app.addHook('onClose', async () => repository.close());
  return app;
}
