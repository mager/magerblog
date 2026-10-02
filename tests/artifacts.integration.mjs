// Run after `npm run build` (or use `npm run test:build`).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { JSDOM } from 'jsdom';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const html = path => new JSDOM(read(`dist/${path}`)).window.document;
const slug = '2026-10-01-frontend';
const href = `/artifacts/${slug}/`;

test('artifact is a centered document with one title, contents, tables, and portable Markdown', () => {
  const page = html(`artifacts/${slug}/index.html`);
  assert.equal(page.querySelectorAll('h1').length, 1);
  assert.equal(page.querySelector('h1').textContent, 'Frontend audit and hardening');
  assert(page.querySelector('.artifact-layout .artifact-prose'));
  assert(page.querySelectorAll('.artifact-prose table').length >= 3);
  for (const table of page.querySelectorAll('.artifact-prose table')) {
    assert.equal(table.getAttribute('tabindex'), '0', 'Scrollable tables need keyboard access without JS');
  }
  for (const link of page.querySelectorAll('.artifact-contents a')) {
    assert(page.getElementById(link.hash.slice(1)), `Missing heading ${link.hash}`);
  }
  const download = page.querySelector('a[download]');
  assert.equal(download.getAttribute('href'), `/artifacts/${slug}.md`);
  assert.equal(download.getAttribute('download'), `${slug}.md`);
  const body = read(`src/content/artifacts/${slug}.md`).replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '').trim();
  assert.equal(read(`dist/artifacts/${slug}.md`).trim(), `# Frontend audit and hardening\n\n${body}`);
});

test('artifact discovery uses short feed previews, archive, RSS, and llms.txt', () => {
  for (const path of ['index.html', 'artifacts/index.html']) {
    const entry = html(path).querySelector(`[data-kind="artifacts"]`);
    assert(entry);
    assert.equal(entry.querySelector('.entry-title a').getAttribute('href'), href);
    assert(entry.querySelector('.entry-description'));
    assert.equal(entry.querySelector('.entry-body'), null, 'Full report must stay off the feed');
  }
  const rss = new JSDOM(read('dist/rss.xml'), { contentType: 'text/xml' }).window.document;
  const item = [...rss.querySelectorAll('item')].find(item => item.querySelector('link').textContent.endsWith(href));
  assert(item);
  assert.match(item.querySelector('description').textContent, /working report/);
  assert(read('dist/llms.txt').includes(`${href.slice(0, -1)}.md`));
});

test('homepage keeps filters and ordinary links without date or permalink clutter', () => {
  const page = html('index.html');
  assert(page.querySelector('[data-feed-filter] option[value="artifacts"]'));
  assert.equal(page.querySelectorAll('.feed-entry.compact .entry-meta time').length, 0);
  assert.equal([...page.querySelectorAll('.feed-entry a')].some(a => /Permalink/i.test(a.textContent)), false);
  const link = page.querySelector('[data-kind="links"] .destination');
  assert.match(link.getAttribute('href'), /^https?:\/\//);
  assert(page.querySelector('.header-more a[href="/notes/"]'));
  assert(page.querySelector('.header-more a[href="/rss.xml"]'));
});

test('draft artifacts never generate pages, downloads, feed entries, or indexes', () => {
  const directory = new URL('../src/content/artifacts/', import.meta.url);
  for (const file of readdirSync(directory, { recursive: true }).filter(file => file.endsWith('.md'))) {
    const source = readFileSync(new URL(file, directory), 'utf8');
    const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] || '';
    if (!/^draft:\s*true\s*$/m.test(frontmatter)) continue;
    const id = file.replace(/\.md$/, '');
    for (const route of [`artifacts/${id}/index.html`, `artifacts/${id}.md`]) {
      assert.equal(existsSync(new URL(`../dist/${route}`, import.meta.url)), false);
    }
    for (const index of ['index.html', 'artifacts/index.html', 'rss.xml', 'llms.txt', 'sitemap-0.xml']) {
      assert.equal(read(`dist/${index}`).includes(`/artifacts/${id}`), false, `${index} exposes ${id}`);
    }
  }
});

test('front page is a complete, varied edition even without JavaScript', () => {
  const page = html('index.html');
  const stories = [...page.querySelectorAll('#front-page [data-edition-entry]')];
  assert(stories.length >= 25 && stories.length <= 35);
  assert.equal(new Set(stories.map(story => story.dataset.editionEntry)).size, stories.length);
  assert.equal(new Set(stories.map(story => story.dataset.editionEntry.split('/')[0])).size, 5);
  assert.equal(page.querySelectorAll('h1').length, 1);
  assert(page.querySelector('.story-lead img[loading="eager"]'));
  assert(page.querySelector('.seen-strip[tabindex="0"]'));
  assert.equal(page.querySelector('#chronological-feed [data-feed]').dataset.pageSize, '24');
  assert.equal(page.querySelector('#front-page').hasAttribute('hidden'), false);
  for (const link of page.querySelectorAll('#front-page a[href^="/"]')) {
    const path = link.getAttribute('href').split('#')[0];
    assert(existsSync(new URL(`../dist${path.endsWith('/') ? `${path}index.html` : path}`, import.meta.url)), `Broken edition link: ${path}`);
  }
});

test('notes have a compact dedicated layout while keeping the complete body and source', () => {
  const page = html('notes/2026-10-01-diving-into-impeccable/index.html');
  assert.equal(page.querySelectorAll('h1').length, 1);
  assert(page.querySelector('.note-layout .note-prose'));
  assert.equal(page.querySelector('.reading-dek, .reading-progress, .reading-contents'), null);
  assert.match(page.querySelector('.note-prose').textContent, /the first useful contribution was a small page/);
  assert.equal(page.querySelector('.note-source').href, 'https://github.com/pbakaus/impeccable');
  assert(page.querySelector('.note-meta time'));
  const home = html('index.html');
  assert.match(home.querySelector('.story-lead .story-detail').textContent, /\d+ min read/);
  assert(home.querySelector('.dispatch-column .story-detail'));
  assert(home.querySelector('.feed-entry.compact .entry-detail'));
  assert.equal(home.querySelectorAll('.feed-entry.compact .entry-meta time').length, 0);
});
