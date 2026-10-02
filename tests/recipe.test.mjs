import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { prepareRecipe } from '../src/lib/recipe.ts';

const document = markup => new JSDOM(prepareRecipe(markup).html).window.document;
test('plain Markdown recipes get semantic sections and steps without JS', () => {
  const d = document('<p>Intro</p><h2>What You Need</h2><ul><li>Flour</li><li>Eggs</li></ul><h2>The Method</h2><p>Mix <strong>gently</strong>.</p><p><img src="mix.jpg" alt="Mixing"></p><p>Bake.</p><h2>Notes</h2><p>Cool first.</p>');
  assert.equal(d.querySelectorAll('#ingredients li').length, 2);
  assert.equal(d.querySelectorAll('#method .recipe-steps > li').length, 2);
  assert.equal(d.querySelector('#method li strong').textContent, 'gently');
  assert(d.querySelector('#method li img[loading="lazy"]'));
  assert(!d.querySelector('#method').textContent.includes('Cool first'));
  assert.equal(d.querySelector('h2').textContent, 'Ingredients');
});
test('legacy wrappers preserve ingredient groups, notes and image order', () => {
  const d = document('<div class="recipe-body"><div class="recipe-ingredients"><h4>For the dough</h4><ul><li>Flour</li></ul><h4>For the top</h4><ul><li>Sugar</li></ul></div><div class="recipe-instructions"><p><strong>1. Mix.</strong> Stir well.</p><p>Bake.</p><h4>Notes</h4><p>Keep wrapped.</p></div></div>');
  assert.equal(d.querySelectorAll('#ingredients h3').length, 2);
  assert.equal(d.querySelectorAll('#method .recipe-steps > li').length, 2);
  assert.equal(d.querySelector('#method li strong').textContent, 'Mix.');
  assert.equal(d.querySelector('#method > p').textContent, 'Keep wrapped.');
});
test('authored ordered steps and inline markup survive', () => {
  const d = document('<h2>Ingredients</h2><ul><li>Apples</li></ul><h2>Method</h2><ol><li><strong>Prep.</strong> Dice.</li><li>Bake at 350°F.</li></ol><h2>Storage</h2><p>Freeze slices.</p>');
  assert.equal(d.querySelectorAll('.recipe-steps').length, 1);
  assert.equal(d.querySelectorAll('.recipe-steps > li').length, 2);
  assert.match(d.querySelector('.recipe-steps').textContent, /350°F/);
});
test('unrecognized prose remains intact without invented sections', () => {
  const result = prepareRecipe('<h2>A kitchen note</h2><p>Keep this text.</p>');
  assert.equal(result.hasIngredients, false);
  assert.equal(result.hasMethod, false);
  assert.match(result.html, /Keep this text/);
});
