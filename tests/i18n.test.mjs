import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const readJson = (file) => JSON.parse(readFileSync(join(process.cwd(), file), 'utf8'));

describe('i18n dictionaries parity', () => {
  const en = readJson('src/lib/i18n/dictionaries/en.json');
  const es = readJson('src/lib/i18n/dictionaries/es.json');
  const ja = readJson('src/lib/i18n/dictionaries/ja.json');

  const getKeys = (obj, prefix = '') => {
    let keys = [];
    for (const [k, v] of Object.entries(obj)) {
      const full = prefix ? `${prefix}.${k}` : k;
      if (typeof v === 'object' && v !== null) {
        keys = keys.concat(getKeys(v, full));
      } else {
        keys.push(full);
      }
    }
    return keys;
  };

  const enKeys = getKeys(en);

  test('English dictionary has required top-level sections', () => {
    assert.ok(en.nav, 'nav section exists');
    assert.ok(en.hero, 'hero section exists');
    assert.ok(en.filters, 'filters section exists');
    assert.ok(en.post, 'post section exists');
  });

  test('Spanish dictionary has 100% parity with English keys', () => {
    const esKeys = new Set(getKeys(es));
    for (const key of enKeys) {
      assert.ok(esKeys.has(key), `Missing key in es.json: ${key}`);
    }
  });

  test('Japanese dictionary has 100% parity with English keys', () => {
    const jaKeys = new Set(getKeys(ja));
    for (const key of enKeys) {
      assert.ok(jaKeys.has(key), `Missing key in ja.json: ${key}`);
    }
  });
});
