import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  saveOfflineDraft,
  getOfflineDraft,
  getOfflineDrafts,
  removeOfflineDraft,
} from '../src/lib/storage/offline-drafts.js';

describe('offline-drafts storage engine', () => {
  let mockStore = {};

  beforeEach(() => {
    mockStore = {};
    globalThis.window = {};
    globalThis.localStorage = {
      getItem: (key) => mockStore[key] ?? null,
      setItem: (key, val) => {
        mockStore[key] = String(val);
      },
      removeItem: (key) => {
        delete mockStore[key];
      },
      clear: () => {
        mockStore = {};
      },
    };
  });

  test('saves a draft and retrieves it', () => {
    const draft = { title: 'AI Copilot Squad', pitch: 'Autonomous Agents' };
    const success = saveOfflineDraft('hackathon-alpha', draft);
    assert.strictEqual(success, true);

    const retrieved = getOfflineDraft('hackathon-alpha');
    assert.ok(retrieved);
    assert.strictEqual(retrieved.title, 'AI Copilot Squad');
    assert.strictEqual(retrieved.pitch, 'Autonomous Agents');
    assert.ok(retrieved.updatedAt);
  });

  test('retrieves all drafts as a map', () => {
    saveOfflineDraft('sprint-1', { name: 'Sprint 1 Project' });
    saveOfflineDraft('sprint-2', { name: 'Sprint 2 Project' });

    const all = getOfflineDrafts();
    assert.strictEqual(Object.keys(all).length, 2);
    assert.strictEqual(all['sprint-1'].name, 'Sprint 1 Project');
    assert.strictEqual(all['sprint-2'].name, 'Sprint 2 Project');
  });

  test('removes an individual draft cleanly', () => {
    saveOfflineDraft('sprint-1', { name: 'To be removed' });
    assert.ok(getOfflineDraft('sprint-1'));

    removeOfflineDraft('sprint-1');
    assert.strictEqual(getOfflineDraft('sprint-1'), null);
  });

  test('gracefully handles corrupted JSON in localStorage', () => {
    mockStore['devlovers_submission_drafts'] = 'corrupted-invalid-json{{{';
    const all = getOfflineDrafts();
    assert.deepStrictEqual(all, {});
    assert.strictEqual(getOfflineDraft('sprint-1'), null);
  });

  test('background sync updates pending draft state', async () => {
    saveOfflineDraft('sprint-sync-1', { name: 'Auto Sync Sprint' });
    const draft = getOfflineDraft('sprint-sync-1');
    assert.strictEqual(draft.syncPending, true);
  });
});
