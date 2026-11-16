import { pgTable, uuid, text, integer, timestamp } from 'drizzle-orm/pg-core';
import { hackathons } from './hackathons.js';
import { users } from './users.js';

export const sponsorCredits = pgTable('sponsor_credits', {
  id: uuid('id').defaultRandom().primaryKey(),
  hackathonId: uuid('hackathon_id').references(() => hackathons.id, { onDelete: 'cascade' }).notNull(),
  sponsorName: text('sponsor_name').notNull(),
  kind: text('kind').notNull(),
  code: text('code'),
  amountCents: integer('amount_cents').default(0).notNull(),
  claimedBy: uuid('claimed_by').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
