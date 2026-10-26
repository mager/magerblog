// Run after `npm run build` (or use `npm run test:build`).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { JSDOM } from 'jsdom';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const html = path => new JSDOM(read(`dist/${path}`)).window.document;

test('homepage keeps filters and ordinary links without date or permalink clutter', () => {
  const page = html('index.html');
  assert(page.querySelector('[data-feed-filter] option[value="notes"]'));
  assert.equal(page.querySelectorAll('.feed-entry.compact .entry-meta time').length, 0);
  assert.equal([...page.querySelectorAll('.feed-entry a')].some(a => /Permalink/i.test(a.textContent)), false);
  const link = page.querySelector('[data-kind="links"] .destination');
  assert.match(link.getAttribute('href'), /^https?:\/\//);
  assert(page.querySelector('.header-sections a[href="/notes/"]'));
  assert(page.querySelector('.site-footer a[href="/rss.xml"]'));
  assert.equal(page.querySelector('.header-sections a[href="/rss.xml"]'), null);
});

test('front page is a complete, varied edition even without JavaScript', () => {
  const page = html('index.html');
  const stories = [...page.querySelectorAll('#front-page [data-edition-entry]')];
  assert(stories.length >= 25 && stories.length <= 35);
  assert.equal(new Set(stories.map(story => story.dataset.editionEntry)).size, stories.length);
  assert.equal(new Set(stories.map(story => story.dataset.editionEntry.split('/')[0])).size, 4);
  assert.equal(page.querySelectorAll('h1').length, 1);
  const leadImage = page.querySelector('.story-lead img');
  if (leadImage) assert.equal(leadImage.getAttribute('loading'), 'eager');
  assert(page.querySelector('.seen-strip[tabindex="0"]'));
  assert.equal(page.querySelector('#chronological-feed [data-feed]').dataset.pageSize, '24');
  assert.equal(page.querySelector('#front-page').hasAttribute('hidden'), false);
  for (const link of page.querySelectorAll('#front-page a[href^="/"]')) {
    const path = link.getAttribute('href').split('#')[0];
    assert(existsSync(new URL(`../dist${path.endsWith('/') ? `${path}index.html` : path}`, import.meta.url)), `Broken edition link: ${path}`);
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
  const home = html('index.html');
  assert.match(home.querySelector('.story-lead .story-detail').textContent, /\d+ min read/);
  assert(home.querySelector('.dispatch-column .story-detail'));
  assert(home.querySelector('.feed-entry.compact .entry-detail'));
  assert.equal(home.querySelectorAll('.feed-entry.compact .entry-meta time').length, 0);
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
