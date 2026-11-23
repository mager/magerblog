import assert from 'node:assert/strict';
import test from 'node:test';
import { chicagoTimeOnDay, earthCaption, earthDescription } from '../src/lib/sky-date.ts';

const projected = (day, now) => chicagoTimeOnDay(day, new Date(now)).toISOString();

test('the archived day takes the full current Chicago clock with its own seasonal offset', () => {
  // 18:59 local on December 31, even though the UTC date is January 1.
  assert.equal(projected('2024-02-29', '2027-01-01T00:59:48.456Z'), '2024-03-01T00:59:48.456Z');
  assert.equal(projected('2024-07-09', '2027-01-01T00:59:48.456Z'), '2024-07-09T23:59:48.456Z');
  // Summer local midnight, applied to a winter day.
  assert.equal(projected('2008-12-29', '2026-07-04T05:00:00.000Z'), '2008-12-29T06:00:00.000Z');
});

test('spring-forward skips only the missing hour and preserves the clock minutes', () => {
  const day = '2026-03-08';
  assert.equal(projected(day, '2026-01-12T07:59:59.999Z'), '2026-03-08T07:59:59.999Z'); // 01:59 CST
  assert.equal(projected(day, '2026-01-12T08:30:45.678Z'), '2026-03-08T08:30:45.678Z'); // 02:30 → 03:30 CDT
  assert.equal(projected(day, '2026-01-12T09:00:00.000Z'), '2026-03-08T08:00:00.000Z'); // 03:00 CDT
});

test('the repeated fall hour uses the current offset and otherwise the earlier occurrence', () => {
  const day = '2026-11-01';
  assert.equal(projected(day, '2026-07-01T06:30:00.000Z'), '2026-11-01T06:30:00.000Z'); // 01:30 CDT
  assert.equal(projected(day, '2026-01-01T07:30:00.000Z'), '2026-11-01T07:30:00.000Z'); // 01:30 CST
  // Before standard time, Chicago's local mean time was GMT−05:50:36.
  assert.equal(projected(day, '1880-01-01T07:20:36.000Z'), '2026-11-01T06:30:00.000Z');
  assert.equal(projected(day, '2026-07-01T07:00:00.000Z'), '2026-11-01T08:00:00.000Z'); // 02:00 CST
});

test('the archive caption uses the local calendar date and the globe describes the time source', () => {
  const selected = new Date('2026-10-01T00:17:48.456Z');
  assert.equal(earthCaption(selected, 'day'), 'Sep 30, 2026 · 19:17 CDT');
  assert.equal(earthCaption(selected, 'day'), earthCaption(selected, 'published'));
  assert.match(earthDescription(selected, 'day'), /current Chicago time of day/);
  assert.match(earthDescription(selected, 'day'), /records only a date/);
});
