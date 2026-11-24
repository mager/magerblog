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
  const features = [...simpleHome.querySelectorAll<HTMLElement>('[data-simple-feature]')];
  const tags = simpleHome.querySelector<HTMLSelectElement>('[data-simple-tag]');
  const clearTag = simpleHome.querySelector<HTMLButtonElement>('[data-simple-clear-tag]');
  const tagShortcuts = [...simpleHome.querySelectorAll<HTMLButtonElement>('[data-recipe-tag]')];
  const reset = simpleHome.querySelector<HTMLButtonElement>('[data-simple-reset]');
  const titles = new Map(rows.map(row => [row, row.querySelector('.simple-post-title')!.textContent || '']));
  let index: Awaited<ReturnType<typeof loadSearchIndex>> | undefined;
  let loading = false;
  let failed = false;
  let category = 'all';
  let tag = 'all';
  let limit = 24;
  let ranked = false;
  function update() {
    const term = query.value.trim();
    const matches = term && index ? searchEntries(index, term) : [];
    const matchingEntries = new Map(matches.map(entry => [entry.href, entry]));
    const candidateRows = term ? matches.flatMap(entry => byHref.has(entry.href) ? [byHref.get(entry.href)!] : []) : rows;
    const filtered = candidateRows.filter(row => category === 'all' || (simpleHome!.dataset.filterBy === 'recipe'
      ? (row.dataset.recipeCategories || '').split(' ').includes(category)
      : row.dataset[simpleHome!.dataset.filterBy === 'subcategory' ? 'subcategory' : 'category'] === category))
      .filter(row => tag === 'all' || (row.dataset.recipeTags || '').split(' ').includes(tag));
    const feature = !term && tag === 'all' && filtered.length ? features.find(item => item.dataset.href === filtered[0].dataset.href) : undefined;
    features.forEach(item => { item.hidden = item !== feature; });
    const results = filtered.filter(row => row.dataset.href !== feature?.dataset.href);
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
    if (term && index) {
      candidateRows.forEach(row => list.append(row));
      ranked = true;
    } else if (ranked) {
      rows.forEach(row => list.append(row));
      ranked = false;
    }
    const noun = simpleHome!.dataset.itemName || 'post';
    const kitchen = noun === 'recipe';
    const total = kitchen ? filtered.length : results.length;
    count.textContent = `${total} ${noun}${total === 1 ? '' : 's'}`;
    const selected = filters.find(button => button.dataset.simpleFilter === category);
    if (kitchen) {
      simpleHome!.dataset.kitchenWorld = category;
      const facetRows = term && index ? candidateRows : rows;
      const taggedRows = facetRows.filter(row => tag === 'all' || (row.dataset.recipeTags || '').split(' ').includes(tag));
      filters.forEach(button => {
        const filter = button.dataset.simpleFilter;
        const total = taggedRows.filter(row => filter === 'all' || (row.dataset.recipeCategories || '').split(' ').includes(filter!)).length;
        const label = button.querySelector('[data-filter-count]');
        if (label) label.textContent = String(total);
        button.disabled = total === 0 && filter !== 'all' && filter !== category;
      });
      const availableTags = new Map<string, number>();
      facetRows.filter(row => category === 'all' || (row.dataset.recipeCategories || '').split(' ').includes(category)).forEach(row => {
        (row.dataset.recipeTags || '').split(' ').filter(Boolean).forEach(value => availableTags.set(value, (availableTags.get(value) || 0) + 1));
      });
      if (tags) [...tags.options].forEach(option => {
        if (option.value === 'all') return;
        const total = availableTags.get(option.value) || 0;
        option.textContent = `${option.dataset.tagLabel} (${total})`;
        option.disabled = total === 0;
      });
      tagShortcuts.forEach(button => { button.disabled = !availableTags.has(button.dataset.recipeTag!) && button.dataset.recipeTag !== tag; });
      const description = simpleHome!.querySelector<HTMLElement>('[data-kitchen-description]');
      if (description) {
        description.textContent = selected?.dataset.filterDescription || '';
        description.hidden = !description.textContent || !!term || tag !== 'all' || filtered.length === 0;
      }
    }
    const filterLabel = selected?.dataset.filterLabel || selected?.textContent || '';
    const tagLabel = tags?.selectedOptions[0]?.dataset.tagLabel || '';
    heading.textContent = kitchen && !filtered.length && !loading && !failed ? 'No matching recipes' : term ? 'Search results' : tag !== 'all'
      ? `${tagLabel.charAt(0).toUpperCase()}${tagLabel.slice(1)}${category === 'all' ? ' recipes' : ` · ${filterLabel}`}` : kitchen
      ? category === 'all' ? heading.dataset.defaultHeading! : filterLabel
      : feature && noun === 'post' ? 'More posts' : category === 'all' ? heading.dataset.defaultHeading! : filterLabel;
    empty.hidden = filtered.length > 0 || loading || failed;
    more.hidden = results.length <= limit;
    clear.hidden = query.value.length === 0;
    retry.hidden = !failed;
    status.textContent = failed ? 'Search could not load. Check your connection and try again.' : loading ? 'Loading full-text search…' : term && index ? `${filtered.length} ${filtered.length === 1 ? 'result' : 'results'} for “${term}”` : '';
    filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.simpleFilter === category)));
    tagShortcuts.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.recipeTag === tag)));
    if (reset) reset.hidden = !term && category === 'all' && tag === 'all';
    if (clearTag) clearTag.hidden = tag === 'all';
    if (simpleHome!.hasAttribute('data-timeline')) {
      simpleHome!.toggleAttribute('data-searching', !!term);
      simpleHome!.dispatchEvent(new Event('timeline:results'));
    }
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
    if (tags) {
      if (tag !== 'all') url.searchParams.set('tag', tag); else url.searchParams.delete('tag');
    }
    window.history.replaceState(null, '', url);
  }
  function restoreUrl() {
    const params = new URLSearchParams(window.location.search);
    query.value = (params.get('q') || '').slice(0, 200);
    category = filters.some(button => button.dataset.simpleFilter === params.get('type')) ? params.get('type')! : 'all';
    tag = tags && [...tags.options].some(option => option.value === params.get('tag')) ? params.get('tag')! : 'all';
    if (tags) tags.value = tag;
    limit = 24; update();
    if (query.value) void load();
  }
  window.addEventListener('popstate', restoreUrl);
  filters.forEach(button => button.addEventListener('click', () => { category = button.dataset.simpleFilter || 'all'; limit = 24; update(); syncUrl(); }));
  tags?.addEventListener('change', () => { tag = tags.value; limit = 24; update(); syncUrl(); });
  clearTag?.addEventListener('click', () => {
    tag = 'all';
    if (tags) tags.value = tag;
    limit = 24; update(); syncUrl(); tags?.focus();
  });
  tagShortcuts.forEach(button => button.addEventListener('click', () => {
    tag = tag === button.dataset.recipeTag ? 'all' : button.dataset.recipeTag!;
    if (tags) tags.value = tag;
    limit = 24; update(); syncUrl();
  }));
  reset?.addEventListener('click', () => {
    query.value = ''; category = 'all'; tag = 'all';
    if (tags) tags.value = tag;
    limit = 24; update(); syncUrl(); query.focus();
  });
  query.addEventListener('keydown', event => {
    if (event.key === 'Escape' && query.value) { query.value = ''; limit = 24; update(); syncUrl(); }
    if (event.key === 'ArrowDown') { event.preventDefault(); list.querySelector<HTMLAnchorElement>('[data-simple-row]:not([hidden]) a:not([tabindex="-1"])')?.focus(); }
  });
  query.addEventListener('focus', () => { void load(); });
  query.addEventListener('input', () => { limit = 24; update(); syncUrl(); void load(); });
  retry.addEventListener('click', () => { void load(); });
  clear.addEventListener('click', () => { query.value = ''; limit = 24; update(); syncUrl(); query.focus(); });
  more.addEventListener('click', () => {
    const previous = new Set(rows.filter(row => !row.hidden));
    limit += 24; update();
    [...list.querySelectorAll<HTMLElement>('[data-simple-row]')].find(row => !row.hidden && !previous.has(row))?.querySelector<HTMLAnchorElement>('a:not([tabindex="-1"])')?.focus();
  });
  // Readers can scroll through the whole timeline. Keep the button for keyboards
  // and browsers without IntersectionObserver. Auto-loading must leave focus alone.
  if (simpleHome.hasAttribute('data-timeline') && 'IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !more.hidden && !query.value.trim()) {
        limit += 24;
        update();
      }
    }, { rootMargin: '0px 0px 480px' }).observe(more);
  }
  simpleHome.querySelector<HTMLElement>('.simple-controls')!.hidden = false;
  document.querySelectorAll<HTMLImageElement>('.simple-home img, .kitchen-shell img').forEach(img => {
    const recover = () => {
      img.hidden = true;
      const card = img.closest('.kitchen-card');
      const feature = img.closest('.kitchen-feature');
      if (card || feature) {
        img.parentElement!.hidden = true;
        card?.classList.add('kitchen-card-text');
        feature?.classList.add('kitchen-feature-text');
      }
    };
    if (img.complete && !img.naturalWidth) recover();
    else img.addEventListener('error', recover, { once: true });
  });
  restoreUrl();
}
