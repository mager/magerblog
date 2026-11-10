import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import { JSDOM } from 'jsdom';
const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const source = path => stripTypeScriptTypes(read(path)).replace(/^import .*;\n/gm, '').replaceAll('export ', '');
const data = JSON.parse(read('dist/search-index.json'));
function setup(query = '') {
  const dom = new JSDOM(read('dist/cooking/index.html'), { url: `https://mager.co/cooking/${query}`, runScripts: 'outside-only' });
  dom.window.fetch = async () => ({ ok: true, json: async () => data });
  return dom;
}
const enhance = w => w.eval(['src/lib/search.ts','src/scripts/search-data.ts','src/scripts/search-dom.ts','src/scripts/simple-home.ts'].map(source).join('\n'));
const visible = doc => [...doc.querySelectorAll('[data-simple-row]:not([hidden]), [data-simple-feature]:not([hidden])')];
const tick = () => new Promise(resolve => setTimeout(resolve, 0));
test('Chicken includes soups, casseroles, curries and roasts; the feature appears once', () => {
  const dom = setup(), doc = dom.window.document;
  enhance(dom.window);
  doc.querySelector('[data-simple-filter="chicken"]').click();
  const hrefs = visible(doc).map(el => el.dataset.href);
  for (const slug of ['2024-03-10-chicken-lemon-rice-soup','2026-02-16-greek-chicken-casserole','2026-10-22-chicken-tikka-masala','2025-10-27-spatchcocked-chicken']) assert(hrefs.includes(`/blog/${slug}/`), slug);
  assert.equal(new Set(hrefs).size, hrefs.length);
  assert.match(dom.window.location.search, /type=chicken/);
  dom.window.close();
});
test('each filter returns only its members, counts the lead, and shows the newest member first', () => {
  const dom = setup(), doc = dom.window.document;
  enhance(dom.window);
  for (const button of doc.querySelectorAll('[data-simple-filter]')) {
    button.click();
    const type = button.dataset.simpleFilter;
    const rows = [...doc.querySelectorAll('[data-simple-row]')].filter(row => type === 'all' || row.dataset.recipeCategories.split(' ').includes(type));
    const shown = visible(doc);
    assert(shown.length, type);
    assert.equal(doc.querySelector('[data-simple-feature]:not([hidden])').dataset.href, rows[0].dataset.href);
    assert(shown.every(item => rows.some(row => row.dataset.href === item.dataset.href)), type);
    assert.equal(parseInt(doc.querySelector('[data-simple-count]').textContent), rows.length, type);
    assert.equal(button.getAttribute('aria-pressed'), 'true');
  }
  dom.window.close();
});
test('filter URLs restore, search stays within the category, and clearing restores the lead', async () => {
  const dom = setup('?type=pasta&q=orzo'), w = dom.window, doc = w.document;
  enhance(w); await tick();
  assert.equal(doc.querySelector('[data-simple-feature]:not([hidden])'), null);
  assert(visible(doc).some(item => /Greek Chicken Casserole/.test(item.textContent)));
  assert(visible(doc).every(item => item.dataset.recipeCategories.split(' ').includes('pasta')));
  doc.querySelector('[data-simple-clear]').click();
  assert(doc.querySelector('[data-simple-feature]:not([hidden])'));
  assert.equal(w.location.search, '?type=pasta');
  w.history.pushState(null, '', '?type=baking'); w.dispatchEvent(new w.PopStateEvent('popstate'));
  assert(visible(doc).some(item => /Chocolate Chip Cookies/.test(item.textContent)));
  w.close();
});
test('static cooking archive has all published recipes and excludes drafts', () => {
  const dom = setup(), doc = dom.window.document;
  const expected = data.filter(entry => entry.kind === 'Cooking' && entry.href.startsWith('/blog/'));
  const shown = visible(doc).map(item => item.dataset.href);
  assert.equal(shown.length, expected.length);
  assert.equal(new Set(shown).size, shown.length);
  assert(expected.every(entry => shown.includes(entry.href)));
  assert(!doc.querySelector('a[href*="beef-barley-soup"]'));
  dom.window.close();
});

test('category worlds follow filters, saved URLs, and reset to the magazine', async () => {
  const dom = setup('?type=soup'), w = dom.window, doc = w.document;
  enhance(w);
  const collection = doc.querySelector('[data-simple-list]');
  assert.equal(collection.dataset.cookingWorld, 'soup');
  assert.match(doc.querySelector('[data-cooking-description]').textContent, /broth/i);
  const query = doc.querySelector('#simple-query');
  query.value = 'chicken'; query.dispatchEvent(new w.Event('input')); await tick();
  assert.equal(collection.dataset.cookingWorld, 'soup');
  doc.querySelector('[data-simple-filter="baking"]').click();
  assert.equal(collection.dataset.cookingWorld, 'baking');
  doc.querySelector('[data-simple-clear]').click();
  doc.querySelector('[data-simple-filter="all"]').click();
  assert.equal(collection.dataset.cookingWorld, 'all');
  assert.equal(doc.querySelector('[data-cooking-description]').hidden, true);
  w.close();
});

test('kitchen lamp has no visible theme text and still changes and saves the theme', () => {
  const dom = setup(), w = dom.window, doc = w.document;
  const button = doc.querySelector('[data-theme-toggle]');
  assert(button.querySelector('.kitchen-lamp'));
  assert(!/light|dark/i.test(button.textContent));
  const script = read('src/components/ThemeToggle.astro').split('<script>')[1].split('</script>')[0];
  w.eval(stripTypeScriptTypes(script));
  button.click();
  assert.equal(doc.documentElement.dataset.theme, 'dark');
  assert.equal(w.localStorage.getItem('mager-theme'), 'dark');
  assert.equal(button.getAttribute('aria-label'), 'Turn kitchen light on');
  button.click();
  assert.equal(doc.documentElement.dataset.theme, 'light');
  assert.equal(button.getAttribute('aria-label'), 'Turn kitchen light off');
  w.close();
});

test('cooking features the recently updated cottage pie and labels its update date', () => {
  const dom = setup(), doc = dom.window.document;
  const lead = doc.querySelector('[data-simple-feature]:not([hidden])');
  assert.equal(lead.dataset.href, '/blog/2025-12-06-cottage-pie/');
  assert.match(lead.querySelector('time').textContent, /Updated Nov 8, 2026/);
  enhance(dom.window);
  doc.querySelector('[data-simple-filter="turkey"]').click();
  assert.equal(doc.querySelector('[data-simple-feature]:not([hidden])').dataset.href, '/blog/2025-12-06-cottage-pie/');
  dom.window.close();
});
