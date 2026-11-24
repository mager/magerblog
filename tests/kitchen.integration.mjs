import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import { JSDOM } from 'jsdom';
import { runInNewContext } from 'node:vm';
const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const source = path => stripTypeScriptTypes(read(path)).replace(/^import .*;\n/gm, '').replaceAll('export ', '');
const data = JSON.parse(read('dist/search-index.json'));
function setup(query = '') {
  const dom = new JSDOM(read('dist/kitchen/index.html'), { url: `https://mager.co/kitchen/${query}`, runScripts: 'outside-only' });
  dom.window.fetch = async () => ({ ok: true, json: async () => data });
  return dom;
}
const enhance = w => w.eval(['src/lib/search.ts','src/scripts/search-data.ts','src/scripts/search-dom.ts','src/scripts/simple-home.ts'].map(source).join('\n'));
const visible = doc => [...doc.querySelectorAll('[data-simple-row]:not([hidden]), [data-simple-feature]:not([hidden])')];
const tick = () => new Promise(resolve => setTimeout(resolve, 0));
test('an empty bookmarked combination reports zero honestly and clearing its tag restores recipes', () => {
  const dom = setup('?type=beef&tag=enchiladas'), window = dom.window, doc = window.document;
  enhance(window);
  assert.equal(visible(doc).length, 0);
  assert.equal(doc.querySelector('[data-simple-count]').textContent, '0 recipes');
  assert.match(doc.querySelector('option[value="enchiladas"]').textContent, /\(0\)/);
  assert.equal(doc.querySelector('[data-kitchen-description]').hidden, true);
  assert.match(doc.querySelector('#simple-posts-heading').textContent, /no matching recipes/i);
  const clearTag = doc.querySelector('[data-simple-clear-tag]');
  assert(clearTag && !clearTag.hidden);
  clearTag.click();
  assert.equal(window.location.search, '?type=beef');
  assert(visible(doc).length > 0);
  assert.equal(doc.querySelector('[data-simple-tag]').value, 'all');
  assert.equal(doc.activeElement, doc.querySelector('[data-simple-tag]'));
  window.close();
});

test('category and tag counts prevent combinations without any matching recipes', () => {
  const dom = setup('?type=beef'), window = dom.window, doc = window.document;
  enhance(window);
  const enchiladas = doc.querySelector('option[value="enchiladas"]');
  assert.equal(enchiladas.disabled, true);
  assert.match(enchiladas.textContent, /\(0\)/);
  assert.equal(doc.querySelector('option[value="pot-roast"]').disabled, false);
  window.history.pushState(null, '', '?tag=enchiladas');
  window.dispatchEvent(new window.PopStateEvent('popstate'));
  assert.equal(visible(doc).length, 1);
  const beef = doc.querySelector('[data-simple-filter="beef"]');
  assert.equal(beef.disabled, true);
  assert.equal(beef.querySelector('[data-filter-count]').textContent, '0');
  assert.equal(doc.querySelector('[data-simple-filter="chicken"]').querySelector('[data-filter-count]').textContent, '1');
  beef.click();
  assert.equal(window.location.search, '?tag=enchiladas');
  window.close();
});

test('tag availability follows full-text search and recovers when it is cleared', async () => {
  const dom = setup('?type=pasta&q=orzo'), window = dom.window, doc = window.document;
  enhance(window); await tick();
  assert.equal(doc.querySelector('option[value="enchiladas"]').disabled, true);
  assert.equal(doc.querySelector('[data-simple-filter="beef"]').disabled, true);
  const weeknight = doc.querySelector('option[value="weeknight"]');
  assert.equal(weeknight.disabled, false);
  assert(!/\(0\)/.test(weeknight.textContent));
  doc.querySelector('[data-simple-clear]').click();
  assert.equal(doc.querySelector('[data-simple-filter="beef"]').disabled, false);
  window.close();
});

