import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { JSDOM } from 'jsdom';

for (const [page, fallback] of [['software', 'dark'], ['about', 'light']]) {
  const html = readFileSync(new URL(`../dist/${page}/index.html`, import.meta.url), 'utf8');
  const doc = new JSDOM(html).window.document;
  const script = [...doc.querySelectorAll('script')].find(el => el.textContent.includes('savedTheme')).textContent;
  test(`${page} applies its default before paint and respects explicit preferences`, () => {
    for (const saved of [null, 'dark', 'light', 'invalid']) {
      const document = { documentElement: { dataset: {} } };
      runInNewContext(script, { document, localStorage: { getItem: () => saved } });
      assert.equal(document.documentElement.dataset.theme, ['dark', 'light'].includes(saved) ? saved : fallback);
    }
  });
  test(`${page} falls back safely when storage is blocked`, () => {
    const document = { documentElement: { dataset: {} } };
    runInNewContext(script, { document, localStorage: { getItem() { throw new Error('Blocked'); } } });
    assert.equal(document.documentElement.dataset.theme, fallback);
  });
}
