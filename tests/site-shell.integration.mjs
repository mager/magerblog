import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, readdirSync} from 'node:fs';
import {JSDOM} from 'jsdom';

const root = new URL('../dist/', import.meta.url);
test('every public page uses one shared header and footer with unique navigation destinations', () => {
  let checked = 0;
  for (const file of readdirSync(root, {recursive:true}).filter(file => file.endsWith('.html'))) {
    const doc = new JSDOM(readFileSync(new URL(file,root),'utf8')).window.document;
    if (!doc.querySelector('.site-header')) continue; // Astro redirects have no site chrome.
    checked++;
    assert.equal(doc.querySelectorAll('.site-header').length,1,file);
    assert.equal(doc.querySelectorAll('.site-footer').length,1,file);
    assert.equal(doc.querySelectorAll('.edition-colophon, .ci-foot, .life-footer').length,0,file);
    const hrefs=[...doc.querySelectorAll('.site-header a, .site-footer a')].map(a=>a.getAttribute('href').replace(/\/$/,''));
    assert.equal(new Set(hrefs).size,hrefs.length,`Repeated site navigation on ${file}`);
    assert(doc.querySelector('.site-header .wordmark[href="/"]'),file);
    assert.equal(doc.querySelector('.header-more'),null,file);
    for(const section of ['notes','seen','links']) assert(doc.querySelector(`.header-sections a[href="/${section}/"]`),file);
    assert(doc.querySelector('.site-footer a[href="/rss.xml"]'),file);
    assert.match(doc.querySelector('.site-footer').textContent,/Built with agents in Chicago/,file);
  }
  assert(checked>100,'Expected to check all generated publication pages');
});
