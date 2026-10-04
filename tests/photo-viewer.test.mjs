import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import { JSDOM } from 'jsdom';

const source = stripTypeScriptTypes(readFileSync(new URL('../src/scripts/photo-viewer.ts', import.meta.url), 'utf8'));
function setup() {
  const dom = new JSDOM(`<body style="position:relative"><article class="cooking-content"><img src="/preview.jpg" data-full-src="/original.jpg" alt="Tomatoes in four stages"><a href="/other"><img src="/linked.jpg" alt="Existing link"></a></article><recipe-photo-viewer><dialog id="photo-dialog"><button class="photo-viewer-close">Close photo</button><img class="photo-viewer-image" hidden><figcaption class="photo-viewer-caption"></figcaption><p class="photo-viewer-status" hidden></p><a class="photo-viewer-original" hidden>Original</a></dialog></recipe-photo-viewer></body>`, { url: 'https://mager.co/recipe/', runScripts: 'outside-only' });
  const w = dom.window;
  let opens = 0;
  let restored;
  // JSDOM has no top layer: native focus trapping and Escape are browser-tested.
  w.HTMLDialogElement.prototype.showModal = function () { opens++; this.open = true; };
  w.HTMLDialogElement.prototype.close = function () { this.open = false; this.dispatchEvent(new w.Event('close')); };
  w.scrollTo = position => { restored = position; };
  Object.defineProperty(w, 'scrollY', { value: 780 });
  w.eval(source);
  const d = w.document;
  return { dom, w, d, viewer: d.querySelector('recipe-photo-viewer'), dialog: d.querySelector('dialog'), image: d.querySelector('.photo-viewer-image'), trigger: () => d.querySelector('.photo-trigger'), opens: () => opens, restored: () => restored };
}

test('photo viewer opens the original asset, locks scrolling and restores focus and styles', () => {
  const { dom, w, d, dialog, image, trigger, restored } = setup();
  trigger().click();
  assert(dialog.open);
  assert.equal(image.src, 'https://mager.co/original.jpg');
  assert.equal(image.alt, 'Tomatoes in four stages');
  assert.equal(d.body.style.position, 'fixed');
  assert.equal(d.body.style.top, '-780px');
  assert.equal(d.documentElement.style.overflow, 'hidden');
  assert.equal(d.activeElement, d.querySelector('.photo-viewer-close'));
  image.dispatchEvent(new w.Event('load'));
  assert.equal(image.hidden, false);
  assert.equal(d.querySelector('.photo-viewer-status').hidden, true);
  d.querySelector('.photo-viewer-close').click();
  assert.equal(dialog.open, false);
  assert.equal(d.body.style.position, 'relative');
  assert.equal(d.documentElement.style.overflow, '');
  assert.equal(restored().top, 780);
  assert.equal(d.activeElement, trigger());
  assert.equal(image.hasAttribute('src'), false);
  dom.window.close();
});

test('outside taps dismiss the viewer; image clicks and drags onto the backdrop do not', () => {
  const { dom, w, dialog, image, trigger } = setup();
  trigger().click();
  image.dispatchEvent(new w.PointerEvent('pointerdown', { bubbles: true }));
  image.click();
  assert(dialog.open);
  image.dispatchEvent(new w.PointerEvent('pointerdown', { bubbles: true }));
  dialog.click();
  assert(dialog.open);
  dialog.dispatchEvent(new w.PointerEvent('pointerdown', { bubbles: true }));
  dialog.click();
  assert.equal(dialog.open, false);
  dom.window.close();
});

test('failed images offer the original link and leave the close control usable', () => {
  const { dom, w, d, image, trigger, dialog } = setup();
  trigger().click();
  image.dispatchEvent(new w.Event('error'));
  assert(image.hidden);
  assert.equal(d.querySelector('.photo-viewer-status').textContent, 'This photo couldn’t load.');
  assert.equal(d.querySelector('.photo-viewer-original').hidden, false);
  assert.equal(d.querySelector('.photo-viewer-original').href, 'https://mager.co/original.jpg');
  dialog.close();
  trigger().click();
  assert.equal(d.querySelector('.photo-viewer-original').hidden, true);
  dom.window.close();
});

test('Astro swaps and reconnects release the lock without duplicate triggers or listeners', () => {
  const { dom, w, d, viewer, trigger, opens } = setup();
  viewer.connectedCallback();
  assert.equal(d.querySelectorAll('.photo-trigger').length, 1);
  assert.equal(d.querySelector('a[href="/other"]').textContent, '');
  trigger().click();
  assert.equal(opens(), 1);
  d.dispatchEvent(new w.Event('astro:before-swap'));
  assert.equal(d.body.style.position, 'relative');
  assert.equal(d.querySelectorAll('.photo-trigger').length, 0);
  viewer.remove();
  d.body.append(viewer);
  assert.equal(d.querySelectorAll('.photo-trigger').length, 1);
  trigger().click();
  assert.equal(opens(), 2);
  viewer.remove();
  assert.equal(d.body.style.position, 'relative');
  assert.equal(d.documentElement.style.overflow, '');
  dom.window.close();
});
