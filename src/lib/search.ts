export interface SearchEntry {
  title: string;
  href: string;
  kind: string;
  description: string;
  text: string;
}

export const normalizeSearch = (text: string) => text.normalize('NFKD')
  .replace(/\p{M}/gu, '').toLocaleLowerCase('en-US').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();

export function createSearchIndex(entries: SearchEntry[]) {
  return entries.map(entry => ({
    entry,
    title: normalizeSearch(entry.title),
    description: normalizeSearch(entry.description),
    text: normalizeSearch(`${entry.title} ${entry.kind} ${entry.description} ${entry.text}`),
  }));
}

export function searchEntries(index: ReturnType<typeof createSearchIndex>, query: string): SearchEntry[] {
  const normalized = normalizeSearch(query);
  if (!normalized) return [];
  const words = normalized.split(/\s+/);
  return index.filter(item => words.every(word => item.text.includes(word)))
    .map(item => ({
      entry: item.entry,
      score: (item.title === normalized ? 100 : item.title.includes(normalized) ? 50 : 0)
        + words.filter(word => item.title.includes(word)).length * 10
        + words.filter(word => item.description.includes(word)).length * 3,
    }))
    .sort((a, b) => b.score - a.score)
    .map(item => item.entry);
}
