import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import { JSDOM } from 'jsdom';

const source = stripTypeScriptTypes(readFileSync(new URL('../src/scripts/header-browse.ts', import.meta.url), 'utf8')).replace('export function', 'function');
test('Browse dismisses on Escape, outside click, and focus leave without stealing focus', () => {
  const dom = new JSDOM('<header><details class="header-browse"><summary>Browse</summary><a href="/notes/">Notes</a></details></header><button>Outside</button>', { runScripts: 'outside-only' });
  const w = dom.window, doc = w.document;
  w.eval(source + '\nenhanceHeaderBrowse(document.querySelector("header"));');
  const details = doc.querySelector('details'), summary = doc.querySelector('summary'), link = doc.querySelector('a'), outside = doc.querySelector('button');
  details.open = true; link.focus();
  doc.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  assert.equal(details.open, false);
  assert.equal(doc.activeElement, summary);
  details.open = true; summary.focus(); link.focus();
  assert.equal(details.open, true, 'moving within Browse keeps it open');
  outside.focus();
  assert.equal(details.open, false);
  assert.equal(doc.activeElement, outside);
  details.open = true; outside.click();
  assert.equal(details.open, false);
  details.open = true;
  doc.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  assert.equal(details.open, false);
  assert.equal(doc.activeElement, outside, 'Escape outside Browse preserves focus');
  dom.window.close();
});
