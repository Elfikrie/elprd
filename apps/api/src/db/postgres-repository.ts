// PostgreSQL memakai parameterisasi Drizzle dan filter kepemilikan pada setiap akses plan.
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { and, desc, eq, gt, lt, sql } from 'drizzle-orm';
import { users, sessions, plans, quotas } from './schema';
import type { Account, Session, Repository } from '../repository';
import { planSchema, type Plan } from '../../../../packages/shared/schema';
export function postgresRepository(url: string): Repository & { close: () => Promise<void>; health: () => Promise<void> } {
  const connection = postgres(url, { max: 10 }); const db = drizzle(connection);
  return {
    async findAccount(email) { return (await db.select().from(users).where(eq(users.email, email)).limit(1))[0] ?? null; },
    async createAccount(account: Account) { await db.insert(users).values(account); },
    async saveSession(session: Session) { await db.insert(sessions).values(session); },
    async findSession(hash) {
      const result = await db.select({ account: users }).from(sessions).innerJoin(users, eq(sessions.userId, users.id)).where(and(eq(sessions.tokenHash, hash), gt(sessions.expiresAt, new Date()))).limit(1);
      return result[0]?.account ?? null;
    },
    async deleteSession(hash) { await db.delete(sessions).where(eq(sessions.tokenHash, hash)); },
    async listPlans(userId) { return (await db.select().from(plans).where(eq(plans.userId, userId)).orderBy(desc(plans.createdAt)).limit(100)).map(p => planSchema.parse(p.document)); },
    async findPlan(userId, id) {
      const row = (await db.select().from(plans).where(and(eq(plans.userId, userId), eq(plans.id, id))).limit(1))[0];
      return row ? planSchema.parse(row.document) : null;
    },
    async savePlan(userId, plan: Plan) {
      await db.insert(plans).values({ id: plan.id, userId, document: plan }).onConflictDoUpdate({ target: plans.id, set: { document: plan }, setWhere: eq(plans.userId, userId) });
    },
    async deletePlan(userId, id) { await db.delete(plans).where(and(eq(plans.userId, userId), eq(plans.id, id))); },
    async reserveGeneration(userId, limit) {
      const day = new Date().toISOString().slice(0, 10);
      const result = await db.insert(quotas).values({ userId, day, count: 1 }).onConflictDoUpdate({ target: [quotas.userId, quotas.day], set: { count: sql`${quotas.count} + 1` }, setWhere: lt(quotas.count, limit) }).returning();
      return result.length > 0;
    },
    async health() { await connection`select 1`; },
    async close() { await connection.end(); },
  };
}

