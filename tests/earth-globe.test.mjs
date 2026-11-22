import test from 'node:test';
import assert from 'node:assert/strict';
import { drawEarth, subsolarPoint } from '../src/lib/earth-globe.ts';

test('UTC controls the daylight meridian and the season controls solar latitude', () => {
  const noon = subsolarPoint(new Date('2026-06-21T12:00:00Z'));
  const evening = subsolarPoint(new Date('2026-06-21T18:00:00Z'));
  const winter = subsolarPoint(new Date('2026-12-21T12:00:00Z'));
  assert(Math.abs(noon.longitude) < 1);
  assert(Math.abs((noon.longitude - evening.longitude) - 90) < .1);
  assert(Math.abs(noon.latitude - 23.44) < .1 && Math.abs(winter.latitude + 23.44) < .1);
});

test('build and client can draw the same hemisphere including a transparent sky', () => {
  const map = { width: 2, height: 1, pixels: new Uint8Array([0, 60, 140, 255, 130, 195, 130, 255]) };
  const noon = new Date('2026-06-21T12:00:00Z');
  const first = drawEarth(noon, 48, map);
  assert.equal(first[3], 0);
  assert.equal(first[(24 * 48 + 24) * 4 + 3], 255);
  assert.deepEqual(first, drawEarth(noon, 48, map));
  assert.notDeepEqual(first, drawEarth(new Date('2026-06-22T00:00:00Z'), 48, map));
});
