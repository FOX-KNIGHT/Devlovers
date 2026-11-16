import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { formatPrize, formatDeadline } from '../src/lib/formatters.js';

describe('formatPrize', () => {
  test('formats USD correctly with comma separation', () => {
    assert.strictEqual(formatPrize(25000, 'USD'), '$25,000');
    assert.strictEqual(formatPrize(1500000 / 100, 'USD'), '$15,000');
  });

  test('converts and formats EUR correctly', () => {
    const formatted = formatPrize(1000, 'EUR');
    assert.match(formatted, /^€920/);
  });

  test('converts and formats GBP correctly', () => {
    const formatted = formatPrize(1000, 'GBP');
    assert.match(formatted, /^£790/);
  });

  test('converts and formats INR as integer rounded', () => {
    const formatted = formatPrize(1000, 'INR');
    assert.strictEqual(formatted, '₹86,500');
  });

  test('converts and formats JPY as integer rounded', () => {
    const formatted = formatPrize(1000, 'JPY');
    assert.strictEqual(formatted, '¥154,000');
  });

  test('falls back to USD for unsupported currency code', () => {
    assert.strictEqual(formatPrize(5000, 'XYZ'), '$5,000');
  });
});

describe('formatDeadline', () => {
  test('returns empty string for falsy input', () => {
    assert.strictEqual(formatDeadline(''), '');
    assert.strictEqual(formatDeadline(null), '');
  });

  test('returns formatted UTC string when isUTC is true', () => {
    const dateStr = '2026-12-07T18:00:00Z';
    const result = formatDeadline(dateStr, true);
    assert.match(result, /UTC$/);
    assert.ok(result.includes('Dec 2026') || result.includes('Dec'));
  });

  test('returns formatted local string when isUTC is false', () => {
    const dateStr = '2026-12-07T18:00:00Z';
    const result = formatDeadline(dateStr, false);
    assert.ok(result.includes('2026'));
  });

  test('falls back to original input if date is unparseable', () => {
    assert.strictEqual(formatDeadline('not-a-valid-date'), 'not-a-valid-date');
  });
});
