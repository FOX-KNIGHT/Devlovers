import { relations } from 'drizzle-orm';
import { hackathons } from './hackathons.js';
import { users } from './users.js';
import { squads, squadMembers } from './squads.js';
import { submissions } from './submissions.js';
import { evaluations } from './evaluations.js';
import { likes, comments, bookmarks } from './social.js';
import { sponsorCredits } from './sponsors.js';
import { conversations, conversationMembers, messages } from './messages.js';
import { auditLogs } from './audit.js';
import { notifications } from './notifications.js';
import { tracks } from './tracks.js';
import { hackathonRegistrations } from './registrations.js';

export const hackathonsRelations = relations(hackathons, ({ many }) => ({
  squads: many(squads),
  submissions: many(submissions),
  likes: many(likes),
  comments: many(comments),
  bookmarks: many(bookmarks),
  sponsorCredits: many(sponsorCredits),
  tracks: many(tracks),
  registrations: many(hackathonRegistrations),
}));

export const usersRelations = relations(users, ({ many }) => ({
  createdSquads: many(squads),
  squadMemberships: many(squadMembers),
  evaluations: many(evaluations),
  likes: many(likes),
  comments: many(comments),
  bookmarks: many(bookmarks),
  sentMessages: many(messages),
  conversationMemberships: many(conversationMembers),
  auditLogs: many(auditLogs),
  notifications: many(notifications),
  registrations: many(hackathonRegistrations),
}));

export const squadsRelations = relations(squads, ({ one, many }) => ({
  hackathon: one(hackathons, {
    fields: [squads.hackathonId],
    references: [hackathons.id],
  }),
  creator: one(users, {
    fields: [squads.createdBy],
    references: [users.id],
  }),
  members: many(squadMembers),
  submissions: many(submissions),
}));

export const squadMembersRelations = relations(squadMembers, ({ one }) => ({
  squad: one(squads, {
    fields: [squadMembers.squadId],
    references: [squads.id],
  }),
  user: one(users, {
    fields: [squadMembers.userId],
    references: [users.id],
  }),
}));

export const submissionsRelations = relations(submissions, ({ one, many }) => ({
  hackathon: one(hackathons, {
    fields: [submissions.hackathonId],
    references: [hackathons.id],
  }),
  squad: one(squads, {
    fields: [submissions.squadId],
    references: [squads.id],
  }),
  evaluations: many(evaluations),
}));

export const evaluationsRelations = relations(evaluations, ({ one }) => ({
  submission: one(submissions, {
    fields: [evaluations.submissionId],
    references: [submissions.id],
  }),
  judge: one(users, {
    fields: [evaluations.judgeId],
    references: [users.id],
  }),
}));

export const likesRelations = relations(likes, ({ one }) => ({
  hackathon: one(hackathons, {
    fields: [likes.hackathonId],
    references: [hackathons.id],
  }),
  user: one(users, {
    fields: [likes.userId],
    references: [users.id],
  }),
}));

export const commentsRelations = relations(comments, ({ one, many }) => ({
  hackathon: one(hackathons, {
    fields: [comments.hackathonId],
    references: [hackathons.id],
  }),
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
  parent: one(comments, {
    fields: [comments.parentId],
    references: [comments.id],
    relationName: 'replies',
  }),
  replies: many(comments, {
    relationName: 'replies',
  }),
}));

export const bookmarksRelations = relations(bookmarks, ({ one }) => ({
  hackathon: one(hackathons, {
    fields: [bookmarks.hackathonId],
    references: [hackathons.id],
  }),
  user: one(users, {
    fields: [bookmarks.userId],
    references: [users.id],
  }),
}));

export const sponsorCreditsRelations = relations(sponsorCredits, ({ one }) => ({
  hackathon: one(hackathons, {
    fields: [sponsorCredits.hackathonId],
    references: [hackathons.id],
  }),
  claimedByUser: one(users, {
    fields: [sponsorCredits.claimedBy],
    references: [users.id],
  }),
}));

export const conversationsRelations = relations(conversations, ({ many }) => ({
  members: many(conversationMembers),
  messages: many(messages),
}));

export const conversationMembersRelations = relations(conversationMembers, ({ one }) => ({
  conversation: one(conversations, {
    fields: [conversationMembers.conversationId],
    references: [conversations.id],
  }),
  user: one(users, {
    fields: [conversationMembers.userId],
    references: [users.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  actor: one(users, {
    fields: [auditLogs.actorId],
    references: [users.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const tracksRelations = relations(tracks, ({ one }) => ({
  hackathon: one(hackathons, {
    fields: [tracks.hackathonId],
    references: [hackathons.id],
  }),
}));

export const hackathonRegistrationsRelations = relations(hackathonRegistrations, ({ one }) => ({
  hackathon: one(hackathons, {
    fields: [hackathonRegistrations.hackathonId],
    references: [hackathons.id],
  }),
  user: one(users, {
    fields: [hackathonRegistrations.userId],
    references: [users.id],
  }),
}));
