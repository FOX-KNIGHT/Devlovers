import { pgEnum } from 'drizzle-orm/pg-core';

export const hackathonStatusEnum = pgEnum('hackathon_status', [
  'DRAFT',
  'UPCOMING',
  'ACTIVE',
  'JUDGING',
  'FINISHED',
]);

export const userRoleEnum = pgEnum('user_role', [
  'USER',
  'JUDGE',
  'HOST',
  'ADMIN',
]);

export const squadMemberRoleEnum = pgEnum('squad_member_role', [
  'LEAD',
  'MEMBER',
  'MENTOR',
]);

export const submissionStatusEnum = pgEnum('submission_status', [
  'DRAFT',
  'SUBMITTED',
  'UNDER_REVIEW',
  'ACCEPTED',
  'REJECTED',
]);
