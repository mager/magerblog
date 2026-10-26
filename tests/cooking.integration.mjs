import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';

const read = path => readFileSync(new URL(`../dist/${path}`, import.meta.url), 'utf8');

for (const mode of ['reduced motion', 'no view transitions', 'view transitions']) {
  test(`cooking filters hide nonmatching cards and restore All (${mode})`, () => {
    const dom = new JSDOM(read('cooking/index.html'), { runScripts: 'outside-only' });
    const { window } = dom;
    const { document } = window;
    for (const link of document.querySelectorAll('link[rel="stylesheet"][href^="/_astro/"]')) {
      const style = document.createElement('style');
      style.textContent = read(link.getAttribute('href').slice(1));
      link.replaceWith(style);
    }
    window.matchMedia = () => ({ matches: mode === 'reduced motion' });
    let transitions = 0;
    if (mode !== 'no view transitions') {
      document.startViewTransition = callback => { transitions++; callback(); };
    }
    const script = [...document.scripts].find(script => script.textContent.includes("getElementById('filterRail')"));
    assert(script, 'filter script is present');
    window.eval(script.textContent);
    const chips = [...document.querySelectorAll('#filterRail .chip')];
    const cards = [...document.querySelectorAll('#recipeGrid .recipe')];
    assert(chips.length > 1 && cards.length > 0);
    for (const chip of [...chips.slice(1), chips[0]]) {
      chip.querySelector('.chip-count').click();
      const expected = cards.filter(card => chip.dataset.filter === 'all' || card.dataset.sub === chip.dataset.filter);
      assert.equal(expected.length, Number(chip.querySelector('.chip-count').textContent));
      assert.equal(document.querySelectorAll('.chip[aria-pressed="true"]').length, 1);
      assert.equal(chip.getAttribute('aria-pressed'), 'true');
      for (const card of cards) {
        assert.equal(card.hidden, !expected.includes(card));
        assert.equal(window.getComputedStyle(card).display, expected.includes(card) ? 'flex' : 'none');
      }
    }
    assert.equal(transitions, mode === 'view transitions' ? chips.length : 0);
    window.close();
  });
}
