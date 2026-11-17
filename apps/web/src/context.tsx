// State aplikasi, notifikasi, dan persistensi. Perubahan gagal tidak diterapkan diam-diam.
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { z } from 'zod';
import { planSchema, type Plan } from '../../../packages/shared/schema';
import { readPlans, writePlans } from './storage';
import { API_URL, api } from './api';
interface Workspace {
  plans: Plan[]; user: string | null; toast: (message: string) => void;
  save: (plan: Plan) => Promise<void>; archive: (id: string) => Promise<void>;
  remove: (id: string) => Promise<void>; authenticate: (email: string, password: string, register: boolean) => Promise<void>; logout: () => Promise<void>;
}
const Context = createContext<Workspace | null>(null);
export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [plans, setPlans] = useState<Plan[]>(API_URL ? [] : readPlans);
  const [user, setUser] = useState<string | null>(null);
  const [message, setMessage] = useState(''); const [toastKey, setToastKey] = useState(0);
  const toast = (text: string) => { setMessage(text); setToastKey(key => key + 1); };
  useEffect(() => { const timeout = setTimeout(() => setMessage(''), 4500); return () => clearTimeout(timeout); }, [toastKey]);
  useEffect(() => {
    if (!API_URL) return;
    api<{ email: string | null }>('/api/auth/me').then(async data => {
      setUser(data.email);
      if (data.email) setPlans(z.array(planSchema).parse(await api('/api/plans')));
    }).catch(() => toast('Server belum terhubung. Periksa konfigurasi API.'));
  }, []);
  async function update(next: Plan[]) { if (!API_URL) writePlans(next); setPlans(next); }
  async function save(plan: Plan) { await update([plan, ...plans.filter(p => p.id !== plan.id)]); }
  async function archive(id: string) {
    const plan = plans.find(p => p.id === id); if (!plan) return;
    if (API_URL) await api('/api/plans/' + id, { method: 'PATCH', body: JSON.stringify({ archived: !plan.archived }) });
    await update(plans.map(p => p.id === id ? { ...p, archived: !p.archived } : p));
    toast(plan.archived ? 'Plan dipulihkan ke riwayat.' : 'Plan dipindahkan ke arsip.');
  }
  async function remove(id: string) {
    if (API_URL) await api('/api/plans/' + id, { method: 'DELETE' });
    await update(plans.filter(p => p.id !== id)); toast('Plan sudah dihapus.');
  }
  async function authenticate(email: string, password: string, register: boolean) {
    await api('/api/auth/' + (register ? 'register' : 'login'), { method: 'POST', body: JSON.stringify({ email, password }) });
    setUser(email); setPlans(z.array(planSchema).parse(await api('/api/plans'))); toast('Berhasil masuk ke ruang kerja.');
  }
  async function logout() { await api('/api/auth/logout', { method: 'POST', body: '{}' }); setUser(null); setPlans([]); toast('Kamu sudah keluar.'); }
  return <Context.Provider value={{ plans, user, toast, save, archive, remove, authenticate, logout }}>{children}<div className={'toast ' + (message ? 'visible' : '')} role="status">{message}</div></Context.Provider>;
}
export function useWorkspace() { const value = useContext(Context); if (!value) throw new Error('Workspace tidak tersedia'); return value; }

