import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import test from 'node:test';
import { JSDOM } from 'jsdom';

function source(path) {
  const text = readFileSync(new URL(`../src/${path}.ts`, import.meta.url), 'utf8');
  return stripTypeScriptTypes(text).replace(/^import .*;\n/gm, '').replaceAll('export ', '');
}

function setup(height, postTops = [600, 760]) {
  const dates = ['2026-11-21T00:00:00.000Z', '2026-10-01T00:17:00.000Z'];
  const dom = new JSDOM(`
    <header class="site-header"></header><time data-earth-clock datetime="2008-01-01"></time>
    <main data-timeline><ol id="simple-list">
    ${dates.map(iso => `<li data-simple-row data-iso="${iso}"></li>`).join('')}
    </ol></main>`, { pretendToBeVisual: true, runScripts: 'outside-only' });
  const w = dom.window;
  const doc = w.document;
  const rows = [...doc.querySelectorAll('li')];
  let now = Date.parse('2026-11-23T00:59:48.456Z');
  let hidden = false;
  let frame;
  let timer;
  w.Date.now = () => now;
  w.innerHeight = height;
  Object.defineProperty(doc.documentElement, 'scrollHeight', { value: 2400 });
  Object.defineProperty(doc, 'hidden', { get: () => hidden });
  rows.forEach((row, i) => { row.getBoundingClientRect = () => ({ top: postTops[i] - w.scrollY }); });
  w.requestAnimationFrame = callback => { frame = callback; return 1; };
  w.setTimeout = (callback, delay) => { timer = { callback, delay }; return 2; };
  w.clearTimeout = () => { timer = undefined; };
  w.ResizeObserver = class { observe() {} };
  w.matchMedia = () => ({ matches: true, addEventListener() {} });
  const events = [];
  doc.addEventListener('timeline:date', e => events.push(e.detail));
  w.eval(['lib/publication-date', 'lib/sky-date', 'scripts/timeline'].map(source).join('\n'));
  const clock = doc.querySelector('time');
  return {
    dates, rows, events, clock, doc, w, dom,
    advance(ms) { now += ms; },
    timer: () => timer,
    visibility(value) { hidden = value; doc.dispatchEvent(new w.Event('visibilitychange')); },
    render(event) {
      if (event) doc.querySelector('main').dispatchEvent(new w.Event(event));
      frame?.();
    },
    scroll(y) { w.scrollY = y; w.dispatchEvent(new w.Event('scroll')); frame(); },
  };
}

test('the live UTC sky uses browser time and catches up at minute boundaries and on tab return', () => {
  const t = setup(900);
  assert.equal(t.clock.dateTime, '2026-11-23T00:59:48.456Z');
  assert.equal(t.clock.textContent, '00:59 UTC');
  assert.equal(t.events[0].live, true);
  assert.equal(t.timer().delay, 11544);
  t.advance(11544);
  t.timer().callback();
  assert.equal(t.clock.textContent, '01:00 UTC');
  t.visibility(true);
  assert.equal(t.timer(), undefined);
  t.advance(3 * 60000);
  t.visibility(false);
  assert.equal(t.clock.textContent, '01:03 UTC');
  assert.equal(t.events.at(-1).iso, t.clock.dateTime);
  t.w.eval('onSkyDate(date => { window.replayed = date; })');
  assert.deepEqual(t.w.replayed, t.events.at(-1));
  t.dom.window.close();
});

test('the first scroll on a tall screen selects the newest post first', () => {
  const t = setup(1200, [180, 300]);
  assert.equal(t.events.at(-1).live, true);
  t.scroll(5);
  assert.equal(t.events.at(-1).iso, t.dates[0]);
  assert.equal(t.events.at(-1).live, false);
  assert.equal(t.rows[0].hasAttribute('data-current'), true);
  t.scroll(125);
  assert.equal(t.events.at(-1).iso, t.dates[1]);
  t.dom.window.close();
});

for (const [layout, height] of [['portrait', 844], ['landscape', 390]]) {
  test(`the sky crosses into exact publication times and returns to live time in ${layout}`, () => {
    const t = setup(height);
    const start = Math.ceil(600 - height * .42);
    t.scroll(start - 1);
    assert.equal(t.events.at(-1).live, true);
    t.scroll(start);
    assert.equal(t.clock.dateTime, t.dates[0]);
    assert.equal(t.rows[0].hasAttribute('data-current'), true);
    assert.equal(t.timer(), undefined);
    t.scroll(start + 160);
    assert.equal(t.clock.dateTime, t.dates[1]);
    // This timestamp is October 1 in UTC, but the post was published on September 30 in Chicago.
    assert.equal(t.clock.textContent, 'Sep 30, 2026');
    assert.equal(t.clock.title, new Date(t.dates[1]).toUTCString());
    assert.equal(t.events.at(-1).live, false);
    assert.equal(t.rows[1].hasAttribute('data-current'), true);
    t.advance(30 * 60000);
    t.scroll(0);
    assert.equal(t.clock.textContent, '01:29 UTC');
    assert.equal(t.doc.querySelector('[data-current]'), null);
    t.scroll(start + 160);
    t.rows.forEach(row => { row.hidden = true; });
    t.render('timeline:results');
    assert.equal(t.events.at(-1).live, true);
    assert.equal(t.doc.querySelector('[data-current]'), null);
    t.dom.window.close();
  });
}
