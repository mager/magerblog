import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import { JSDOM } from 'jsdom';

const component = readFileSync(new URL('../src/components/ThemeToggle.astro', import.meta.url), 'utf8');
const script = stripTypeScriptTypes(component.match(/<script>([\s\S]*?)<\/script>/)[1]);

for (const blocked of [false, true]) {
  test(`theme control switches both ways with ${blocked ? 'blocked' : 'available'} storage`, () => {
    const dom = new JSDOM('<html data-theme="light"><button data-theme-toggle hidden><span data-theme-label></span></button></html>', {
      runScripts: 'outside-only', url: 'https://example.test/cooking/',
    });
    const { window } = dom;
    if (blocked) Object.defineProperty(window, 'localStorage', { get() { throw new Error('Blocked'); } });
    window.eval(script);
    const button = window.document.querySelector('button');
    assert.equal(button.hidden, false);
    for (const theme of ['dark', 'light']) {
      button.click();
      assert.equal(window.document.documentElement.dataset.theme, theme);
      assert.equal(button.getAttribute('aria-label'), `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
      if (!blocked) assert.equal(window.localStorage.getItem('mager-theme'), theme);
    }
    window.close();
  });
}
