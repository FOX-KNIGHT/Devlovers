import { pgTable, uuid, text, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { users } from './users.js';

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  actorId: uuid('actor_id')
    .references(() => users.id)
    .notNull(),
  action: text('action').notNull(),
  target: text('target').notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
