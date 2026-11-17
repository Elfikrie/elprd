// Server HTTP dapat diuji dengan dependensi palsu; autentikasi, CSRF, dan kepemilikan diperiksa di server.
import Fastify from 'fastify';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { hash, verify } from 'argon2';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { credentialsSchema, planInputSchema, documentSchema, safeFilename, toMarkdown, type Plan } from '../../../packages/shared/schema';
import type { Repository } from './repository';
import type { LlmProvider } from './provider';
import { sessionAuth } from './auth';
import { GenerationError, generationFailure } from './generation-error';
export interface AppOptions { repository: Repository; provider: LlmProvider; origin: string; secureCookies?: boolean; dailyLimit?: number; health?: () => Promise<void>; logger?: boolean; cors?: boolean; }
export async function createApp(options: AppOptions) {
  const app = Fastify({ logger: options.logger ?? false, bodyLimit: 24000, requestTimeout: 150000 });
  const repo = options.repository; const auth = sessionAuth(repo, !!options.secureCookies); const active = new Set<string>();
  if (options.cors !== false) await app.register(cors, { origin: options.origin, credentials: true, methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'] });
  await app.register(cookie); await app.register(helmet);
  await app.register(rateLimit, { max: 120, timeWindow: '1 minute', errorResponseBuilder: () => ({ code: 'RATE_LIMIT', message: 'Terlalu banyak permintaan. Tunggu sebentar.' }) });
  app.addHook('preHandler', async (request, reply) => {
    if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method) && request.headers.origin !== options.origin) return reply.code(403).send({ code: 'ORIGIN_REJECTED', message: 'Asal permintaan tidak diizinkan.' });
  });
  app.setErrorHandler((error, request, reply) => {
    if (error instanceof z.ZodError) return reply.code(400).send({ code: 'INVALID_INPUT', message: error.issues[0]?.message || 'Input belum valid.' });
    request.log.error(error);
    const status = typeof error === 'object' && error && 'statusCode' in error && typeof error.statusCode === 'number' ? error.statusCode : 500;
    return reply.code(status).send({ code: 'REQUEST_FAILED', message: status === 429 ? 'Terlalu banyak permintaan. Tunggu sebentar.' : 'Permintaan belum bisa diproses. Coba lagi.' });
  });
  app.get('/api/health', async (_request, reply) => { try { await options.health?.(); return { status: 'ok' }; } catch { return reply.code(503).send({ status: 'unavailable' }); } });
  app.get('/api/auth/me', async request => ({ email: (await auth.current(request))?.email ?? null }));
  app.post('/api/auth/register', { config: { rateLimit: { max: 5, timeWindow: '1 minute' } } }, async (request, reply) => {
    const credentials = credentialsSchema.parse(request.body); const email = credentials.email.toLowerCase();
    if (await repo.findAccount(email)) return reply.code(409).send({ code: 'ACCOUNT_EXISTS', message: 'Email sudah terdaftar. Gunakan halaman masuk.' });
    const account = { id: randomUUID(), email, passwordHash: await hash(credentials.password) };
    await repo.createAccount(account); await auth.create(reply, account); return reply.code(201).send({ email });
  });
  app.post('/api/auth/login', { config: { rateLimit: { max: 5, timeWindow: '1 minute' } } }, async (request, reply) => {
    const credentials = credentialsSchema.parse(request.body); const account = await repo.findAccount(credentials.email.toLowerCase());
    if (!account || !await verify(account.passwordHash, credentials.password)) return reply.code(401).send({ code: 'LOGIN_FAILED', message: 'Email atau kata sandi belum sesuai.' });
    await auth.create(reply, account); return { email: account.email };
  });
  app.post('/api/auth/logout', async (request, reply) => { await auth.clear(request, reply); return { success: true }; });
  await app.register(async privateApp => {
    privateApp.addHook('preHandler', async (request, reply) => { if (!await auth.current(request)) return reply.code(401).send({ code: 'LOGIN_REQUIRED', message: 'Masuk dahulu untuk melanjutkan.' }); });
    privateApp.get('/api/plans', async request => repo.listPlans((await auth.current(request))!.id));
    privateApp.get('/api/plans/:id', async (request, reply) => {
      const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
      const plan = await repo.findPlan((await auth.current(request))!.id, id);
      return plan || reply.code(404).send({ code: 'NOT_FOUND', message: 'Rancangan tidak ditemukan.' });
    });
    privateApp.patch('/api/plans/:id', async (request, reply) => {
      const { id } = z.object({ id: z.string().uuid() }).parse(request.params); const user = (await auth.current(request))!;
      const patch = z.object({ archived: z.boolean() }).strict().parse(request.body);
      const plan = await repo.findPlan(user.id, id);
      if (!plan) return reply.code(404).send({ code: 'NOT_FOUND', message: 'Rancangan tidak ditemukan.' });
      const next = { ...plan, archived: patch.archived, updatedAt: new Date().toISOString() }; await repo.savePlan(user.id, next); return next;
    });
    privateApp.delete('/api/plans/:id', async (request, reply) => {
      const { id } = z.object({ id: z.string().uuid() }).parse(request.params); const user = (await auth.current(request))!;
      if (!await repo.findPlan(user.id, id)) return reply.code(404).send({ code: 'NOT_FOUND', message: 'Rancangan tidak ditemukan.' });
      await repo.deletePlan(user.id, id); return { success: true };
    });
    privateApp.get('/api/plans/:id/export', async (request, reply) => {
      const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
      const plan = await repo.findPlan((await auth.current(request))!.id, id);
      if (!plan) return reply.code(404).send({ code: 'NOT_FOUND', message: 'Rancangan tidak ditemukan.' });
      return reply.type('text/markdown; charset=utf-8').header('Content-Disposition', 'attachment; filename="' + safeFilename(plan.title) + '"').send(toMarkdown(plan));
    });
    privateApp.post('/api/plans/generate', { config: { rateLimit: { max: 3, timeWindow: '1 minute' } } }, async (request, reply) => {
      const input = planInputSchema.parse(request.body); const user = (await auth.current(request))!;
      if (active.has(user.id)) return reply.code(409).send({ code: 'IN_PROGRESS', message: 'Masih ada rancangan yang sedang disusun.' });
      active.add(user.id);
      try { if (!await repo.reserveGeneration(user.id, options.dailyLimit ?? 10)) { active.delete(user.id); return reply.code(429).send({ code: 'DAILY_LIMIT', message: 'Kuota harian habis. Coba kembali besok (UTC).' }); } } catch (error) { active.delete(user.id); throw error; }
      reply.hijack();
      for (const [key, value] of Object.entries(reply.getHeaders())) { if (value !== undefined) reply.raw.setHeader(key, Array.isArray(value) ? value.map(String) : String(value)); }
      reply.raw.writeHead(200, { 'Content-Type': 'text/event-stream; charset=utf-8', 'Cache-Control': 'no-cache, no-transform', Connection: 'keep-alive', 'X-Accel-Buffering': 'no' });
      const controller = new AbortController(); const abort = () => controller.abort(); reply.raw.on('close', abort);
      const emit = (event: string, data: unknown) => { if (!reply.raw.destroyed) reply.raw.write('event: ' + event + '\ndata: ' + JSON.stringify(data) + '\n\n'); };
      const heartbeat = setInterval(() => { if (!reply.raw.destroyed) reply.raw.write(': heartbeat\n\n'); }, 15000);
      let stage: 'provider' | 'storage' = 'provider';
      try {
        const doc = documentSchema.parse(await options.provider.generate(input, text => emit('delta', { text }), controller.signal));
        if (controller.signal.aborted) return;
        const now = new Date().toISOString();
        const plan: Plan = { ...doc, id: randomUUID(), input, createdAt: now, updatedAt: now, archived: false, mode: 'ai' };
        stage = 'storage';
        await repo.savePlan(user.id, plan); emit('complete', plan);
      } catch (error) {
        if (!controller.signal.aborted) {
          const failure = generationFailure(error, stage);
          request.log.error({ event: 'prd_generation_failed', stage, code: failure.code, stopReason: error instanceof GenerationError ? error.stopReason : undefined, errorType: error instanceof Error ? error.name : 'Unknown' }, failure.message);
          emit('error', failure);
        }
      }
      finally { clearInterval(heartbeat); active.delete(user.id); reply.raw.off('close', abort); reply.raw.end(); }
    });
  });
  return app;
}
