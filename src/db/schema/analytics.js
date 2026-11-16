import { pgTable, uuid, text, jsonb, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users.js';

export const events = pgTable('events', {
  id: uuid('id').defaultRandom().primaryKey(),
  type: text('type').notNull(),
  subjectId: text('subject_id').notNull(),
  userId: uuid('user_id').references(() => users.id),
  country: text('country'),
  metadata: jsonb('metadata').$type().default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
