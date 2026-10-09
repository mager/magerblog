import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import { JSDOM } from 'jsdom';
import { prepareRecipe } from '../src/lib/recipe.ts';

const script = stripTypeScriptTypes(readFileSync(new URL('../src/scripts/recipe.ts', import.meta.url), 'utf8'));
const recipe = '<h2>Ingredients</h2><ul><li>Flour</li></ul><h2>Method</h2><ol><li>Mix.</li><li>Bake.</li><li>Cool.</li></ol>';
function fixture(t, markup = recipe) {
  const dom = new JSDOM(`<html style="scroll-padding-top: 80px"><body>${prepareRecipe(markup).html}</body></html>`, {
    url: 'https://example.test/recipe/', runScripts: 'outside-only', pretendToBeVisual: true,
  });
  t.after(() => dom.window.close());
  const w = dom.window;
  const stops = [...w.document.querySelectorAll('.recipe-ingredients, .recipe-steps > li')];
  const jumps = [];
  for (const [i, stop] of stops.entries()) {
    stop.style.scrollMarginTop = '90px';
    stop.getBoundingClientRect = () => ({ top: 500 + i * 500 - w.scrollY });
    stop.scrollIntoView = options => {
      jumps.push({ stop, options });
      // The final two steps cannot fully align at the page's scroll limit.
      w.scrollY = Math.min(500 + i * 500 - 170, 1300);
    };
  }
  w.eval(script);
  const press = (key, options = {}, target = w.document.activeElement) => {
    const event = new w.KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...options });
    target.dispatchEvent(event);
    return event;
  };
  return { w, stops, jumps, press };
}

test('arrows visit ingredients then each step and reverse without wrapping', t => {
  const { w, stops, jumps, press } = fixture(t);
  press('ArrowLeft');
  assert.equal(jumps.length, 0);
  for (const stop of stops) {
    assert(press('ArrowRight').defaultPrevented);
    assert.equal(jumps.at(-1).stop, stop);
    assert.equal(w.document.activeElement, stop);
    assert.equal(jumps.at(-1).options.behavior, 'instant');
    assert.equal(jumps.at(-1).options.block, 'start');
  }
  press('ArrowRight');
  assert.equal(jumps.at(-1).stop, stops.at(-1));
  for (const stop of stops.slice(0, -1).reverse()) {
    press('ArrowLeft');
    assert.equal(jumps.at(-1).stop, stop);
  }
  press('ArrowLeft');
  assert.equal(jumps.at(-1).stop, stops[0]);
});

test('manual scrolling and section jumps reset the current position', t => {
  const { w, stops, jumps, press } = fixture(t);
  press('ArrowRight');
  w.scrollY = 1000 - 170; // First instruction aligned below both sticky bars.
  press('ArrowRight');
  assert.equal(jumps.at(-1).stop, stops[2]);
  w.scrollY = 0;
  press('ArrowRight');
  assert.equal(jumps.at(-1).stop, stops[0]);
});

test('modified keys, editable controls and open dialogs keep their arrow behavior', t => {
  const { w, jumps, press } = fixture(t);
  for (const modifier of ['metaKey', 'ctrlKey', 'altKey', 'shiftKey', 'isComposing']) {
    assert.equal(press('ArrowRight', { [modifier]: true }).defaultPrevented, false);
  }
  for (const markup of ['<input>', '<textarea></textarea>', '<select></select>', '<button>Print</button>', '<div contenteditable="true"><span>Edit</span></div>', '<div role="slider"></div>', '<video controls></video>']) {
    const container = w.document.createElement('div');
    container.innerHTML = markup;
    w.document.body.append(container);
    assert.equal(press('ArrowRight', {}, container.querySelector('span') || container.firstElementChild).defaultPrevented, false);
  }
  const dialog = w.document.createElement('dialog');
  dialog.open = true;
  w.document.body.append(dialog);
  assert.equal(press('ArrowRight').defaultPrevented, false);
  assert.equal(jumps.length, 0);
});

test('recipes without ingredients begin with the first step; prose does not capture arrows', t => {
  const method = fixture(t, '<h2>Method</h2><ol><li>Mix.</li><li>Bake.</li></ol>');
  method.press('ArrowRight');
  assert.equal(method.jumps.at(-1).stop, method.stops[0]);
  const prose = fixture(t, '<p>A kitchen note.</p>');
  assert.equal(prose.press('ArrowRight').defaultPrevented, false);
});
