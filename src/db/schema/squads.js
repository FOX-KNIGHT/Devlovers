import { pgTable, uuid, varchar, text, integer, jsonb, timestamp } from 'drizzle-orm/pg-core';
import { hackathons } from './hackathons.js';
import { users } from './users.js';
import { squadMemberRoleEnum } from './enums.js';

export const squads = pgTable('squads', {
  id: uuid('id').defaultRandom().primaryKey(),
  hackathonId: uuid('hackathon_id').references(() => hackathons.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  tagline: text('tagline'),
  lookingFor: jsonb('looking_for').$type().default([]),
  maxMembers: integer('max_members').default(4).notNull(),
  compatibilityScore: integer('compatibility_score').default(90).notNull(),
  createdBy: uuid('created_by').references(() => users.id).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const squadMembers = pgTable('squad_members', {
  id: uuid('id').defaultRandom().primaryKey(),
  squadId: uuid('squad_id').references(() => squads.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  role: squadMemberRoleEnum('role').default('MEMBER').notNull(),
  joinedAt: timestamp('joined_at', { withTimezone: true }).defaultNow().notNull(),
});
