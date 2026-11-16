import { pgTable, uuid, timestamp, primaryKey } from 'drizzle-orm/pg-core';
import { hackathons } from './hackathons.js';
import { users } from './users.js';

export const hackathonRegistrations = pgTable('hackathon_registrations', {
  id: uuid('id').defaultRandom().primaryKey(),
  hackathonId: uuid('hackathon_id').references(() => hackathons.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  registeredAt: timestamp('registered_at', { withTimezone: true }).defaultNow().notNull(),
});
