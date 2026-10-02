import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import { JSDOM } from 'jsdom';
const source = stripTypeScriptTypes(readFileSync(new URL('../src/scripts/edition.ts', import.meta.url), 'utf8'));
for (const mode of ['fallback', 'transition', 'reduced-motion']) {
  test(`edition and chronological views remain accessible with ${mode}`, () => {
    const dom = new JSDOM(`<body><div class="edition-switch" hidden><button data-edition-view="front" aria-pressed="true">Front page</button><button data-edition-view="stream" aria-pressed="false">All updates</button></div><div id="front-page">Stories</div><section id="chronological-feed"><details><summary>All updates</summary>Feed</details></section></body>`, { runScripts: 'outside-only' });
    const w = dom.window;
    let transitions = 0;
    w.matchMedia = () => ({ matches: mode === 'reduced-motion' });
    if (mode !== 'fallback') w.document.startViewTransition = callback => { transitions++; callback(); };
    w.eval(source);
    const front = w.document.querySelector('#front-page'), stream = w.document.querySelector('#chronological-feed');
    assert.equal(front.hidden, false);
    assert.equal(stream.hidden, true);
    assert.equal(w.document.querySelector('.edition-switch').hidden, false);
    w.document.querySelector('[data-edition-view="stream"]').click();
    assert.equal(front.hidden, true);
    assert.equal(stream.hidden, false);
    assert.equal(stream.querySelector('details').open, true);
    assert.equal(w.document.querySelector('[data-edition-view="stream"]').getAttribute('aria-pressed'), 'true');
    w.document.querySelector('[data-edition-view="front"]').click();
    assert.equal(front.hidden, false);
    assert.equal(stream.hidden, true);
    assert.equal(transitions, mode === 'transition' ? 2 : 0);
    w.close();
  });
}
