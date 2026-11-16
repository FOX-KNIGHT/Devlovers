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
});
