import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import { JSDOM } from 'jsdom';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const source = path => stripTypeScriptTypes(read(path)).replace(/^import .*;\n/gm, '').replaceAll('export ', '');
const data = JSON.parse(read('dist/search-index.json'));
const tick = () => new Promise(resolve => setTimeout(resolve, 0));
function setup(path = 'index.html', fetcher = async () => ({ ok: true, json: async () => data }), query = '') {
  const dom = new JSDOM(read(`dist/${path}`), { url: `https://mager.co/${query}`, runScripts: 'outside-only' });
  dom.window.fetch = fetcher;
  return dom;
}
function enhance(w) {
  w.eval(['src/lib/search.ts', 'src/scripts/search-data.ts', 'src/scripts/search-dom.ts', 'src/scripts/simple-home.ts'].map(source).join('\n'));
}

test('the full timeline is visible in publication order without JavaScript', () => {
  const dom = setup(), w = dom.window, doc = w.document;
  w.localStorage.setItem('mager-layout', 'edition');
  w.localStorage.setItem('mager-theme', 'dark');
  w.eval([...doc.scripts].find(script => script.textContent.includes('savedTheme')).textContent);
  assert.equal(doc.documentElement.dataset.theme, 'dark');
  assert.equal(doc.documentElement.dataset.layout, undefined);
  assert.equal(doc.querySelector('[data-layout-toggle], #front-page, .edition-content'), null);
  assert.equal(doc.querySelectorAll('h1').length, 1);
  const rows = [...doc.querySelectorAll('ol > [data-simple-row]')];
  assert.deepEqual(rows.map(row => row.dataset.href), data.map(entry => entry.href));
  assert(rows.every(row => !row.hidden));
  assert.equal(doc.querySelector('[data-simple-feature]'), null);
  assert.deepEqual(new Set(rows.map(row => row.dataset.category)), new Set(['notes', 'food', 'tech', 'life', 'seen', 'links']));
  for (const row of rows) {
    const href = row.querySelector('a').getAttribute('href');
    if (row.dataset.category === 'links') assert.match(href, /^https?:\/\//);
    else assert.equal(href, row.dataset.href);
  }
  for (const section of ['notes', 'links']) {
    const archive = doc.querySelector(`main nav[aria-label] a[href="/${section}/"]`);
    assert(archive?.textContent.trim(), section);
  }
  const ids = [...doc.querySelectorAll('[id]')].map(element => element.id);
  assert.equal(new Set(ids).size, ids.length);
  dom.window.close();
});

test('Seen timeline entries display the published photos and screenshots with their descriptions', () => {
  const dom = setup();
  const seen = dom.window.document.querySelectorAll('[data-simple-row][data-category="seen"]');
  const kinds = new Set();
  for (const row of seen) {
    const detail = setup(row.dataset.href.slice(1) + 'index.html');
    const document = detail.window.document;
    const expected = document.querySelector('.seen-photo');
    const image = row.querySelector('img');
    assert.equal(image?.getAttribute('src'), expected.getAttribute('src'), row.dataset.href);
    assert.equal(image.alt, expected.alt);
    const kind = document.querySelector('.seen-meta').textContent.includes('Screenshot') ? 'Screenshot' : 'Photo';
    kinds.add(kind);
    assert(row.textContent.includes(kind), row.dataset.href);
    detail.window.close();
  }
  assert.deepEqual(kinds, new Set(['Photo', 'Screenshot']));
  dom.window.close();
});

test('homepage keeps full-text ranking, typos, clear, and progressive loading without category filters', async () => {
  let requests = 0;
  const dom = setup('index.html', async () => { requests++; return { ok: true, json: async () => data }; });
  const w = dom.window, doc = w.document;
  enhance(w);
  const visible = () => [...doc.querySelectorAll('[data-simple-row]:not([hidden])')];
  assert.equal(requests, 0);
  assert.equal(visible().length, 24);
  doc.querySelector('[data-simple-more]').click();
  assert.equal(visible().length, 48);
  assert.equal(doc.activeElement, visible()[24].querySelector('a'));
  assert.equal(doc.querySelector('[data-simple-filter]'), null);
  for (const section of ['tech', 'cooking', 'life', 'seen']) {
    assert(doc.querySelector(`.header-sections a[href="/${section}/"]`), section);
  }
  for (const section of ['notes', 'links']) {
    assert.equal(doc.querySelector(`.header-sections a[href="/${section}/"]`), null);
  }
  const input = doc.querySelector('#simple-query');
  input.value = 'homeprot'; input.dispatchEvent(new w.Event('input')); await tick();
  assert.match(visible()[0].textContent, /Homeport/);
  assert(visible()[0].querySelector('mark'));
  assert.equal(requests, 1);
  input.value = 'teaspoon'; input.dispatchEvent(new w.Event('input'));
  assert(visible().some(row => row.dataset.category === 'food'), 'ingredient in recipe body is searchable');
  assert(visible().some(row => /teaspoon/i.test(row.querySelector('.simple-search-snippet').textContent)));
  input.value = 'zznomatch123'; input.dispatchEvent(new w.Event('input'));
  assert.equal(visible().length, 0);
  assert.equal(doc.querySelector('[data-simple-empty]').hidden, false);
  doc.querySelector('[data-simple-clear]').click();
  assert.equal(visible().length, 24);
  assert.equal(doc.activeElement, input);
  assert.equal(w.location.search, '');
  assert.deepEqual(visible().map(row => row.dataset.href), data.slice(0, 24).map(entry => entry.href));
  dom.window.close();
});

test('scrolling near the end reveals older entries and keeps keyboard focus in place', () => {
  const dom = setup(), w = dom.window, doc = w.document;
  let intersect;
  w.IntersectionObserver = class {
    constructor(callback) { this.callback = callback; }
    observe(target) { intersect = isIntersecting => this.callback([{ target, isIntersecting }]); }
  };
  enhance(w);
  const visible = () => [...doc.querySelectorAll('[data-simple-row]:not([hidden])')];
  const link = visible()[10].querySelector('a');
  link.focus();
  intersect(false);
  assert.equal(visible().length, 24);
  intersect(true);
  assert.deepEqual(visible().map(row => row.dataset.href), data.slice(0, 48).map(entry => entry.href));
  assert.equal(doc.activeElement, link);
  dom.window.close();
});

test('saved search URLs restore and failed requests retry with the latest query', async () => {
  let calls = 0;
  const dom = setup('index.html', async () => {
    if (++calls === 1) throw new Error('Offline');
    return { ok: true, json: async () => data };
  }, '?q=homeprot&type=tech');
  const w = dom.window, doc = w.document;
  enhance(w); await tick();
  assert.match(doc.querySelector('[data-simple-status]').textContent, /could not load/);
  assert.equal(doc.querySelector('[data-simple-retry]').hidden, false);
  const input = doc.querySelector('#simple-query');
  input.value = 'sidework';
  doc.querySelector('[data-simple-retry]').click(); await tick();
  assert.match(doc.querySelector('[data-simple-row]:not([hidden])').textContent, /Sidework/);
  assert.equal(doc.querySelector('[data-simple-retry]').hidden, true);
  dom.window.close();
});

test('category leads use publication order, appear once, and remain searchable', async () => {
  const home = setup().window.document;
  const allRows = [...home.querySelectorAll('[data-simple-row]')];
  for (const [route, category] of [['tech', 'tech'], ['life', 'life']]) {
    const dom = setup(`${route}/index.html`), doc = dom.window.document;
    const expected = allRows.find(row => row.dataset.category === category).dataset.href;
    const feature = doc.querySelector('[data-simple-feature]');
    assert.equal(feature.dataset.href, expected, route);
    assert.equal(doc.querySelectorAll('[data-simple-row][hidden]').length, 1);
    assert([...doc.querySelectorAll('[data-simple-row]')].every(row => row.dataset.category === category));
    enhance(dom.window);
    const input = doc.querySelector('#simple-query');
    input.value = feature.querySelector('h2').textContent;
    input.dispatchEvent(new dom.window.Event('input')); await tick();
    assert.equal(feature.hidden, true);
    assert.equal(doc.querySelector('[data-simple-row]:not([hidden])').dataset.href, expected);
    doc.querySelector('[data-simple-clear]').click();
    assert.equal(feature.hidden, false);
    assert.equal(doc.querySelector(`[data-simple-row][data-href="${expected}"]`).hidden, true);
    dom.window.close();
  }
});

test('global and inline search share one request; video playback remains available in Links', async () => {
  let requests = 0;
  const dom = setup('index.html', async () => { requests++; return { ok: true, json: async () => data }; });
  const w = dom.window, doc = w.document;
  w.HTMLDialogElement.prototype.showModal = function() { this.open = true; };
  w.HTMLDialogElement.prototype.close = function() { this.open = false; };
  enhance(w);
  doc.querySelector('#simple-query').focus(); await tick();
  w.eval(source('src/scripts/search.ts') + '\ninitSearch();');
  doc.querySelector('[data-open-search]').click(); await tick();
  assert.equal(requests, 1);
  assert(doc.querySelector('#search-results a'));
  const links = setup('links/index.html');
  assert(links.window.document.querySelector('.simple-video summary'));
  assert(links.window.document.querySelector('.simple-video iframe'));
  links.window.close(); dom.window.close();
});
