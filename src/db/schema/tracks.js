import { pgTable, uuid, text, integer, timestamp } from 'drizzle-orm/pg-core';
import { hackathons } from './hackathons.js';

export const tracks = pgTable('tracks', {
  id: uuid('id').defaultRandom().primaryKey(),
  hackathonId: uuid('hackathon_id').references(() => hackathons.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  description: text('description'),
  prizePoolCents: integer('prize_pool_cents').default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
