import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {stripTypeScriptTypes} from 'node:module';
const source = stripTypeScriptTypes(readFileSync(new URL('../src/lib/content-meta.ts', import.meta.url), 'utf8'));
const {contentMeta} = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
test('recipe metadata distinguishes total and partial timing', () => {
  const recipe = data => ({collection:'blog', data:{category:'food',...data}, body:'Recipe'});
  assert.equal(contentMeta(recipe({prepTime:10,cookTime:25})), '35 min total');
  assert.equal(contentMeta(recipe({prepTime:10})), '10 min prep');
  assert.equal(contentMeta(recipe({cookTime:25})), '25 min cooking');
  assert.equal(contentMeta(recipe({})), undefined);
});
test('metadata uses reading length and authored visual context without inventing missing values', () => {
  assert.equal(contentMeta({collection:'notes',data:{},body:'word '.repeat(221)}), '2 min read');
  assert.equal(contentMeta({collection:'notes',data:{},body:''}), undefined);
  assert.equal(contentMeta({collection:'seen',data:{location:'Chicago'}}), 'Chicago');
  assert.equal(contentMeta({collection:'seen',data:{mediaType:'screenshot'}}), 'Screenshot');
  assert.equal(contentMeta({collection:'seen',data:{mediaType:'photo'}}), undefined);
});
