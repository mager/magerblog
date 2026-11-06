import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import { JSDOM } from 'jsdom';

const html = readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8');
const script = name => stripTypeScriptTypes(readFileSync(new URL(`../src/scripts/${name}.ts`, import.meta.url), 'utf8'));
function setup() {
  return new JSDOM(html, { url: 'https://mager.co/', runScripts: 'outside-only' });
}

test('simple layout restores before paint, toggles independently of color, and works without storage', () => {
  const dom = setup(), w = dom.window, doc = w.document;
  w.localStorage.setItem('mager-layout', 'simple');
  w.localStorage.setItem('mager-theme', 'dark');
  w.eval([...doc.scripts].find(el => el.textContent.includes('savedTheme')).textContent);
  assert.equal(doc.documentElement.dataset.layout, 'simple');
  w.eval(script('layout-toggle'));
  const toggle = doc.querySelector('[data-layout-toggle]');
  assert.equal(toggle.hidden, false);
  assert.equal(toggle.getAttribute('aria-pressed'), 'true');
  toggle.click();
  assert.equal(doc.documentElement.dataset.layout, 'edition');
  assert.equal(w.localStorage.getItem('mager-layout'), 'edition');
  assert.equal(doc.documentElement.dataset.theme, 'dark');
  w.dispatchEvent(new w.StorageEvent('storage', { key: 'mager-layout', newValue: 'simple' }));
  assert.equal(toggle.getAttribute('aria-pressed'), 'true');
  Object.defineProperty(w, 'localStorage', { get() { throw new Error('Blocked'); } });
  toggle.click();
  assert.equal(doc.documentElement.dataset.layout, 'edition');
  dom.window.close();
});

test('simple list filters every collection, combines search, clears empty results, and loads more with focus', () => {
  const dom = setup(), w = dom.window, doc = w.document;
  w.eval(script('simple-home'));
  const rows = [...doc.querySelectorAll('[data-simple-row]')];
  const visible = () => rows.filter(row => !row.hidden);
  assert.equal(visible().length, 24);
  doc.querySelector('[data-simple-more]').click();
  assert.equal(visible().length, Math.min(48, rows.length));
  assert.equal(doc.activeElement, visible()[24].querySelector('a'));
  for (const category of ['tech', 'food', 'life', 'notes', 'links', 'seen']) {
    doc.querySelector(`[data-simple-filter="${category}"]`).click();
    assert(visible().length > 0, category);
    assert(visible().every(row => row.dataset.category === category));
    assert.equal(doc.querySelector(`[data-simple-filter="${category}"]`).getAttribute('aria-pressed'), 'true');
  }
  const input = doc.querySelector('#simple-query');
  input.value = 'no-match-xyz-123';
  input.dispatchEvent(new w.Event('input'));
  assert.equal(visible().length, 0);
  assert.equal(doc.querySelector('[data-simple-empty]').hidden, false);
  doc.querySelector('[data-simple-clear]').click();
  assert(visible().length > 0);
  assert.equal(doc.activeElement, input);
  doc.querySelector('[data-simple-filter="all"]').click();
  const title = rows[0].querySelector('.simple-post-title').textContent.trim();
  input.value = title.toUpperCase();
  input.dispatchEvent(new w.Event('input'));
  assert(visible().includes(rows[0]));
  dom.window.close();
});

test('simple homepage uses published content, direct shared links, and real note permalinks', () => {
  const dom = setup(), doc = dom.window.document;
  const rows = [...doc.querySelectorAll('[data-simple-row]')];
  assert(rows.length > 100);
  for (const row of rows) {
    assert(row.querySelector('time[datetime]'));
    assert.equal(row.hidden, false, 'static content is complete before enhancement');
    assert.doesNotMatch(row.textContent, /My Weight Loss Journey/);
    if (row.dataset.category === 'links') assert.match(row.querySelector('a').href, /^https?:\/\//);
  }
  const notes = [...doc.querySelectorAll('.simple-notes article h3 a')];
  assert(notes.length > 0 && notes.length <= 6);
  assert(notes.every(link => link.getAttribute('href').startsWith('/notes/')));
  const ids = [...doc.querySelectorAll('[id]')].map(el => el.id);
  assert.equal(new Set(ids).size, ids.length, 'no duplicate IDs across the two layouts');
  dom.window.close();
});
