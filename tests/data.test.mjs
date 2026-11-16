import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import data from '../src/Project/LandingPage/data.js';

describe('mock data schema contract', () => {
  test('hackathons array matches required structure', () => {
    assert.ok(Array.isArray(data.hackathons), 'hackathons is an array');
    assert.ok(data.hackathons.length > 0, 'has at least one hackathon');

    for (const h of data.hackathons) {
      assert.strictEqual(typeof h.id, 'number');
      assert.strictEqual(typeof h.slug, 'string');
      assert.strictEqual(typeof h.name, 'string');
      assert.strictEqual(typeof h.status, 'string');
      assert.strictEqual(typeof h.category, 'string');
    }
  });

  test('feedPosts array conforms to Drizzle integer cents and jsonb specs', () => {
    assert.ok(Array.isArray(data.feedPosts), 'feedPosts is an array');
    assert.ok(data.feedPosts.length > 0, 'has at least one feed post');

    for (const post of data.feedPosts) {
      assert.strictEqual(typeof post.id, 'number');
      assert.strictEqual(typeof post.hackathonId, 'number');
      assert.strictEqual(typeof post.hackathonSlug, 'string');
      assert.strictEqual(typeof post.slug, 'string');
      assert.strictEqual(typeof post.title, 'string');
      assert.strictEqual(typeof post.status, 'string');
      assert.strictEqual(typeof post.hostedBy, 'string');

      // Integer cents contract (e.g. $25k = 2,500,000 cents)
      assert.strictEqual(typeof post.prize_cents, 'number');
      assert.ok(Number.isInteger(post.prize_cents), 'prize_cents is an integer');
      assert.ok(post.prize_cents > 0, 'prize_cents is greater than 0');

      assert.strictEqual(typeof post.verified_commits, 'boolean');
      assert.ok(Array.isArray(post.tags), 'tags is an array');
      assert.ok(Array.isArray(post.tech_stack), 'tech_stack is an array');
      assert.strictEqual(typeof post.criteria_scores, 'object');

      // Criteria scores sum to 100%
      const totalScore = Object.values(post.criteria_scores).reduce((a, b) => a + b, 0);
      assert.strictEqual(totalScore, 100, `Criteria scores for ${post.title} must sum to 100%`);
    }
  });

  test('notifications array contains unread tracking booleans', () => {
    assert.ok(Array.isArray(data.notifications));
    for (const n of data.notifications) {
      assert.strictEqual(typeof n.id, 'number');
      assert.strictEqual(typeof n.message, 'string');
      assert.strictEqual(typeof n.unread, 'boolean');
    }
  });

  test('trending array has valid sprint items', () => {
    assert.ok(Array.isArray(data.trending));
    for (const item of data.trending) {
      assert.strictEqual(typeof item.id, 'number');
      assert.strictEqual(typeof item.title, 'string');
      assert.strictEqual(typeof item.details, 'string');
    }
  });

  test('squads array conforms to matchmaking relational specifications', () => {
    assert.ok(Array.isArray(data.squads), 'squads is an array');
    assert.ok(data.squads.length > 0, 'has at least one squad');

    const validHackathonIds = new Set(data.hackathons.map((h) => h.id));

    for (const squad of data.squads) {
      assert.strictEqual(typeof squad.id, 'string');
      assert.strictEqual(typeof squad.hackathonId, 'number');
      assert.ok(validHackathonIds.has(squad.hackathonId), `squad ${squad.id} references valid hackathon`);
      assert.strictEqual(typeof squad.name, 'string');
      assert.strictEqual(typeof squad.leader, 'string');
      assert.ok(Array.isArray(squad.rolesNeeded), 'rolesNeeded is an array');
      assert.ok(squad.rolesNeeded.length > 0, 'rolesNeeded has at least one role');
      assert.strictEqual(typeof squad.membersCount, 'number');
      assert.strictEqual(typeof squad.maxMembers, 'number');
      assert.ok(squad.membersCount <= squad.maxMembers, 'membersCount does not exceed maxMembers');
      assert.match(squad.compatibility, /^\d{1,3}%$/, 'compatibility is a percentage string');
    }
  });

  test('leaderboard array conforms to rankings and prize specifications', () => {
    assert.ok(Array.isArray(data.leaderboard), 'leaderboard is an array');
    assert.ok(data.leaderboard.length >= 3, 'has at least top 3 podium entries');

    let prevRank = 0;
    for (const item of data.leaderboard) {
      assert.strictEqual(typeof item.rank, 'number');
      assert.ok(item.rank > prevRank, 'ranks are strictly monotonically increasing');
      prevRank = item.rank;

      assert.strictEqual(typeof item.team, 'string');
      assert.strictEqual(typeof item.captain, 'string');
      assert.match(item.handle, /^@/, 'handle starts with @');
      assert.strictEqual(typeof item.bounties_won_cents, 'number');
      assert.ok(Number.isInteger(item.bounties_won_cents), 'bounties_won_cents is integer cents');
      assert.ok(item.bounties_won_cents > 0, 'bounties_won_cents is positive');
      assert.strictEqual(typeof item.points, 'number');
      assert.strictEqual(typeof item.wins, 'number');
      assert.strictEqual(typeof item.specialty, 'string');
      assert.strictEqual(typeof item.badge, 'string');
    }
  });
});
