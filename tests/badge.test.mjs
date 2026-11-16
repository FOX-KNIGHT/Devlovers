import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { updateAppBadge, clearAppBadge } from '../src/lib/pwa/badge.js';

describe('PWA Badging API', () => {
  let badgeValue = null;

  beforeEach(() => {
    badgeValue = null;
    globalThis.navigator = {
      setAppBadge: async (val) => {
        badgeValue = val;
      },
      clearAppBadge: async () => {
        badgeValue = 0;
      },
    };
  });

  test('sets badge count when count > 0', async () => {
    await updateAppBadge(5);
    assert.strictEqual(badgeValue, 5);
  });

  test('clears badge when count is 0', async () => {
    badgeValue = 3;
    await updateAppBadge(0);
    assert.strictEqual(badgeValue, 0);
  });

  test('clears badge directly via clearAppBadge', async () => {
    badgeValue = 10;
    await clearAppBadge();
    assert.strictEqual(badgeValue, 0);
  });

  test('does not throw when navigator does not support setAppBadge', async () => {
    globalThis.navigator = {};
    await assert.doesNotReject(async () => {
      await updateAppBadge(3);
      await clearAppBadge();
    });
  });
});
