// Repositori terisolasi untuk pengujian; tidak digunakan dalam produksi.
import type { Repository, Account, Session } from '../apps/api/src/repository';
import type { Plan } from '../packages/shared/schema';
export function memoryRepository(): Repository {
  const accounts = new Map<string, Account>(); const sessions = new Map<string, Session>(); const plans = new Map<string, { owner: string; plan: Plan }>(); const quotas = new Map<string, number>();
  return {
    async findAccount(email) { return [...accounts.values()].find(a => a.email === email) ?? null; },
    async createAccount(account) { accounts.set(account.id, account); },
    async saveSession(session) { sessions.set(session.tokenHash, session); },
    async findSession(hash) { const session = sessions.get(hash); return session && session.expiresAt > new Date() ? accounts.get(session.userId) ?? null : null; },
    async deleteSession(hash) { sessions.delete(hash); },
    async listPlans(userId) { return [...plans.values()].filter(p => p.owner === userId).map(p => p.plan); },
    async findPlan(userId, id) { const data = plans.get(id); return data?.owner === userId ? data.plan : null; },
    async savePlan(userId, plan) { const existing = plans.get(plan.id); if (!existing || existing.owner === userId) plans.set(plan.id, { owner: userId, plan }); },
    async deletePlan(userId, id) { if (plans.get(id)?.owner === userId) plans.delete(id); },
    async reserveGeneration(userId, limit) { const count = quotas.get(userId) ?? 0; if (count >= limit) return false; quotas.set(userId, count + 1); return true; },
  };
}

