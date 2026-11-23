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

test('pre-2000 dates keep the correct subsolar longitude and seasonal latitude', () => {
  const june = subsolarPoint(new Date('1980-06-21T12:00:00Z'));
  const december = subsolarPoint(new Date('1980-12-21T18:00:00Z'));
  assert(Math.abs(june.longitude) < 1 && Math.abs(june.latitude - 23.44) < .1);
  assert(Math.abs(december.longitude + 90) < 1 && Math.abs(december.latitude + 23.44) < .1);
});

test('sunlight crosses a fixed American hemisphere from east to west', () => {
  const map = { width: 1, height: 1, pixels: new Uint8Array([160, 160, 160, 255]) };
  const size = 65;
  const morning = drawEarth(new Date('2000-03-20T12:00:00Z'), size, map);
  const evening = drawEarth(new Date('2000-03-21T00:00:00Z'), size, map);
  const west = (32 * size + 16) * 4, east = (32 * size + 48) * 4;
  assert(morning[east] > morning[west] * 4);
  assert(evening[west] > evening[east] * 4);
});

test('observed lights appear after dark and disappear in full sun', () => {
  const map = { width: 1, height: 1, pixels: new Uint8Array([120, 120, 120, 255]) };
  const withLights = { ...map, lights: new Uint8Array([180]) };
  const center = (32 * 65 + 32) * 4;
  const noon = new Date('2026-06-21T18:00:00Z'), midnight = new Date('2026-06-22T06:00:00Z');
  const noonPixel = drawEarth(noon, 65, map)[center];
  const midnightPixel = drawEarth(midnight, 65, map)[center];
  assert(noonPixel > midnightPixel * 9);
  assert.equal(drawEarth(noon, 65, withLights)[center], noonPixel);
  assert.equal(drawEarth(midnight, 65, withLights)[center], midnightPixel + 180);
});
