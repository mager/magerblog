import { createSearchIndex, type SearchEntry } from '../lib/search';

let pending: Promise<ReturnType<typeof createSearchIndex>> | undefined;
/** Share one on-demand request between the page list and the search dialog. */
export function loadSearchIndex() {
  if (!pending) pending = (async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch('/search-index.json', { signal: controller.signal });
      if (!response.ok) throw new Error('Search index unavailable');
      const entries: SearchEntry[] = await response.json();
      if (!Array.isArray(entries) || entries.some(entry => !['title', 'href', 'kind', 'description', 'text'].every(key => typeof entry[key as keyof SearchEntry] === 'string'))) throw new Error('Invalid search index');
      return createSearchIndex(entries);
    } finally { clearTimeout(timeout); }
  })().catch(error => { pending = undefined; throw error; });
  return pending;
}
