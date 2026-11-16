import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { calculateTimeLeft } from '../src/hooks/useCountdown.js';

describe('useCountdown timer calculations', () => {
  test('returns Ended for past dates', () => {
    const target = '2020-01-01T00:00:00Z';
    const now = '2026-01-01T00:00:00Z';
    const result = calculateTimeLeft(target, now);
    assert.strictEqual(result.isExpired, true);
    assert.strictEqual(result.formatted, 'Ended');
  });

  test('calculates remaining days and hours accurately', () => {
    const now = new Date('2026-11-16T12:00:00Z');
    const target = new Date('2026-11-18T18:30:00Z'); // 2 days, 6 hours, 30 min
    const result = calculateTimeLeft(target, now);

    assert.strictEqual(result.isExpired, false);
    assert.strictEqual(result.days, 2);
    assert.strictEqual(result.hours, 6);
    assert.strictEqual(result.minutes, 30);
    assert.strictEqual(result.formatted, '2d 06h 30m');
  });

  test('calculates countdown under 24 hours with seconds', () => {
    const now = new Date('2026-11-16T12:00:00Z');
    const target = new Date('2026-11-16T15:20:45Z'); // 3 hours, 20 min, 45 sec
    const result = calculateTimeLeft(target, now);

    assert.strictEqual(result.isExpired, false);
    assert.strictEqual(result.days, 0);
    assert.strictEqual(result.hours, 3);
    assert.strictEqual(result.minutes, 20);
    assert.strictEqual(result.seconds, 45);
    assert.strictEqual(result.formatted, '03h 20m 45s');
  });

  test('handles null or missing target gracefully', () => {
    const result = calculateTimeLeft(null);
    assert.strictEqual(result.isExpired, true);
    assert.strictEqual(result.formatted, 'Ended');
  });
});
