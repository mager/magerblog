import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import { load } from 'js-yaml';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const turkeyHref = '/blog/2020-11-25-thanksgiving-turkey/';
const noteHref = '/notes/2026-11-21-sidework-plugin-v0-1/';
const turkey = load(read('src/content/blog/2020-11-25-thanksgiving-turkey.md').split('---')[1]);
const updated = new Date(turkey.updatedDate).toISOString();

test('an updated older post precedes a newer publication in the homepage, search index, and RSS', () => {
  const home = new JSDOM(read('dist/index.html')).window.document;
  const homeHrefs = [...home.querySelectorAll('[data-simple-row]')].map(row => row.dataset.href);
  const searchHrefs = JSON.parse(read('dist/search-index.json')).map(entry => entry.href);
  const rss = new JSDOM(read('dist/rss.xml'), { contentType: 'text/xml' }).window.document;
  const rssHrefs = [...rss.querySelectorAll('item > link')].map(link => new URL(link.textContent).pathname);
  for (const hrefs of [homeHrefs, searchHrefs, rssHrefs]) {
    assert(hrefs.includes(turkeyHref) && hrefs.includes(noteHref));
    assert(hrefs.indexOf(turkeyHref) < hrefs.indexOf(noteHref));
  }
  const item = [...rss.querySelectorAll('item')].find(item => item.querySelector('link').textContent.endsWith(turkeyHref));
  assert.equal(new Date(item.querySelector('pubDate').textContent).toISOString(), new Date(turkey.pubDate).toISOString());
});

test('the homepage shows the update date and uses its authored day for the Earth view', () => {
  const doc = new JSDOM(read('dist/index.html')).window.document;
  const row = doc.querySelector(`[data-href="${turkeyHref}"]`);
  assert.equal(row.dataset.iso, updated);
  assert.equal(row.dataset.dateOnly, updated.slice(0, 10));
  assert.equal(row.querySelector('time').dateTime, updated.slice(0, 10));
  assert.match(row.querySelector('time').getAttribute('aria-label'), /^Updated /);
  assert.match(row.querySelector('.time-kind').textContent, /Updated/);
  const unchanged = doc.querySelector(`[data-href="${noteHref}"]`);
  assert.equal(unchanged.dataset.iso, '2026-11-21T00:00:00.000Z');
  assert.doesNotMatch(unchanged.querySelector('.time-kind').textContent, /Updated/);
});

test('archive rows and features label the date used for update ordering', () => {
  const doc = new JSDOM(read('dist/blog/index.html')).window.document;
  const row = doc.querySelector(`[data-simple-row][data-href="${turkeyHref}"]`);
  assert.equal(row.querySelector('time').dateTime, updated);
  assert.match(row.querySelector('time').textContent, /^Updated /);
  for (const feature of doc.querySelectorAll('[data-simple-feature]')) {
    const base = `src/content${feature.dataset.href.slice(0, -1)}`;
    const path = existsSync(new URL(`../${base}.md`, import.meta.url)) ? `${base}.md` : `${base}.mdx`;
    const metadata = load(read(path).split('---')[1]);
    assert.equal(feature.querySelector('time').dateTime, new Date(metadata.updatedDate ?? metadata.pubDate).toISOString());
    assert.equal(feature.querySelector('time').textContent.startsWith('Updated '), !!metadata.updatedDate);
  }
});
