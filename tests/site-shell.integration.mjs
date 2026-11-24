import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, readdirSync} from 'node:fs';
import {JSDOM} from 'jsdom';

const root = new URL('../dist/', import.meta.url);
test('every public page uses one shared header and footer with unique navigation destinations', () => {
  let checked = 0;
  for (const file of readdirSync(root, {recursive:true}).filter(file => file.endsWith('.html'))) {
    const doc = new JSDOM(readFileSync(new URL(file,root),'utf8')).window.document;
    for (const link of doc.querySelectorAll('a[href*="bench" i]')) {
      const url = new URL(link.getAttribute('href'), 'https://mager.co/');
      const host = url.hostname.replace(/^www\./, '');
      const projectLink = ['bench.mager.co', 'mager-bench-web.vercel.app'].includes(host)
        || (host === 'github.com' && /^\/mager\/mager-bench(?:\.git)?(?:\/|$)/i.test(url.pathname));
      assert(!projectLink, `Retired Bench project link in ${file}: ${url.href}`);
    }
    if (!doc.querySelector('.site-header')) continue; // Astro redirects have no site chrome.
    checked++;
    assert.equal(doc.querySelectorAll('.site-header').length,1,file);
    assert.equal(doc.querySelectorAll('#site-search').length,1,file);
    assert(doc.querySelector('.site-header [data-open-search]'),file);
    assert.equal(doc.querySelectorAll('.site-footer').length,1,file);
    assert.equal(doc.querySelectorAll('.edition-colophon, .ci-foot, .life-footer').length,0,file);
    const hrefs=[...doc.querySelectorAll('.site-header a, .site-footer a')].map(a=>a.getAttribute('href').replace(/\/$/,''));
    assert.equal(new Set(hrefs).size,hrefs.length,`Repeated site navigation on ${file}`);
    assert(doc.querySelector('.site-header .wordmark[href="/"]'),file);
    assert.equal(doc.querySelectorAll('.header-sections > a').length,5,file);
    assert.equal(doc.querySelector('.header-sections > a[href="/blog/"]'),null,file);
    assert.equal(doc.querySelector('.header-sections > a[href="/software/"]'),null,file);
    assert.equal(doc.querySelector('.header-browse'),null,file);
    assert.equal(doc.querySelector('[data-open-search]').getAttribute('aria-label'),'Search',file);
    for(const section of ['tech','kitchen','life','seen','notes']) assert(doc.querySelector(`.header-sections > a[href="/${section}/"]`),file);
    assert.equal(doc.querySelector('.header-sections > a[href="/links/"]'),null,file);
    assert(doc.querySelector('.site-footer a[href="/rss.xml"]'),file);
    assert.match(doc.querySelector('.site-footer').textContent,/Built with agents in Chicago/,file);
  }
  assert(checked>100,'Expected to check all generated publication pages');
});

test('home and list routes opt into one shared content shell', () => {
  const routes = {
    'index.html': '.time-shell',
    'blog/index.html': 'main',
    'tech/index.html': 'main',
    'life/index.html': '.life-heading, .cefalu-coast, .life-scene-caption, .life-content',
    'kitchen/index.html': 'main',
    'seen/index.html': 'main',
    'notes/index.html': 'main',
    'links/index.html': 'main',
    'software/index.html': 'main',
    'drafts/index.html': 'main',
  };
  for (const [file, selector] of Object.entries(routes)) {
    const doc = new JSDOM(readFileSync(new URL(file, root), 'utf8')).window.document;
    for (const part of selector.split(', ')) {
      assert(doc.querySelector(part)?.classList.contains('site-content-shell'), file + ': ' + part);
    }
    assert(doc.body.classList.contains('site-list-page'), file);
  }
});
