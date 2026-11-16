import { pgTable, uuid, text, integer, jsonb, timestamp } from 'drizzle-orm/pg-core';
import { submissions } from './submissions.js';
import { users } from './users.js';

export const evaluations = pgTable('evaluations', {
  id: uuid('id').defaultRandom().primaryKey(),
  submissionId: uuid('submission_id').references(() => submissions.id, { onDelete: 'cascade' }).notNull(),
  judgeId: uuid('judge_id').references(() => users.id).notNull(),
  criteriaScores: jsonb('criteria_scores').$type().notNull(),
  rawScore: integer('raw_score').notNull(),
  normalizedZScore: text('normalized_z_score'),
  feedback: text('feedback'),
  evaluatedAt: timestamp('evaluated_at', { withTimezone: true }).defaultNow().notNull(),
});
