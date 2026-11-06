// Run after `npm run build` (or use `npm run test:build`).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { JSDOM } from 'jsdom';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const html = path => new JSDOM(read(`dist/${path}`)).window.document;

test('homepage exposes all published collections as ordinary links without JavaScript', () => {
  const page = html('index.html');
  const rows = [...page.querySelectorAll('[data-simple-row]')];
  assert(rows.length > 100);
  assert.equal(new Set(rows.map(row => row.dataset.href)).size, rows.length);
  for (const category of ['tech', 'food', 'life', 'notes', 'seen', 'links']) assert(rows.some(row => row.dataset.category === category));
  assert.equal(page.querySelectorAll('h1').length, 1);
  for (const row of rows) {
    assert(row.querySelector('time'));
    const href = row.querySelector('a').getAttribute('href');
    if (href.startsWith('/')) assert(existsSync(new URL(`../dist${href}index.html`, import.meta.url)), href);
  }
});

test('notes have a compact dedicated layout while keeping the complete body and source', () => {
  const page = html('notes/2026-07-17-mager-bench-free-tier/index.html');
  assert.equal(page.querySelectorAll('h1').length, 1);
  assert(page.querySelector('.note-layout .note-prose'));
  assert.equal(page.querySelector('.reading-dek, .reading-progress, .reading-contents'), null);
  assert(page.querySelectorAll('.note-prose p').length > 1);
  assert(page.querySelector('.note-prose pre code'));
  assert.equal(page.querySelector('.note-source').href, 'https://bench.mager.co/');
  assert(page.querySelector('.note-meta time'));

});


test('Impeccable article replaces the note and preserves its published URL', () => {
  const articlePath = '/blog/2026-10-04-diving-into-impeccable/';
  const oldPath = '/notes/2026-10-01-diving-into-impeccable/';
  const article = html(`${articlePath.slice(1)}index.html`);
  assert(article.querySelector('.reading-article .reading-prose'));
  assert(article.querySelector('.reading-contents'));
  assert.equal(article.querySelectorAll('h1').length, 1);
  const redirect = html(`${oldPath.slice(1)}index.html`);
  assert(redirect.querySelector('meta[http-equiv="refresh"]').content.includes(articlePath.slice(0, -1)));
  const rss = new JSDOM(read('dist/rss.xml'), { contentType: 'text/xml' }).window.document;
  const items = [...rss.querySelectorAll('item link')].filter(link => link.textContent.includes('diving-into-impeccable'));
  assert.equal(items.length, 1);
  assert(items[0].textContent.endsWith(articlePath));
  assert.equal(html('notes/index.html').querySelector(`a[href="${oldPath}"]`), null);
});
