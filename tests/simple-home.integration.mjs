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

test('simple homepage is complete without JavaScript and ignores the retired layout choice', () => {
  const dom = setup(), w = dom.window, doc = w.document;
  w.localStorage.setItem('mager-layout', 'edition');
  w.localStorage.setItem('mager-theme', 'dark');
  w.eval([...doc.scripts].find(script => script.textContent.includes('savedTheme')).textContent);
  assert.equal(doc.documentElement.dataset.theme, 'dark');
  assert.equal(doc.documentElement.dataset.layout, undefined);
  assert.equal(doc.querySelector('[data-layout-toggle], #front-page, .edition-content'), null);
  assert.equal(doc.querySelectorAll('h1').length, 1);
  assert.equal(doc.querySelectorAll('[data-simple-row]').length, data.length);
  assert.equal(doc.querySelectorAll('[data-simple-row][hidden]').length, 1);
  assert(!doc.body.textContent.includes('Writing, photos, and things I’m making.'));
  const lead = doc.querySelector('[data-simple-feature]:not([hidden])');
  assert.equal(lead.dataset.href, data[0].href);
  assert(doc.querySelector('.simple-links h3 a[href^="https://"]'));
  assert.equal(doc.querySelectorAll('.simple-notes:not(.simple-links) article').length, 2);
  const ids = [...doc.querySelectorAll('[id]')].map(element => element.id);
  assert.equal(new Set(ids).size, ids.length);
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
  for (const section of ['tech', 'cooking', 'life', 'notes', 'links', 'seen']) {
    assert(doc.querySelector(`.header-sections a[href="/${section}/"]`), section);
  }
  const input = doc.querySelector('#simple-query');
  input.value = 'homeprot'; input.dispatchEvent(new w.Event('input')); await tick();
  assert.match(visible()[0].textContent, /Homeport/);
  assert.equal(doc.querySelector('[data-simple-feature]:not([hidden])'), null);
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
  assert.equal(doc.querySelector('[data-simple-feature]:not([hidden])').dataset.href, data[0].href);
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
  for (const [route, category] of [['tech', 'tech'], ['cooking', 'food'], ['life', 'life']]) {
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
