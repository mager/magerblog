import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import { JSDOM } from 'jsdom';
import { prepareRecipe } from '../src/lib/recipe.ts';
const script = stripTypeScriptTypes(readFileSync(new URL('../src/scripts/recipe.ts', import.meta.url), 'utf8'));
const tick = () => new Promise(resolve => setTimeout(resolve, 0));
function fixture(t, fail = false) {
  const markup = '<h2>Ingredients</h2><h3>Filling</h3><ul><li>1½ pounds turkey</li><li>2 tablespoons oil</li></ul><h3>Topping</h3><ul><li>2 pounds potatoes</li></ul><h2>Method</h2><ol><li><p>Brown <strong>the turkey</strong>.</p><p>Stir well.</p><img src="test.jpg" alt="Do not copy this caption"></li><li>Bake at 400°F.</li></ol><h2>Notes</h2><p>Unrelated note.</p>';
  const dom = new JSDOM(prepareRecipe(markup).html, {url:'https://mager.co/blog/test/',runScripts:'outside-only'});
  t.after(()=>dom.window.close());
  const copied=[];
  Object.defineProperty(dom.window.navigator, 'clipboard', {value:{writeText: async text => {if(fail) throw Error('Denied'); copied.push(text);}}});
  dom.window.eval(script);
  return {w:dom.window, doc:dom.window.document, copied};
}
test('separate copy buttons preserve ingredient groups and numbered instructions only', async t => {
  const {doc,copied,w}=fixture(t);
  const buttons=[...doc.querySelectorAll('button')];
  const ingredients=buttons.find(button=>button.textContent==='Copy ingredients');
  const instructions=buttons.find(button=>button.textContent==='Copy instructions');
  assert(instructions, 'instructions have their own copy button');
  assert(ingredients.compareDocumentPosition(doc.querySelector('#ingredients li')) & w.Node.DOCUMENT_POSITION_FOLLOWING);
  doc.querySelector('input').click();
  ingredients.click(); await tick();
  instructions.click(); await tick();
  assert.equal(copied[0], 'Filling\n- 1½ pounds turkey\n- 2 tablespoons oil\n\nTopping\n- 2 pounds potatoes');
  assert.equal(copied[1], '1. Brown the turkey.\nStir well.\n\n2. Bake at 400°F.');
  assert.match(doc.querySelector('.ingredients-status').textContent, /Ingredients copied/);
  assert.match(doc.querySelector('#method [role="status"]').textContent, /Instructions copied/);
});
test('copy failure gives recovery text and enables the button again', async t => {
  const {doc,copied}=fixture(t,true);
  const button=[...doc.querySelectorAll('#method button')].find(button=>button.textContent==='Copy instructions');
  assert(button);
  button.click(); await tick();
  assert.equal(button.disabled,false);
  assert.equal(copied.length,0);
  assert.match(doc.querySelector('#method [role="status"]').textContent,/manually/);
});
