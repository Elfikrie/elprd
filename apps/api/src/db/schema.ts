// Skema PostgreSQL sesuai migrasi tertulis; JSONB menyimpan dokumen tervalidasi beserta inputnya.
import { pgSchema, uuid, text, timestamp, jsonb, primaryKey, date, integer, index } from 'drizzle-orm/pg-core';
import type { Plan } from '../../../../packages/shared/schema';
const rancangSchema = pgSchema('rancang');
export const users = rancangSchema.table('users', { id: uuid('id').primaryKey(), email: text('email').notNull().unique(), passwordHash: text('password_hash').notNull(), createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull() });
export const sessions = rancangSchema.table('sessions', { tokenHash: text('token_hash').primaryKey(), userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(), expiresAt: timestamp('expires_at', { withTimezone: true }).notNull() }, table => [index('sessions_expiry_idx').on(table.expiresAt)]);
export const plans = rancangSchema.table('plans', { id: uuid('id').primaryKey(), userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(), document: jsonb('document').$type<Plan>().notNull(), createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull() }, table => [index('plans_owner_created_idx').on(table.userId, table.createdAt)]);
export const quotas = rancangSchema.table('generation_quotas', { userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(), day: date('day').notNull(), count: integer('count').notNull().default(0) }, table => [primaryKey({ columns: [table.userId, table.day] })]);
