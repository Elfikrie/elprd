// Kontrak persistensi bersama untuk server dan pengujian, tanpa state global implisit.
import type { Plan } from '../../../packages/shared/schema';
export interface Account { id: string; email: string; passwordHash: string; }
export interface Session { tokenHash: string; userId: string; expiresAt: Date; }
export interface Repository {
  findAccount(email: string): Promise<Account | null>;
  createAccount(account: Account): Promise<void>;
  saveSession(session: Session): Promise<void>;
  findSession(hash: string): Promise<Account | null>;
  deleteSession(hash: string): Promise<void>;
  listPlans(userId: string): Promise<Plan[]>;
  findPlan(userId: string, id: string): Promise<Plan | null>;
  savePlan(userId: string, plan: Plan): Promise<void>;
  deletePlan(userId: string, id: string): Promise<void>;
  reserveGeneration(userId: string, limit: number): Promise<boolean>;
}

