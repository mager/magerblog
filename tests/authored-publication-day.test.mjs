import assert from 'node:assert/strict';
import test from 'node:test';
import { authoredPublicationDay } from '../src/lib/authored-publication-day.mjs';

const source = value => `---\ntitle: Test post\npubDate: ${value}\n---\n\npubDate: 2020-01-01\n`;

test('the written day survives quoted, unquoted, and legacy calendar dates', () => {
  for (const value of ['2024-06-01', '"2024-06-01"', "'2024-06-01' # Date of the photo", 'Jun 01 2024']) {
    assert.equal(authoredPublicationDay(source(value)), '2024-06-01');
  }
});

test('explicit times are preserved even when the normalized instant is midnight UTC', () => {
  for (const value of ['2026-10-01T00:00:00Z', '"2026-09-30T19:00:00-05:00"', '2026-10-01 00:00:00.000Z', 'Mon, 04 Jan 2021 16:35:46 GMT']) {
    assert.equal(authoredPublicationDay(source(value)), undefined);
  }
});
