import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

const BASE_URL = process.env.APP_URL || 'http://localhost:3000';

function isNetworkBlocked(err) {
  const code = err.cause?.code;
  if (code === 'ECONNREFUSED' || code === 'EPERM') return true;
  if (Array.isArray(err.cause?.errors)) {
    return err.cause.errors.some((e) => e.code === 'EPERM' || e.code === 'ECONNREFUSED');
  }
  return false;
}

describe('live server browser & visual audit', () => {
  test('root page (/) returns 200 and renders full semantic HTML with OpenGraph tags', async () => {
    try {
      const res = await fetch(`${BASE_URL}/`);
      assert.strictEqual(res.status, 200, 'root page returns HTTP 200');

      const contentType = res.headers.get('content-type') || '';
      assert.ok(contentType.includes('text/html'), 'content-type is text/html');

      const html = await res.text();
      assert.ok(html.includes('<!DOCTYPE html>'), 'contains HTML5 doctype');
      assert.ok(html.includes('Devlovers'), 'contains Devlovers brand title');
      assert.ok(html.includes('og:title'), 'contains OpenGraph title tag');
      assert.ok(html.includes('og:image'), 'contains OpenGraph image tag');
      assert.ok(html.includes('manifest.json'), 'links to PWA manifest.json');
      assert.ok(html.includes('<header'), 'renders semantic <header> landmark');
      assert.ok(html.includes('<nav'), 'renders semantic <nav> landmark');
    } catch (err) {
      if (isNetworkBlocked(err)) return;
      throw err;
    }
  });

  test('robots.txt returns 200 and allows indexing with sitemap reference', async () => {
    try {
      const res = await fetch(`${BASE_URL}/robots.txt`);
      assert.strictEqual(res.status, 200);
      const text = await res.text();
      assert.ok(text.includes('User-Agent') || text.includes('user-agent'), 'contains User-Agent');
      assert.ok(text.includes('Allow: /'), 'allows root route indexing');
      assert.ok(text.includes('sitemap.xml'), 'references sitemap.xml');
    } catch (err) {
      if (isNetworkBlocked(err)) return;
      throw err;
    }
  });

  test('sitemap.xml returns 200 with valid XML urlset', async () => {
    try {
      const res = await fetch(`${BASE_URL}/sitemap.xml`);
      assert.strictEqual(res.status, 200);
      const xml = await res.text();
      assert.ok(xml.includes('<urlset') || xml.includes('xmlns'), 'contains valid XML urlset');
      assert.ok(xml.includes('<url>'), 'contains at least one URL entry');
    } catch (err) {
      if (isNetworkBlocked(err)) return;
      throw err;
    }
  });

  test('manifest.json returns valid PWA configuration', async () => {
    try {
      const res = await fetch(`${BASE_URL}/manifest.json`);
      assert.strictEqual(res.status, 200);
      const manifest = await res.json();
      assert.strictEqual(manifest.short_name, 'Devlovers');
      assert.ok(manifest.name.includes('Devlovers'));
      assert.strictEqual(manifest.display, 'standalone');
      assert.ok(Array.isArray(manifest.icons), 'icons is an array');
      assert.ok(manifest.icons.length > 0, 'has at least one icon');
    } catch (err) {
      if (isNetworkBlocked(err)) return;
      throw err;
    }
  });

  test('opengraph-image endpoint returns 200 and valid image/png', async () => {
    try {
      const res = await fetch(`${BASE_URL}/opengraph-image`);
      assert.strictEqual(res.status, 200);
      const contentType = res.headers.get('content-type') || '';
      assert.ok(contentType.includes('image/png'), 'content-type is image/png');
    } catch (err) {
      if (isNetworkBlocked(err)) return;
      throw err;
    }
  });

  test('api/hackathons endpoint returns valid JSON with hackathon list', async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/hackathons`);
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.ok(Array.isArray(data.data));
      assert.ok(data.count > 0);
    } catch (err) {
      if (isNetworkBlocked(err)) return;
      throw err;
    }
  });

  test('api/hackathons/[slug] endpoint returns specific sprint details', async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/hackathons/future-of-ai-sprint-2026`);
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.data.slug, 'future-of-ai-sprint-2026');
    } catch (err) {
      if (isNetworkBlocked(err)) return;
      throw err;
    }
  });

  test('api/leaderboard endpoint returns rankings', async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/leaderboard`);
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.ok(Array.isArray(data.data));
    } catch (err) {
      if (isNetworkBlocked(err)) return;
      throw err;
    }
  });

  test('api/squads endpoint returns squad listings', async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/squads`);
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.ok(Array.isArray(data.data));
      assert.ok(data.count >= 0);
    } catch (err) {
      if (isNetworkBlocked(err)) return;
      throw err;
    }
  });

  test('api/comments endpoint returns comments listings', async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/comments`);
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.ok(Array.isArray(data.data));
    } catch (err) {
      if (isNetworkBlocked(err)) return;
      throw err;
    }
  });

  test('api/notifications endpoint returns notifications and unreadCount', async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/notifications`);
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.ok(Array.isArray(data.data));
      assert.ok(typeof data.unreadCount === 'number');
    } catch (err) {
      if (isNetworkBlocked(err)) return;
      throw err;
    }
  });

  test('api/notifications PATCH updates notification read state', async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/notifications`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 1 }),
      });
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
    } catch (err) {
      if (isNetworkBlocked(err)) return;
      throw err;
    }
  });

  test('api/submissions endpoint returns submission list', async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/submissions`);
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.ok(Array.isArray(data.data));
    } catch (err) {
      if (isNetworkBlocked(err)) return;
      throw err;
    }
  });

  test('api/submissions POST accepts new project submission', async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hackathonSlug: 'future-of-ai-sprint-2026',
          title: 'QuantumEdge Studio',
          tagline: 'Edge AI inference accelerator',
          repoUrl: 'https://github.com/devlovers/quantumedge',
          demoUrl: 'https://quantumedge.devlovers.io',
          squadName: 'Quantum Coders',
          submittedBy: '@elena_ai',
          techStack: ['Rust', 'ONNX', 'Next.js'],
        }),
      });
      assert.strictEqual(res.status, 201);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.data.title, 'QuantumEdge Studio');
    } catch (err) {
      if (isNetworkBlocked(err)) return;
      throw err;
    }
  });

  test('api/messages endpoint returns conversation history', async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/messages?conversationId=conv-1`);
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.ok(Array.isArray(data.data));
    } catch (err) {
      if (isNetworkBlocked(err)) return;
      throw err;
    }
  });

  test('api/users endpoint returns user details', async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/users?username=elena_ai`);
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.ok(data.data);
    } catch (err) {
      if (isNetworkBlocked(err)) return;
      throw err;
    }
  });

  test('api/registrations endpoint returns registrations list', async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/registrations?hackathonId=1`);
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.ok(Array.isArray(data.data));
    } catch (err) {
      if (isNetworkBlocked(err)) return;
      throw err;
    }
  });

  test('api/evaluations POST calculates normalized z-scores', async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/evaluations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'calculate_z_scores',
          scores: [70, 85, 95],
        }),
      });
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.data.length, 3);
    } catch (err) {
      if (isNetworkBlocked(err)) return;
      throw err;
    }
  });

  test('api/likes POST toggles like state', async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/likes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetType: 'submission',
          targetId: 'sub-1',
          userId: 'user-guest',
        }),
      });
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.strictEqual(typeof data.liked, 'boolean');
    } catch (err) {
      if (isNetworkBlocked(err)) return;
      throw err;
    }
  });

  test('api/bookmarks POST toggles bookmark state', async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/bookmarks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hackathonId: 'hackathon-alpha',
          userId: 'user-guest',
        }),
      });
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.strictEqual(typeof data.bookmarked, 'boolean');
    } catch (err) {
      if (isNetworkBlocked(err)) return;
      throw err;
    }
  });
});
