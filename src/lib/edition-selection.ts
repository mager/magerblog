import type { FeedEntry } from './feed';
import { comparePublicationDates } from './publication-date.ts';

const key = (entry: FeedEntry) => `${entry.collection}/${entry.id}`;
const desk = (entry: FeedEntry) => entry.collection === 'blog' ? entry.data.category || 'tech' : entry.collection;
const byPublication = (a: FeedEntry, b: FeedEntry) => comparePublicationDates(a.data.pubDate, b.data.pubDate)
  || key(a).localeCompare(key(b));
const SUPPORTING_WINDOW = 7 * 24 * 60 * 60 * 1000;

/** Build one edition from publication dates, never edit dates or category priority. */
export function makeEdition(entries: FeedEntry[]) {
  const ordered = entries.filter(entry => !entry.data.draft
    && !(entry.collection === 'blog' && entry.data.locale === 'ja')).sort(byPublication);
  const used = new Set<string>();
  const take = (matches: (entry: FeedEntry) => boolean, count: number): FeedEntry[] => {
    const selected: FeedEntry[] = [];
    for (const entry of ordered) {
      if (selected.length >= count) break;
      if (used.has(key(entry)) || !matches(entry)) continue;
      used.add(key(entry));
      selected.push(entry);
    }
    return selected;
  };
  const isArticle = (entry: FeedEntry) => entry.collection === 'blog';
  const lead = take(isArticle, 1)[0] || take(() => true, 1)[0];

  // Reserve the two supporting positions for other recent desks when possible.
  // The window moves with new publications; a dormant category cannot keep a slot.
  const represented = new Set(lead ? [desk(lead)] : []);
  const cutoff = (lead?.data.pubDate.valueOf() || 0) - SUPPORTING_WINDOW;
  const supporting: FeedEntry[] = [];
  for (let slot = 0; slot < 2; slot++) {
    const story = take(entry => isArticle(entry) && entry.data.pubDate.valueOf() >= cutoff
      && !represented.has(desk(entry)), 1)[0];
    if (!story) break;
    supporting.push(story);
    represented.add(desk(story));
  }
  supporting.push(...take(isArticle, 2 - supporting.length));
  supporting.sort(byPublication);

  const dispatches = take(() => true, 4);
  const workbench = take(entry => isArticle(entry) && desk(entry) === 'tech', 4);
  const links = take(entry => entry.collection === 'links', 2);
  const seen = take(entry => entry.collection === 'seen', 5);
  const kitchen = take(entry => isArticle(entry) && desk(entry) === 'food', 5);
  const life = take(entry => isArticle(entry) && desk(entry) === 'life', 3);
  const artifacts = take(entry => entry.collection === 'artifacts', 3);
  const notebook = take(entry => entry.collection === 'notes', 3);

  const newest = (group: FeedEntry[]) => [...group].sort(byPublication)[0];
  const byFreshest = (a: FeedEntry[], b: FeedEntry[]) => {
    const first = newest(a), second = newest(b);
    return first && second ? byPublication(first, second) : first ? -1 : second ? 1 : 0;
  };
  const sections = [
    { key: 'workbench', entries: workbench },
    { key: 'seen', entries: seen },
    { key: 'offscreen', entries: [...kitchen, ...life] },
    { key: 'reference', entries: [...artifacts, ...notebook] },
    { key: 'links', entries: links },
  ].filter(section => section.entries.length || section.key === 'reference')
    .sort((a, b) => byFreshest(a.entries, b.entries)).map(section => section.key);
  const offscreenOrder = [
    { key: 'kitchen', entries: kitchen }, { key: 'life', entries: life },
  ].filter(section => section.entries.length)
    .sort((a, b) => byFreshest(a.entries, b.entries)).map(section => section.key);

  return { lead, supporting, dispatches, workbench, links, seen, kitchen, life, artifacts, notebook,
    sections, offscreenOrder, count: used.size };
}
