import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
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
test('draft blog links open noindex previews and stay out of discovery', () => {
  const drafts = new JSDOM(read('dist/drafts/index.html')).window.document;
  assert.match(drafts.querySelector('meta[name="robots"]').content, /noindex/);
  assert(!read('dist/sitemap-0.xml').includes('/drafts'));
  for (const file of readdirSync(new URL('../src/content/blog/', import.meta.url))) {
    if (!/\.mdx?$/.test(file)) continue;
    const source = read(`src/content/blog/${file}`);
    if (/^draft: true$/m.test(source.split('---')[1])) {
      const slug = file.replace(/\.mdx?$/, '');
      assert(drafts.querySelector(`a[href="/blog/${slug}/"]`), file);
      const preview = new JSDOM(read(`dist/blog/${slug}/index.html`)).window.document;
      assert(preview.querySelector('h1'), file);
      assert.match(preview.querySelector('meta[name="robots"]').content, /noindex/, file);
      for (const path of ['index.html', 'cooking/index.html', 'rss.xml', 'llms.txt', 'sitemap-0.xml']) {
        assert(!read(`dist/${path}`).includes(`/blog/${slug}`), `${file} leaked into ${path}`);
      }
    }
  }
});
test('tikka masala preview includes ingredients and the confirmed cooking steps', () => {
  const preview = new JSDOM(read('dist/blog/2026-10-22-gymkhana-chicken-tikka-masala/index.html')).window.document;
  assert.match(preview.querySelector('#ingredients').textContent, /Gymkhana Tikka Masala/);
  const steps = preview.querySelectorAll('#method ol.recipe-steps > li');
  assert.equal(steps.length, 7);
  assert.match(steps[3].textContent, /6 minutes/);
  assert.match(steps[4].textContent, /4 minutes/);
  assert.match(steps[5].textContent, /5 minutes/);
});
