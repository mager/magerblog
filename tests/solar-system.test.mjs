import assert from 'node:assert/strict';
import test from 'node:test';
import { skyBodiesAt, solarSystemAt } from '../src/lib/solar-system.ts';

test('the March 2000 equinox places Earth opposite the Sun on the two maps', () => {
  const date = new Date('2000-03-20T07:35:00Z');
  const earth = solarSystemAt(date).planets.find(planet => planet.name === 'Earth');
  const sun = skyBodiesAt(date).find(planet => planet.name === 'Sun');
  assert(Math.abs(earth.longitude - 180) < 0.1);
  assert(Math.min(sun.longitude, 360 - sun.longitude) < 0.1);
  assert(Math.abs(sun.latitude) < 0.01);
  assert(sun.distance > 0.98 && sun.distance < 1.02);
});

test('rewinding the publication date moves all planets and the Sun in the frame', () => {
  const newest = solarSystemAt(new Date('2026-11-21'));
  const earlier = solarSystemAt(new Date('2017-08-21'));
  assert.equal(newest.planets.length, 8);
  assert.notDeepEqual(newest.sun, earlier.sun);
  for (const [index, planet] of newest.planets.entries()) {
    assert.equal(planet.name, earlier.planets[index].name);
    assert.notEqual(planet.longitude, earlier.planets[index].longitude);
  }
  assert.deepEqual(newest, solarSystemAt(new Date('2026-11-21')));
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
