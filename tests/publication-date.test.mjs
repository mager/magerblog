import test from 'node:test';
import assert from 'node:assert/strict';
import { comparePublicationDates, publicationTimeZone } from '../src/lib/publication-date.ts';

test('October 1 note precedes September 30 Chicago evening screenshot', () => {
  const note = new Date('2026-10-01');
  const screenshot = new Date('2026-09-30T19:17:00-05:00');
  assert.ok(screenshot > note, 'raw timestamps reproduce the original wrong order');
  assert.deepEqual([screenshot, note].sort(comparePublicationDates), [note, screenshot]);
});

test('same-day timestamps stay newest first and follow the date-only entry in time', () => {
  const morning = new Date('2026-10-01T09:00:00-05:00');
  const evening = new Date('2026-10-01T20:00:00-05:00');
  const dateOnly = new Date('2026-10-01');
  assert.deepEqual([dateOnly, morning, evening].sort(comparePublicationDates), [evening, morning, dateOnly]);
});

test('calendar order handles year boundaries and winter Chicago offsets', () => {
  const newYear = new Date('2027-01-01');
  const newYearsEve = new Date('2026-12-31T23:30:00-06:00');
  assert.deepEqual([newYearsEve, newYear].sort(comparePublicationDates), [newYear, newYearsEve]);
  assert.equal(comparePublicationDates(newYear, new Date('2027-01-01')), 0);
});

test('sorting uses the same timezone convention as displayed dates', () => {
  assert.equal(publicationTimeZone(new Date('2026-10-01')), 'UTC');
  assert.equal(publicationTimeZone(new Date('2026-09-30T19:17:00-05:00')), 'America/Chicago');
});
