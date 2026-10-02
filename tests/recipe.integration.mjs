import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { JSDOM } from 'jsdom';
const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
test('published recipes have static ingredients and ordered steps, with no Cook Mode', () => {
  for (const slug of ['2026-10-03-apple-cinnamon-bread', '2026-03-15-banana-bread', '2026-08-07-cherry-tomato-pasta', '2025-12-13-broccoli-cheddar-soup']) {
    const source = read(`dist/blog/${slug}/index.html`);
    const d = new JSDOM(source).window.document;
    assert(d.querySelector('#ingredients li'));
    assert(d.querySelector('#method ol.recipe-steps > li'));
    assert(d.querySelector('a[href="#ingredients"]'));
    assert.equal(d.querySelectorAll('h1').length, 1);
    assert(!source.includes('cook-mode'));
    assert(!d.querySelector('.cooking-content h4'));
  }
});
test('draft blog posts produce no public permalink or discovery entries', () => {
  for (const file of readdirSync(new URL('../src/content/blog/', import.meta.url))) {
    if (!/\.mdx?$/.test(file)) continue;
    const source = read(`src/content/blog/${file}`);
    if (/^draft: true$/m.test(source.split('---')[1])) {
      const slug = file.replace(/\.mdx?$/, '');
      assert(!existsSync(new URL(`../dist/blog/${slug}/index.html`, import.meta.url)), file);
      for (const path of ['index.html', 'cooking/index.html', 'rss.xml', 'llms.txt', 'sitemap-0.xml']) {
        assert(!read(`dist/${path}`).includes(`/blog/${slug}`), `${file} leaked into ${path}`);
      }
    }
  }
});
