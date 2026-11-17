// Penyimpanan lokal tervalidasi; kegagalan kuota ditampilkan agar draf tidak dianggap tersimpan.
import { z } from 'zod';
import { planSchema, type Plan } from '../../../packages/shared/schema';
const KEY = 'rancang:plans:v1';
export function readPlans(): Plan[] {
  try { const raw = localStorage.getItem(KEY); return raw ? z.array(planSchema).parse(JSON.parse(raw)) : []; }
  catch { return []; }
}
export function writePlans(plans: Plan[]): void { localStorage.setItem(KEY, JSON.stringify(plans)); }

