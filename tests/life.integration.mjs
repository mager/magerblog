// Run after `npm run build` (or use `npm run test:build`).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import { lifeThemes } from '../src/lib/life-themes.ts';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const page = slug => new JSDOM(read(`dist/blog/${slug}/index.html`)).window.document;
const entries = readdirSync(new URL('../src/content/blog/', import.meta.url))
  .filter(file => /\.mdx?$/.test(file))
  .map(file => ({
    slug: file.replace(/\.mdx?$/, ''),
    frontmatter: read(`src/content/blog/${file}`).match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] || '',
  }))
  .filter(entry => /^category:\s*["']?life["']?\s*$/m.test(entry.frontmatter));
const isDraft = entry => /^draft:\s*true\s*$/m.test(entry.frontmatter);

test('every published Life story has its own explicit direction and complete reading shell', () => {
  const stories = entries.filter(entry => !isDraft(entry) && !/^lifeLayout:\s*["']?albums["']?\s*$/m.test(entry.frontmatter));
  assert(stories.length > 0);
  for (const { slug } of stories) {
    assert(Object.hasOwn(lifeThemes, slug), `${slug} needs an authored theme`);
    const document = page(slug);
    assert.equal(document.body.dataset.storyTheme, lifeThemes[slug].id, slug);
    assert.notEqual(document.body.dataset.storyTheme, 'life-notebook', slug);
    assert.equal(document.querySelectorAll('h1').length, 1, slug);
    assert(document.querySelector('main .story-prose')?.textContent.trim(), slug);
    assert(document.querySelector('a[href="#main-content"]'), `${slug} needs a working skip link`);
    assert(document.querySelector('#main-content'), slug);
  }
});

test('Japanese stories declare their language and link to their English counterpart', () => {
  for (const slug of ['2026-05-11-grand-sumo-tokyo', '2026-05-20-hanshin-tigers-baseball']) {
    const english = page(slug);
    const japanese = page(`${slug}-ja`);
    assert.equal(english.documentElement.lang, 'en');
    assert.equal(japanese.documentElement.lang, 'ja');
    assert.equal(japanese.body.dataset.storyTheme, english.body.dataset.storyTheme);
    assert.equal(japanese.querySelector('.story-languages a[lang="en"]').getAttribute('href'), `/blog/${slug}/`);
    assert.equal(english.querySelector('.story-languages a[lang="ja"]').getAttribute('href'), `/blog/${slug}-ja/`);
    assert.equal(japanese.querySelector('.story-languages [aria-current="page"]').lang, 'ja');
    assert.equal(english.querySelector('.story-languages [aria-current="page"]').lang, 'en');
  }
});

test('album poster precedes nine accessible ordered records with covers, years and Spotify links', () => {
  const document = page('2026-10-04-my-nine-albums');
  assert.equal(document.querySelectorAll('h1').length, 1);
  const poster = document.querySelector('.album-poster img');
  assert(poster);
  assert.match(poster.src, /\/2026-10-04-my-nine-albums\/my9albums\.jpg$/);
  assert(poster.alt.trim());
  assert.equal(poster.getAttribute('fetchpriority'), 'high');
  const list = document.querySelector('ol.album-tracklist[role="list"]');
  assert(list, 'The ordered album list must retain its accessibility semantics');
  assert(poster.compareDocumentPosition(list) & document.defaultView.Node.DOCUMENT_POSITION_FOLLOWING);
  const records = [...list.children];
  assert.equal(records.length, 9);
  const destinations = new Set();
  for (const record of records) {
    assert.equal(record.tagName, 'LI');
    const title = record.querySelector('h3');
    assert.match(title.textContent, /\((?:19|20)\d{2}\)/);
    const destination = title.querySelector('a').getAttribute('href');
    assert.match(destination, /^https:\/\/open\.spotify\.com\/album\/[A-Za-z0-9]+$/);
    destinations.add(destination);
    const cover = record.querySelector('.album-cover');
    assert.equal(cover.getAttribute('href'), destination);
    assert(cover.querySelector('img')?.alt.trim());
    assert.equal(record.querySelector('.album-spotify').getAttribute('href'), destination);
  }
  assert.equal(destinations.size, 9);
  assert.match(document.querySelector('.album-prose').textContent, /big headphones[\s\S]*AirPods Pro/);
});

test('the Japanese learning story retains code, a keyboard-accessible table, and Japanese text', () => {
  const document = page('2026-02-22-japanese-tutor-claude-code');
  const prose = document.querySelector('.story-prose');
  assert(prose.querySelectorAll('pre code').length > 0);
  assert.match(prose.textContent, /ありがとう/);
  const table = prose.querySelector('table');
  assert(table);
  assert.equal(table.getAttribute('tabindex'), '0');
  assert.equal(table.querySelectorAll('tbody tr').length, 5);
  assert.match(table.textContent, /Basic Conversation/);
});

test('draft Life posts are absent from public routes and discovery', () => {
  for (const { slug } of entries.filter(isDraft)) {
    assert(!existsSync(new URL(`../dist/blog/${slug}/index.html`, import.meta.url)), slug);
    for (const path of ['index.html', 'life/index.html', 'rss.xml', 'llms.txt', 'sitemap-0.xml']) {
      assert(!read(`dist/${path}`).includes(`/blog/${slug}`), `${slug} leaked into ${path}`);
    }
  }
});
