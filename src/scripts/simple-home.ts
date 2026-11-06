import { searchEntries, searchExcerpt } from '../lib/search';
import { loadSearchIndex } from './search-data';
import { setSearchText } from './search-dom';

const simpleHome = document.querySelector<HTMLElement>('[data-simple-list]');
if (simpleHome) {
  const rows = [...simpleHome.querySelectorAll<HTMLElement>('[data-simple-row]')];
  const byHref = new Map(rows.map(row => [row.dataset.href, row]));
  const list = simpleHome.querySelector<HTMLElement>('#simple-list')!;
  const filters = [...simpleHome.querySelectorAll<HTMLButtonElement>('[data-simple-filter]')];
  const query = simpleHome.querySelector<HTMLInputElement>('#simple-query')!;
  const clear = simpleHome.querySelector<HTMLButtonElement>('[data-simple-clear]')!;
  const more = simpleHome.querySelector<HTMLButtonElement>('[data-simple-more]')!;
  const count = simpleHome.querySelector<HTMLElement>('[data-simple-count]')!;
  const status = simpleHome.querySelector<HTMLElement>('[data-simple-status]')!;
  const retry = simpleHome.querySelector<HTMLButtonElement>('[data-simple-retry]')!;
  const heading = simpleHome.querySelector<HTMLElement>('#simple-posts-heading')!;
  const empty = simpleHome.querySelector<HTMLElement>('[data-simple-empty]')!;
  const feature = simpleHome.querySelector<HTMLElement>('[data-simple-feature]');
  const titles = new Map(rows.map(row => [row, row.querySelector('.simple-post-title')!.textContent || '']));
  let index: Awaited<ReturnType<typeof loadSearchIndex>> | undefined;
  let loading = false;
  let failed = false;
  let category = 'all';
  let limit = 24;
  function update() {
    const term = query.value.trim();
    const matches = term && index ? searchEntries(index, term) : [];
    const matchingEntries = new Map(matches.map(entry => [entry.href, entry]));
    const candidateRows = term ? matches.flatMap(entry => byHref.has(entry.href) ? [byHref.get(entry.href)!] : []) : rows;
    const filtered = candidateRows.filter(row => category === 'all' || row.dataset[simpleHome!.dataset.filterBy === 'subcategory' ? 'subcategory' : 'category'] === category);
    const showFeature = !!feature && !term && category === 'all';
    if (feature) feature.hidden = !showFeature;
    const results = filtered.filter(row => !showFeature || !row.hasAttribute('data-featured'));
    const visible = new Set(results.slice(0, limit));
    rows.forEach(row => {
      row.hidden = !visible.has(row);
      const snippet = row.querySelector<HTMLElement>('.simple-search-snippet')!;
      const entry = matchingEntries.get(row.dataset.href!);
      snippet.hidden = !term || !entry;
      if (!row.hidden) {
        // Keep the external-link icon while changing only title text.
        const title = row.querySelector<HTMLElement>('.simple-post-title')!;
        const icon = title.querySelector('svg');
        setSearchText(title, entry?.title || titles.get(row)!, term);
        if (icon) title.append(icon);
        if (entry && term) setSearchText(snippet, searchExcerpt(entry, term), term);
      }
    });
    // DOM order follows ranking, so keyboard and screen-reader order do too.
    (term && index ? candidateRows : rows).forEach(row => list.append(row));
    count.textContent = `${results.length} ${results.length === 1 ? 'post' : 'posts'}`;
    heading.textContent = term ? 'Search results' : category === 'all' ? heading.dataset.defaultHeading! : filters.find(button => button.dataset.simpleFilter === category)!.textContent;
    empty.hidden = filtered.length > 0 || loading || failed;
    more.hidden = results.length <= limit;
    clear.hidden = query.value.length === 0;
    retry.hidden = !failed;
    status.textContent = failed ? 'Search could not load. Check your connection and try again.' : loading ? 'Loading full-text search…' : term && index ? `${filtered.length} ${filtered.length === 1 ? 'result' : 'results'} for “${term}”` : '';
    filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.simpleFilter === category)));
  }
  async function load() {
    if (index || loading) return;
    loading = true; failed = false; update();
    try { index = await loadSearchIndex(); } catch { failed = true; }
    finally { loading = false; update(); }
  }
  function syncUrl() {
    const url = new URL(window.location.href);
    if (query.value.trim()) url.searchParams.set('q', query.value.trim()); else url.searchParams.delete('q');
    if (category !== 'all') url.searchParams.set('type', category); else url.searchParams.delete('type');
    window.history.replaceState(null, '', url);
  }
  function restoreUrl() {
    const params = new URLSearchParams(window.location.search);
    query.value = (params.get('q') || '').slice(0, 200);
    category = filters.some(button => button.dataset.simpleFilter === params.get('type')) ? params.get('type')! : 'all';
    limit = 24; update();
    if (query.value) void load();
  }
  window.addEventListener('popstate', restoreUrl);
  filters.forEach(button => button.addEventListener('click', () => { category = button.dataset.simpleFilter || 'all'; limit = 24; update(); syncUrl(); }));
  query.addEventListener('keydown', event => {
    if (event.key === 'Escape' && query.value) { query.value = ''; limit = 24; update(); syncUrl(); }
    if (event.key === 'ArrowDown') { event.preventDefault(); list.querySelector<HTMLAnchorElement>('[data-simple-row]:not([hidden]) a')?.focus(); }
  });
  query.addEventListener('focus', () => { void load(); });
  query.addEventListener('input', () => { limit = 24; update(); syncUrl(); void load(); });
  retry.addEventListener('click', () => { void load(); });
  clear.addEventListener('click', () => { query.value = ''; limit = 24; update(); syncUrl(); query.focus(); });
  more.addEventListener('click', () => {
    const previous = new Set(rows.filter(row => !row.hidden));
    limit += 24; update();
    [...list.querySelectorAll<HTMLElement>('[data-simple-row]')].find(row => !row.hidden && !previous.has(row))?.querySelector<HTMLAnchorElement>('a')?.focus();
  });
  simpleHome.querySelector<HTMLElement>('.simple-controls')!.hidden = false;
  document.querySelectorAll<HTMLImageElement>('.simple-home img').forEach(img => {
    const recover = () => { img.hidden = true; };
    if (img.complete && !img.naturalWidth) recover();
    else img.addEventListener('error', recover, { once: true });
  });
  restoreUrl();
}
