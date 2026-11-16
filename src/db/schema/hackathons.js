import { pgTable, uuid, varchar, text, integer, boolean, jsonb, timestamp } from 'drizzle-orm/pg-core';
import { hackathonStatusEnum } from './enums.js';

export const hackathons = pgTable('hackathons', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: varchar('slug', { length: 120 }).notNull().unique(),
  title: text('title').notNull(),
  tagline: text('tagline'),
  description: text('description').notNull(),
  bannerUrl: text('banner_url'),
  hostedBy: text('hosted_by').notNull(),
  prizePoolCents: integer('prize_pool_cents').notNull().default(0),
  currency: varchar('currency', { length: 10 }).default('USD').notNull(),
  status: hackathonStatusEnum('status').default('UPCOMING').notNull(),
  category: varchar('category', { length: 50 }).notNull().default('general'),
  startsAt: timestamp('starts_at', { withTimezone: true }).notNull(),
  endsAt: timestamp('ends_at', { withTimezone: true }).notNull(),
  timezone: varchar('timezone', { length: 50 }).default('UTC').notNull(),
  verifiedCommits: boolean('verified_commits').default(true).notNull(),
  participantsCount: integer('participants_count').default(0).notNull(),
  tags: jsonb('tags').$type().default([]),
  techStack: jsonb('tech_stack').$type().default([]),
  criteriaWeights: jsonb('criteria_weights').$type().default({}),
  prizeDistribution: jsonb('prize_distribution').$type().default({
    first_place_pct: 60,
    second_place_pct: 25,
    third_place_pct: 10,
    sponsor_pct: 5,
  }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
