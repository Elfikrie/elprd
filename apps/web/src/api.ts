// Klien API opsional; cookie sesi tetap httpOnly dan kunci Anthropic tidak pernah dikirim ke browser.
import { documentSchema, planSchema, type Plan, type PlanInput } from '../../../packages/shared/schema';
import { z } from 'zod';
export const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') || '';
export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(API_URL + path, { ...init, credentials: 'include', headers: { 'Content-Type': 'application/json', ...init.headers } });
  const body: unknown = await response.json();
  if (!response.ok) throw new Error(z.object({ message: z.string() }).safeParse(body).data?.message || 'Permintaan belum berhasil. Coba lagi.');
  return body as T;
}
export async function streamPlan(input: PlanInput, signal: AbortSignal, onProgress: (count: number) => void): Promise<Plan> {
  const response = await fetch(API_URL + '/api/plans/generate', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input), signal });
  if (!response.ok || !response.body) {
    const error: unknown = await response.json().catch(() => ({}));
    throw new Error(z.object({ message: z.string() }).safeParse(error).data?.message || 'Layanan AI belum tersedia.');
  }
  const reader = response.body.getReader(); const decoder = new TextDecoder(); let buffer = ''; let result: Plan | null = null; let count = 0;
  while (true) {
    const { value, done } = await reader.read(); if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let boundary: number;
    while ((boundary = buffer.indexOf('\n\n')) >= 0) {
      const frame = buffer.slice(0, boundary); buffer = buffer.slice(boundary + 2);
      const data = frame.split('\n').find(line => line.startsWith('data: '))?.slice(6);
      const event = frame.split('\n').find(line => line.startsWith('event: '))?.slice(7);
      if (!data) continue;
      if (event === 'delta') { const d = z.object({ text: z.string() }).parse(JSON.parse(data)); count += d.text.length; onProgress(count); }
      if (event === 'complete') { const parsed = planSchema.parse(JSON.parse(data)); documentSchema.parse(parsed); result = parsed; }
      if (event === 'error') throw new Error(z.object({ message: z.string() }).parse(JSON.parse(data)).message);
    }
  }
  if (!result) throw new Error('Koneksi terputus sebelum dokumen selesai. Draf belum disimpan.');
  return result;
}