test('legacy recipe URLs point to Kitchen and retain search, category, tag and fragment', () => {
  for (const path of ['cooking', 'recipes']) {
    const dom = new JSDOM(read(`dist/${path}/index.html`));
    const doc = dom.window.document;
    let destination;
    runInNewContext(doc.querySelector('script').textContent, { window: { location: {
      search: '?type=pasta&tag=one-pot&q=orzo', hash: '#kitchen-results',
      replace: url => { destination = url; },
    } } });
    assert.equal(destination, '/kitchen/?type=pasta&tag=one-pot&q=orzo#kitchen-results');
    assert.equal(doc.querySelector('link[rel="canonical"]').href, 'https://mager.co/kitchen/');
    assert.match(doc.querySelector('meta[name="robots"]').content, /noindex/);
    assert.equal(doc.querySelector('a').getAttribute('href'), '/kitchen/');
    dom.window.close();
  }
  const sitemap = read('dist/sitemap-0.xml');
  assert(sitemap.includes('https://mager.co/kitchen/'));
  assert(!sitemap.includes('https://mager.co/cooking/'));
  assert(!sitemap.includes('https://mager.co/recipes/'));
});

test('Kitchen metadata and recipe category links use the new destination', () => {
  const dom = setup(), doc = dom.window.document;
  assert.equal(doc.querySelector('h1').textContent, 'Kitchen');
  assert.equal(doc.querySelector('link[rel="canonical"]').href, 'https://mager.co/kitchen/');
  assert.equal(doc.querySelector('.header-sections a[href="/kitchen/"]').textContent, 'Kitchen');
  const schema = JSON.parse(doc.querySelector('script[type="application/ld+json"]').textContent);
  assert.equal(schema.url, 'https://mager.co/kitchen/');
  const recipe = new JSDOM(read('dist/blog/2024-03-10-chicken-lemon-rice-soup/index.html'));
  assert(recipe.window.document.querySelector('.recipe-category-tags a[href="/kitchen/?type=soup"]'));
  assert(recipe.window.document.querySelector('.recipe-back[href="/kitchen/"]'));
  recipe.window.close(); dom.window.close();
});

test('the wordmark leads home and Writing is absent from the primary navigation', () => {
  const dom = setup(), doc = dom.window.document;
  assert.equal(doc.querySelector('.wordmark').getAttribute('href'), '/');
  assert.equal(doc.querySelector('.header-sections a[href="/blog/"]'), null);
  dom.window.close();
});

test('the intro keeps its words separated and states only the published recipe count', () => {
  const dom = setup(), doc = dom.window.document;
  assert.equal(doc.querySelector('.kitchen-intro p').textContent, 'What I’m cooking.');
  assert.equal(doc.querySelector('.kitchen-intro em').textContent, 'cooking.');
  assert.equal(doc.querySelector('.kitchen-intro > span').textContent, `${doc.querySelectorAll('[data-simple-row]').length} recipes from my home kitchen.`);
  dom.window.close();
});

test('forest-green dark surfaces apply only to Kitchen and recipe pages', () => {
  const dom = new JSDOM('<!doctype html><html><head></head><body class="publication"></body></html>');
  const window = dom.window, doc = window.document;
  const style = doc.createElement('style');
  style.textContent = read('src/styles/publication.css');
  doc.head.append(style);
  doc.documentElement.dataset.theme = 'dark';
  for (const page of ['kitchen-page', 'recipe-page']) {
    doc.body.className = `publication ${page}`;
    assert.equal(window.getComputedStyle(doc.body).getPropertyValue('--news-paper'), '#091b14');
    assert.equal(window.getComputedStyle(doc.body).getPropertyValue('--news-surface'), '#13291f');
  }
  doc.body.className = 'publication';
  assert.equal(window.getComputedStyle(doc.body).getPropertyValue('--news-paper'), '#000');
  doc.body.className = 'publication kitchen-page';
  doc.documentElement.dataset.theme = 'light';
  assert.notEqual(window.getComputedStyle(doc.body).getPropertyValue('--news-paper'), '#091b14');
  window.close();
});

