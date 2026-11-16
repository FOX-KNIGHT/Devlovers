import { pgTable, uuid, text, boolean, jsonb, timestamp } from 'drizzle-orm/pg-core';
import { hackathons } from './hackathons.js';
import { squads } from './squads.js';
import { submissionStatusEnum } from './enums.js';

export const submissions = pgTable('submissions', {
  id: uuid('id').defaultRandom().primaryKey(),
  hackathonId: uuid('hackathon_id').references(() => hackathons.id, { onDelete: 'cascade' }).notNull(),
  squadId: uuid('squad_id').references(() => squads.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  repoUrl: text('repo_url').notNull(),
  demoUrl: text('demo_url'),
  verifiedCommits: boolean('verified_commits').default(false).notNull(),
  status: submissionStatusEnum('status').default('DRAFT').notNull(),
  techStack: jsonb('tech_stack').$type().default([]),
  submittedAt: timestamp('submitted_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
