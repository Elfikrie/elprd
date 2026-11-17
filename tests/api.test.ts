// Integrasi HTTP dengan repositori dan LLM palsu: tidak mengirim data ke layanan eksternal.
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { createApp } from '../apps/api/src/app';
import { memoryRepository } from './memory-repository';
import { createDraft } from '../packages/shared/generator';
import { templates } from '../packages/shared/templates';
import type { Plan } from '../packages/shared/schema';
import { GenerationError } from '../apps/api/src/generation-error';
const origin = 'http://127.0.0.1:5178';
let app: FastifyInstance;
const headers = { origin };
async function register(email: string) {
  const response = await app.inject({ method: 'POST', url: '/api/auth/register', headers, payload: { email, password: 'test-password-123' } });
  expect(response.statusCode).toBe(201);
  expect(response.headers['set-cookie']).toContain('HttpOnly');
  return response.cookies[0].name + '=' + response.cookies[0].value;
}
async function generate(cookie: string) {
  return app.inject({ method: 'POST', url: '/api/plans/generate', headers: { ...headers, cookie }, payload: templates[0].input });
}
beforeEach(async () => { app = await createApp({ repository: memoryRepository(), origin, dailyLimit: 1, provider: { async generate(input, delta) { delta('Menyusun draf'); return createDraft(input); } } }); });
afterEach(async () => { await app.close(); });
describe('API privat', () => {
  it('registrasi → generate SSE → ekspor → arsip → hapus', async () => {
    const cookie = await register('one@example.test');
    const response = await generate(cookie); expect(response.statusCode).toBe(200); expect(response.body).toContain('event: delta');
    const complete = response.body.split('\n\n').find(frame => frame.startsWith('event: complete'))!;
    const plan = JSON.parse(complete.split('\ndata: ')[1]) as Plan;
    const exported = await app.inject({ url: '/api/plans/' + plan.id + '/export', headers: { cookie } });
    expect(exported.statusCode).toBe(200); expect(exported.headers['content-disposition']).toContain('.md'); expect(exported.body).toContain('```mermaid');
    expect((await app.inject({ method: 'PATCH', url: '/api/plans/' + plan.id, headers: { ...headers, cookie }, payload: { archived: true } })).json().archived).toBe(true);
    expect((await app.inject({ method: 'DELETE', url: '/api/plans/' + plan.id, headers: { ...headers, cookie } })).statusCode).toBe(200);
    expect((await app.inject({ url: '/api/plans', headers: { cookie } })).json()).toEqual([]);
  });
  it('memisahkan pemilik dan membatasi kuota', async () => {
    const owner = await register('owner@example.test'); const other = await register('other@example.test');
    await generate(owner);
    const plan = (await app.inject({ url: '/api/plans', headers: { cookie: owner } })).json<Plan[]>()[0];
    for (const suffix of ['', '/export']) expect((await app.inject({ url: '/api/plans/' + plan.id + suffix, headers: { cookie: other } })).statusCode).toBe(404);
    expect((await app.inject({ method: 'DELETE', url: '/api/plans/' + plan.id, headers: { ...headers, cookie: other } })).statusCode).toBe(404);
    expect((await generate(owner)).statusCode).toBe(429);
  });
  it('menolak sesi kosong, Origin asing, dan password salah; logout mengakhiri sesi', async () => {
    expect((await app.inject('/api/plans')).statusCode).toBe(401);
    expect((await app.inject({ method: 'POST', url: '/api/auth/login', headers: { origin: 'https://untrusted.invalid' }, payload: {} })).statusCode).toBe(403);
    const cookie = await register('user@example.test');
    expect((await app.inject({ method: 'POST', url: '/api/auth/login', headers, payload: { email: 'user@example.test', password: 'wrong-password' } })).statusCode).toBe(401);
    await app.inject({ method: 'POST', url: '/api/auth/logout', headers: { ...headers, cookie }, payload: {} });
    expect((await app.inject({ url: '/api/plans', headers: { cookie } })).statusCode).toBe(401);
  });
  it('kegagalan provider tidak menyimpan plan parsial', async () => {
    await app.close();
    app = await createApp({ repository: memoryRepository(), origin, provider: { async generate() { throw new Error('failure'); } } });
    const cookie = await register('error@example.test'); const response = await generate(cookie);
    expect(response.body).toContain('event: error'); expect(response.body).not.toContain('event: complete');
    expect((await app.inject({ url: '/api/plans', headers: { cookie } })).json()).toEqual([]);
  });
  it('menampilkan alasan batas output melalui SSE tanpa menyebut koneksi atau menyimpan draf parsial', async () => {
    await app.close();
    app = await createApp({ repository: memoryRepository(), origin, provider: { async generate() { throw new GenerationError('AI_OUTPUT_LIMIT', 'Dokumen terlalu panjang. Pilih detail Ringkas.', 'max_tokens'); } } });
    const cookie = await register('limit@example.test'); const response = await generate(cookie);
    expect(response.body).toContain('AI_OUTPUT_LIMIT'); expect(response.body).toContain('Pilih detail Ringkas');
    expect(response.body).not.toContain('Periksa koneksi'); expect(response.body).not.toContain('event: complete');
    expect((await app.inject({ url: '/api/plans', headers: { cookie } })).json()).toEqual([]);
  });
});

