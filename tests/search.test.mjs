import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import { JSDOM } from 'jsdom';

const library = stripTypeScriptTypes(readFileSync(new URL('../src/lib/search.ts', import.meta.url), 'utf8')).replaceAll('export ', '');
const client = stripTypeScriptTypes(readFileSync(new URL('../src/scripts/search.ts', import.meta.url), 'utf8')).replace(/^import .*;\n/, '').replace('export function', 'function');
const { createSearchIndex, searchEntries } = new Function(library + ';return {createSearchIndex, searchEntries}')();
const entry = (title, text = '', kind = 'Tech') => ({ title, text, kind, description: '', href: '/blog/example/' });
const tick = () => new Promise(resolve => setTimeout(resolve, 0));

test('search ranks titles, finds body words in any order, and folds accents and punctuation', () => {
  const index = createSearchIndex([
    entry('A trip', 'I ate café rice'), entry('Café rice', '', 'Cooking'), entry('Rice notes', 'cafe', 'Note'),
    entry('安全 🍚 مرحبا', '日本語'), entry('Mac-mini', 'keyboard'),
  ]);
  assert.equal(searchEntries(index, 'CAFE rice')[0].title, 'Café rice');
  assert.equal(searchEntries(index, 'rice cafe').length, 3);
  assert.equal(searchEntries(index, 'mac mini')[0].title, 'Mac-mini');
  assert.equal(searchEntries(index, '日本語')[0].title, '安全 🍚 مرحبا');
  assert.equal(searchEntries(index, 'cooking')[0].title, 'Café rice');
  assert.equal(searchEntries(index, 'missing').length, 0);
  assert.equal(searchEntries(index, '  !!! ').length, 0);
});

function fixture(fetch) {
  const component = readFileSync(new URL('../src/components/Search.astro', import.meta.url), 'utf8').split('<script>')[0];
  const dom = new JSDOM(`<button data-open-search hidden>Search</button><details class="header-browse" open></details>${component}`, { url: 'https://example.test', runScripts: 'outside-only' });
  const w = dom.window;
  w.fetch = fetch;
  w.HTMLDialogElement.prototype.showModal = function () { this.open = true; };
  w.HTMLDialogElement.prototype.close = function () { this.open = false; this.dispatchEvent(new w.Event('close')); };
  w.eval(library + '\n' + client + '\ninitSearch();');
  return { dom, w, doc: w.document, input: w.document.querySelector('input'), trigger: w.document.querySelector('[data-open-search]') };
}

test('tap opens and focuses search; results stay safe, clear works, and close restores focus', async () => {
  let requests = 0;
  const title = '安全 🍚 مرحبا <img src=x onerror=alert(1)> ' + 'x'.repeat(180);
  const { w, doc, input, trigger } = fixture(async () => { requests++; return { ok: true, json: async () => [entry(title), ...Array.from({ length: 9 }, (_, i) => entry(`Rice ${i}`))] }; });
  assert.equal(requests, 0, 'index is not loaded before search opens');
  assert.equal(trigger.hidden, false);
  trigger.focus(); trigger.click();
  assert.equal(doc.querySelector('dialog').open, true);
  assert.equal(doc.querySelector('details').open, false);
  assert.equal(doc.activeElement, input);
  assert.match(doc.querySelector('[role="status"]').textContent, /Loading/);
  await tick();
  input.value = '安全'; input.dispatchEvent(new w.Event('input'));
  assert.equal(doc.querySelector('.search-result-title').textContent, title);
  assert.equal(doc.querySelectorAll('img').length, 0);
  input.value = 'rice'; input.dispatchEvent(new w.Event('input'));
  assert.equal(doc.querySelectorAll('#search-results a').length, 9, 'results are not cut off at five');
  input.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
  assert.equal(doc.activeElement, doc.querySelector('#search-results a'));
  input.value = 'notfound'; input.dispatchEvent(new w.Event('input'));
  assert.equal(doc.querySelectorAll('#search-results a').length, 0);
  assert.match(doc.querySelector('[role="status"]').textContent, /No results/);
  doc.querySelector('[data-clear-search]').click();
  assert.equal(input.value, '');
  assert.equal(doc.activeElement, input);
  doc.querySelector('[data-close-search]').click();
  assert.equal(doc.activeElement, trigger);
  assert.equal(doc.body.style.overflow, '');
  trigger.click(); await tick();
  assert.equal(requests, 1, 'loaded index is reused');
  w.close();
});

test('failed requests can retry and search uses the latest typed query after loading', async () => {
  let requests = 0;
  const { w, doc, input, trigger } = fixture(async () => {
    if (++requests === 1) throw new Error('offline');
    return { ok: true, json: async () => [entry('Rice'), entry('Pasta')] };
  });
  trigger.click(); await tick();
  assert.match(doc.querySelector('[role="status"]').textContent, /could not load/);
  assert.equal(doc.querySelector('[data-retry-search]').hidden, false);
  doc.querySelector('[data-retry-search]').click();
  input.value = 'pasta'; input.dispatchEvent(new w.Event('input'));
  await tick();
  assert.equal(doc.querySelectorAll('#search-results a').length, 1);
  assert.equal(doc.querySelector('.search-result-title').textContent, 'Pasta');
  assert.equal(doc.querySelector('[data-retry-search]').hidden, true);
  input.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  assert.equal(doc.querySelector('dialog').open, false);
  w.close();
});
