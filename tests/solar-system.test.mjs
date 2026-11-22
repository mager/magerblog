import assert from 'node:assert/strict';
import test from 'node:test';
import { skyBodiesAt } from '../src/lib/solar-system.ts';

test('the Sun crosses the ecliptic origin at the March 2000 equinox', () => {
  const date = new Date('2000-03-20T07:35:00Z');
  const sun = skyBodiesAt(date).find(planet => planet.name === 'Sun');
  assert(Math.min(sun.longitude, 360 - sun.longitude) < 0.1);
  assert(Math.abs(sun.latitude) < 0.01);
  assert(sun.distance > 0.98 && sun.distance < 1.02);
});

test('rewinding the publication date moves the planets and the Sun against the stars', () => {
  const newest = skyBodiesAt(new Date('2026-11-21'));
  const earlier = skyBodiesAt(new Date('2017-08-21'));
  for (const [index, body] of newest.entries()) {
    assert.equal(body.name, earlier[index].name);
    assert.notEqual(body.longitude, earlier[index].longitude);
  }
  assert.deepEqual(newest, skyBodiesAt(new Date('2026-11-21')));
});

test('the sky has eight Earth-relative bodies including the Sun and excludes the observer', () => {
  const bodies = skyBodiesAt(new Date('2017-08-21T18:25:00Z'));
  assert.deepEqual(bodies.map(body => body.name), ['Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune']);
  for (const body of bodies) {
    assert(body.longitude >= 0 && body.longitude < 360);
    assert(body.latitude >= -90 && body.latitude <= 90);
    assert(body.distance > 0);
  }
  const sunAngle = bodies[0].longitude;
  for (const [index, limit] of [[1, 29], [2, 49]]) {
    const delta = Math.abs(bodies[index].longitude - sunAngle);
    assert(Math.min(delta, 360 - delta) < limit);
  }
});
