export interface SearchEntry {
  title: string;
  href: string;
  kind: string;
  description: string;
  text: string;
}

export const normalizeSearch = (text: string) => text.normalize('NFKD')
  .replace(/\p{M}/gu, '').toLocaleLowerCase('en-US').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();

// One insertion, deletion, substitution, or adjacent transposition. Short words
// must match exactly so small typos do not flood results with unrelated posts.
export function nearSearchWord(word: string, token: string): boolean {
  if (word.length < 4 || Math.abs(word.length - token.length) > 1) return false;
  if (word === token) return true;
  let i = 0;
  while (i < Math.min(word.length, token.length) && word[i] === token[i]) i++;
  if (word.length === token.length) {
    return word.slice(i + 1) === token.slice(i + 1)
      || (word[i] === token[i + 1] && word[i + 1] === token[i] && word.slice(i + 2) === token.slice(i + 2));
  }
  return word.length > token.length ? word.slice(i + 1) === token.slice(i) : word.slice(i) === token.slice(i + 1);
}

const wordsOf = (text: string) => normalizeSearch(text).split(/\s+/).filter(Boolean);
const matchesWord = (word: string, token: string) => token === word || (word.length >= 2 && token.startsWith(word));
export function createSearchIndex(entries: SearchEntry[]) {
  return entries.map(entry => ({
    entry,
    title: normalizeSearch(entry.title),
    titleWords: new Set(wordsOf(entry.title)),
    descriptionWords: new Set(wordsOf(entry.description)),
    words: new Set(wordsOf(`${entry.title} ${entry.kind} ${entry.description} ${entry.text}`)),
  }));
}

export function searchEntries(index: ReturnType<typeof createSearchIndex>, query: string): SearchEntry[] {
  const normalized = normalizeSearch(query).slice(0, 200);
  if (!normalized) return [];
  const words = [...new Set(normalized.split(/\s+/))].slice(0, 12);
  return index.map(item => {
    let score = item.title === normalized ? 600 : item.title.includes(normalized) ? 250 : 0;
    for (const word of words) {
      const exact = item.words.has(word);
      const prefix = !exact && [...item.words].some(token => matchesWord(word, token));
      if (!exact && !prefix && ![...item.words].some(token => nearSearchWord(word, token))) return { entry: item.entry, score: -Infinity };
      if (item.titleWords.has(word)) score += 60;
      else if ([...item.titleWords].some(token => matchesWord(word, token))) score += 35;
      else if ([...item.titleWords].some(token => nearSearchWord(word, token))) score += 15;
      if (item.descriptionWords.has(word)) score += 10;
      score += exact ? 8 : prefix ? 4 : -20;
    }
    return { entry: item.entry, score };
  }).filter(item => Number.isFinite(item.score))
    .sort((a, b) => b.score - a.score)
    .map(item => item.entry);
}

// Keep original characters and punctuation. Rendering uses text nodes, never HTML.
export function searchTextParts(text: string, query: string): { text: string; match: boolean }[] {
  const words = wordsOf(query.slice(0, 200)).slice(0, 12);
  return text.split(/([\p{L}\p{N}][\p{L}\p{N}\p{M}]*)/gu).filter(Boolean).map(part => ({
    text: part,
    match: words.some(word => matchesWord(word, normalizeSearch(part)) || nearSearchWord(word, normalizeSearch(part))),
  }));
}

export function searchExcerpt(entry: SearchEntry, query: string): string {
  if (!normalizeSearch(query)) return entry.description;
  const descriptionMatches = searchTextParts(entry.description, query).some(part => part.match);
  const source = descriptionMatches ? entry.description : entry.text || entry.description;
  const parts = searchTextParts(source, query);
  let position = 0;
  for (const part of parts) { if (part.match) break; position += part.text.length; }
  if (position === source.length) position = 0;
  let start = Math.max(0, position - 65);
  if (start > 0) { const boundary = source.indexOf(' ', start); if (boundary >= 0 && boundary < position) start = boundary + 1; }
  const end = Math.min(source.length, start + 220);
  return `${start ? '…' : ''}${source.slice(start, end).trim()}${end < source.length ? '…' : ''}`;
}
