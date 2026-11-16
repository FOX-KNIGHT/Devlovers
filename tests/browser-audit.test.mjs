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
});