test('the recipe search accessible name contains its visible label', () => {
  const dom = setup(), doc = dom.window.document;
  const label = doc.querySelector('label[for="simple-query"]').textContent;
  const input = doc.querySelector('#simple-query');
  assert((input.getAttribute('aria-label') || label).includes(label));
  dom.window.close();
});

test('failed search can retry without losing the selected category or tag', async () => {
  const dom = setup('?type=pasta&tag=weeknight&q=orzo'), window = dom.window, doc = window.document;
  window.fetch = async () => { throw new Error('offline'); };
  enhance(window); await tick();
  assert.equal(doc.querySelector('[data-simple-retry]').hidden, false);
  assert.equal(doc.querySelector('[data-simple-empty]').hidden, true);
  window.fetch = async () => ({ ok: true, json: async () => data });
  doc.querySelector('[data-simple-retry]').click(); await tick();
  assert.equal(doc.querySelector('[data-simple-retry]').hidden, true);
  assert(visible(doc).some(item => /One-Pan Orzo/.test(item.textContent)));
  assert.equal(doc.querySelector('[data-simple-tag]').value, 'weeknight');
  assert.equal(doc.querySelector('[data-simple-filter="pasta"]').getAttribute('aria-pressed'), 'true');
  window.close();
});

test('authored tags intersect with recipe categories and survive search and URL restoration', async () => {
  const dom = setup('?type=pasta&tag=weeknight&q=orzo'), window = dom.window, doc = window.document;
  const tags = doc.querySelector('[data-simple-tag]');
  assert(tags, 'Kitchen needs a tag selector');
  enhance(window); await tick();
  assert.equal(tags.value, 'weeknight');
  assert(visible(doc).some(item => /One-Pan Orzo/.test(item.textContent)));
  assert(visible(doc).every(item => item.dataset.recipeTags.split(' ').includes('weeknight')));
  assert(visible(doc).every(item => item.dataset.recipeCategories.split(' ').includes('pasta')));
  doc.querySelector('[data-simple-clear]').click();
  assert.equal(doc.querySelector('[data-simple-feature]:not([hidden])'), null);
  assert.equal(new URLSearchParams(window.location.search).get('tag'), 'weeknight');
  doc.querySelector('[data-simple-reset]').click();
  assert.equal(window.location.search, '');
  assert.equal(tags.value, 'all');
  assert(doc.querySelector('[data-simple-feature]:not([hidden])'));
  window.close();
});

test('tag shortcuts toggle exact tags and empty combinations can be reset', async () => {
  const dom = setup(), window = dom.window, doc = window.document;
  assert(doc.querySelector('[data-simple-tag]'), 'Kitchen needs a tag selector');
  enhance(window);
  const shortcut = doc.querySelector('[data-recipe-tag="weeknight"]');
  assert(shortcut, 'Weeknight should be a browsing shortcut');
  shortcut.click();
  assert.equal(shortcut.getAttribute('aria-pressed'), 'true');
  assert(visible(doc).length > 0);
  assert(visible(doc).every(item => item.dataset.recipeTags.split(' ').includes('weeknight')));
  shortcut.click();
  assert.equal(doc.querySelector('[data-simple-tag]').value, 'all');
  const tags = doc.querySelector('[data-simple-tag]');
  tags.value = 'chocolate'; tags.dispatchEvent(new window.Event('change'));
  assert.equal(doc.querySelector('[data-simple-filter="chicken"]').disabled, true);
  doc.querySelector('[data-simple-filter="chicken"]').click();
  assert(visible(doc).length > 0);
  window.history.pushState(null, '', '?tag=chocolate&type=chicken');
  window.dispatchEvent(new window.PopStateEvent('popstate'));
  assert.equal(visible(doc).length, 0);
  assert.equal(doc.querySelector('[data-simple-empty]').hidden, false);
  assert.equal(doc.querySelector('[data-simple-reset]').hidden, false);
  doc.querySelector('[data-simple-reset]').click();
  assert(visible(doc).length > 0);
  window.history.pushState(null, '', '?tag=unknown&type=pasta');
  window.dispatchEvent(new window.PopStateEvent('popstate'));
  assert.equal(tags.value, 'all');
  assert(visible(doc).every(item => item.dataset.recipeCategories?.split(' ').includes('pasta') || item.hasAttribute('data-simple-feature')));
  await tick();
  window.close();
});

