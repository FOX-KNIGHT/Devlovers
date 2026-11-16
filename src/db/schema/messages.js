import { pgTable, uuid, text, timestamp, primaryKey } from 'drizzle-orm/pg-core';
import { users } from './users.js';

export const conversations = pgTable('conversations', {
  id: uuid('id').primaryKey().defaultRandom(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const conversationMembers = pgTable('conversation_members', {
  conversationId: uuid('conversation_id')
    .references(() => conversations.id, { onDelete: 'cascade' })
    .notNull(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  joinedAt: timestamp('joined_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.conversationId, t.userId] }),
}));

export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  conversationId: uuid('conversation_id')
    .references(() => conversations.id, { onDelete: 'cascade' })
    .notNull(),
  senderId: uuid('sender_id')
    .references(() => users.id)
    .notNull(),
  body: text('body').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
