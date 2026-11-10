import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import { JSDOM } from 'jsdom';

const source = stripTypeScriptTypes(readFileSync(new URL('../src/scripts/agent-atlas.ts', import.meta.url), 'utf8'));
function setup(reduced = false) {
  const dom = new JSDOM(`<section data-agent-atlas><div data-atlas-map>
    <a href="/one/" data-atlas-node="one" data-atlas-title="First article">One</a>
    <a href="/two/" data-atlas-node="two" data-atlas-title="Second article">Two</a>
    <svg><path data-atlas-edge="one"/><path data-atlas-edge="two"/></svg>
    </div><p data-atlas-caption>Explore the articles.</p><button data-atlas-motion hidden>Pause motion</button></section>`, {runScripts:'outside-only', pretendToBeVisual:true});
  const w = dom.window;
  const media = new w.EventTarget(); media.matches = reduced;
  w.matchMedia = () => media;
  let visibility;
  w.IntersectionObserver = class { constructor(callback) { visibility = callback; } observe() {} };
  w.eval(source);
  return {dom, w, doc:w.document, media, visibility: visible => visibility([{isIntersecting:visible}])};
}

test('atlas focus selects the matching connection and returns to its default caption', () => {
  const {dom, w, doc} = setup();
  const links = doc.querySelectorAll('[data-atlas-node]');
  links[0].focus();
  assert.equal(doc.querySelector('[data-atlas-caption]').textContent, 'First article');
  assert.equal(doc.querySelector('[data-atlas-edge="one"]').getAttribute('data-active'), 'true');
  links[1].dispatchEvent(new w.MouseEvent('pointerover', {bubbles:true}));
  assert.equal(doc.querySelector('[data-atlas-caption]').textContent, 'Second article');
  doc.querySelector('[data-atlas-map]').dispatchEvent(new w.MouseEvent('pointerleave'));
  assert.equal(doc.querySelector('[data-atlas-caption]').textContent, 'First article');
  doc.querySelector('button').focus();
  assert.equal(doc.querySelector('[data-atlas-caption]').textContent, 'Explore the articles.');
  assert.equal(links[0].getAttribute('href'), '/one/');
  dom.window.close();
});

test('atlas motion respects pause, viewport visibility, and changes to reduced motion', () => {
  const {dom, w, doc, media, visibility} = setup();
  const root = doc.querySelector('[data-agent-atlas]'), button = doc.querySelector('button');
  assert.equal(button.hidden, false);
  visibility(true);
  assert.equal(root.dataset.motion, 'running');
  button.click(); assert.equal(root.dataset.motion, 'paused');
  assert.equal(button.textContent, 'Resume motion');
  visibility(false); visibility(true);
  assert.equal(root.dataset.motion, 'paused');
  button.click(); assert.equal(root.dataset.motion, 'running');
  visibility(false); assert.equal(root.dataset.motion, 'paused');
  media.matches = true; media.dispatchEvent(new w.Event('change'));
  visibility(true);
  assert.equal(root.dataset.motion, 'paused');
  assert.equal(button.disabled, true);
  media.matches = false; media.dispatchEvent(new w.Event('change'));
  assert.equal(root.dataset.motion, 'running');
  dom.window.close();
});
