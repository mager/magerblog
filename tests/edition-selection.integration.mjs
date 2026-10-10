import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import { makeEdition } from '../src/lib/edition-selection.ts';

const page = new JSDOM(readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8')).window.document;

const articles = [...page.querySelectorAll('#chronological-feed [data-kind="blog"]')].map(item => ({
  id: item.querySelector('.entry-title a').getAttribute('href').replace(/^\/blog\/|\/$/g, ''),
  collection: 'blog',
  data: { pubDate: new Date(item.dataset.published), category: item.dataset.category,
    heroImage: item.querySelector('.entry-photo img')?.src },
}));
const edition = makeEdition(articles);

test('the opening spread renders the selected stories, photos and categories without duplicating them below', () => {
  const expected = [edition.lead, ...edition.supporting].filter(Boolean);
  assert.deepEqual([...page.querySelectorAll('.lead-column [data-edition-entry]')].map(item => item.dataset.editionEntry), expected.map(item => `blog/${item.id}`));
  for (const entry of expected) {
    const story = page.querySelector(`.front-spread [data-edition-entry="blog/${entry.id}"]`);
    if (entry.data.heroImage) assert(story.querySelector('img'));
    assert(story.querySelector('.story-kind'));
    assert.equal(page.querySelectorAll(`#front-page [data-edition-entry="blog/${entry.id}"]`).length, 1);
  }
});

test('All updates includes cooking and life alongside the other collections without JavaScript', () => {
  const feed = page.querySelector('#chronological-feed');
  assert(feed.querySelector('[data-category="food"] a[href="/blog/2026-10-03-apple-cinnamon-bread/"]'));
  assert(feed.querySelector('[data-category="life"] a[href="/blog/2026-10-04-my-nine-albums/"]'));
  for (const kind of ['blog', 'notes', 'seen', 'links', 'artifacts']) assert(feed.querySelector(`[data-kind="${kind}"]`));
});

test('the opening spread has category-neutral headings', () => {
  assert.equal(page.querySelector('#lead-section').textContent, 'Front page');
  assert.equal(page.querySelector('#dispatch-heading').textContent, 'Latest updates');
});
