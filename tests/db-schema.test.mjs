import test from 'node:test';
import assert from 'node:assert/strict';
import * as schema from '../src/db/schema/index.js';

test('Drizzle ORM schema tables and enums', async (t) => {
  await t.test('exports all expected tables', () => {
    assert.ok(schema.hackathons, 'hackathons table should be defined');
    assert.ok(schema.users, 'users table should be defined');
    assert.ok(schema.squads, 'squads table should be defined');
    assert.ok(schema.squadMembers, 'squadMembers table should be defined');
    assert.ok(schema.submissions, 'submissions table should be defined');
    assert.ok(schema.evaluations, 'evaluations table should be defined');
    assert.ok(schema.likes, 'likes table should be defined');
    assert.ok(schema.comments, 'comments table should be defined');
    assert.ok(schema.bookmarks, 'bookmarks table should be defined');
    assert.ok(schema.sponsorCredits, 'sponsorCredits table should be defined');
    assert.ok(schema.events, 'events table should be defined');
  });

  await t.test('exports all enum types', () => {
    assert.ok(schema.hackathonStatusEnum, 'hackathonStatusEnum should be defined');
    assert.ok(schema.userRoleEnum, 'userRoleEnum should be defined');
    assert.ok(schema.squadMemberRoleEnum, 'squadMemberRoleEnum should be defined');
    assert.ok(schema.submissionStatusEnum, 'submissionStatusEnum should be defined');

    assert.deepEqual(schema.hackathonStatusEnum.enumValues, [
      'DRAFT',
      'UPCOMING',
      'ACTIVE',
      'JUDGING',
      'FINISHED',
    ]);
  });

  await t.test('hackathons table contains required columns', () => {
    const cols = schema.hackathons;
    assert.ok(cols.id, 'id column should exist');
    assert.ok(cols.slug, 'slug column should exist');
    assert.ok(cols.title, 'title column should exist');
    assert.ok(cols.prizePoolCents, 'prizePoolCents column should exist');
    assert.ok(cols.currency, 'currency column should exist');
    assert.ok(cols.status, 'status column should exist');
    assert.ok(cols.startsAt, 'startsAt column should exist');
    assert.ok(cols.endsAt, 'endsAt column should exist');
    assert.ok(cols.criteriaWeights, 'criteriaWeights column should exist');
    assert.ok(cols.verifiedCommits, 'verifiedCommits column should exist');
  });

  await t.test('users table contains required columns', () => {
    const cols = schema.users;
    assert.ok(cols.id, 'id column should exist');
    assert.ok(cols.username, 'username column should exist');
    assert.ok(cols.email, 'email column should exist');
    assert.ok(cols.role, 'role column should exist');
    assert.ok(cols.skills, 'skills column should exist');
  });

  await t.test('evaluations table contains score normalization columns', () => {
    const cols = schema.evaluations;
    assert.ok(cols.rawScore, 'rawScore column should exist');
    assert.ok(cols.normalizedZScore, 'normalizedZScore column should exist');
    assert.ok(cols.criteriaScores, 'criteriaScores column should exist');
  });
});