test('tag-only results include every match and show more preserves the selected filter', () => {
  const dom = setup(), window = dom.window, doc = window.document;
  assert(doc.querySelector('[data-simple-tag]'), 'Kitchen needs a tag selector');
  enhance(window);
  assert.equal(visible(doc).length, 25);
  doc.querySelector('[data-simple-more]').click();
  const total = [...doc.querySelectorAll('[data-simple-row]')].length;
  assert.equal(visible(doc).length, total);
  assert.equal(new Set(visible(doc).map(item => item.dataset.href)).size, total);
  const tags = doc.querySelector('[data-simple-tag]');
  tags.value = 'one-pot'; tags.dispatchEvent(new window.Event('change'));
  const matches = [...doc.querySelectorAll('[data-simple-row]')].filter(item => item.dataset.recipeTags.split(' ').includes('one-pot'));
  assert.equal(visible(doc).length, matches.length);
  assert.equal(parseInt(doc.querySelector('[data-simple-count]').textContent), matches.length);
  assert.equal(new URLSearchParams(window.location.search).get('tag'), 'one-pot');
  window.close();
});

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
test('static Kitchen archive has all published recipes and excludes drafts', () => {
  const dom = setup(), doc = dom.window.document;
  const expected = data.filter(entry => entry.kind === 'Kitchen' && entry.href.startsWith('/blog/'));
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
  assert.equal(collection.dataset.kitchenWorld, 'soup');
  assert.match(doc.querySelector('[data-kitchen-description]').textContent, /broth/i);
  const query = doc.querySelector('#simple-query');
  query.value = 'chicken'; query.dispatchEvent(new w.Event('input')); await tick();
  assert.equal(collection.dataset.kitchenWorld, 'soup');
  doc.querySelector('[data-simple-clear]').click();
  doc.querySelector('[data-simple-filter="baking"]').click();
  assert.equal(collection.dataset.kitchenWorld, 'baking');
  doc.querySelector('[data-simple-clear]').click();
  doc.querySelector('[data-simple-filter="all"]').click();
  assert.equal(collection.dataset.kitchenWorld, 'all');
  assert.equal(doc.querySelector('[data-kitchen-description]').hidden, true);
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

test('Kitchen orders its feature and rows by their effective dates and labels updates', () => {
  const dom = setup(), doc = dom.window.document;
  const entries = visible(doc);
  const dates = entries.map(entry => Date.parse(entry.querySelector('time').dateTime));
  assert.deepEqual(dates, dates.toSorted((a, b) => b - a));
  const pie = entries.find(entry => entry.dataset.href === '/blog/2025-12-06-cottage-pie/');
  assert.match(pie.querySelector('time').textContent, /Updated Nov 8, 2026/);
  enhance(dom.window);
  doc.querySelector('[data-simple-filter="turkey"]').click();
  const turkey = visible(doc);
  assert(turkey.some(entry => entry.dataset.href === pie.dataset.href));
  const turkeyDates = turkey.map(entry => Date.parse(entry.querySelector('time').dateTime));
  assert.deepEqual(turkeyDates, turkeyDates.toSorted((a, b) => b - a));
  dom.window.close();
});
