import { type FeedEntry, entryTitle } from './feed';

export const editionLabel = (entry: FeedEntry) => entry.collection === 'blog'
  ? ({ food: 'From the kitchen', life: 'Life, outside', tech: 'Building' }[entry.data.category || 'tech'] || 'Article')
  : ({ notes: 'Notebook', seen: 'Seen', links: 'Worth opening', artifacts: 'Artifact' }[entry.collection]);

export const editionImage = (entry: FeedEntry) => entry.collection === 'blog'
  ? entry.data.heroImage || entry.body?.match(/!\[[^\]]*\]\((https?:\/\/[^\s)]+)(?:\s+"[^"]*")?\)/)?.[1]
  : entry.collection === 'seen' ? entry.data.photo : undefined;

export function editionDescription(entry: FeedEntry): string {
  if ('description' in entry.data && entry.data.description) return entry.data.description;
  if (entry.collection === 'seen') return entry.data.location || '';
  const text = (entry.body || '').trim().split(/\n\s*\n/)[0]
    .replace(/!?\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/<[^>]*>/g, '').replace(/[*_`#]/g, '').replace(/\s+/g, ' ').trim();
  return text === entryTitle(entry) ? '' : text;
}

// A story gets one place in the edition. The complete chronological feed is separate.
export function makeEdition(entries: FeedEntry[]) {
  const used = new Set<string>();
  const take = (matches: (entry: FeedEntry) => boolean, count: number) => entries.filter(entry => {
    const key = `${entry.collection}/${entry.id}`;
    return !used.has(key) && matches(entry);
  }).slice(0, count).map(entry => { used.add(`${entry.collection}/${entry.id}`); return entry; });
  const isTech = (entry: FeedEntry) => entry.collection === 'blog' && (!entry.data.category || entry.data.category === 'tech');
  const lead = take(isTech, 1)[0];
  const supporting = take(isTech, 2);
  const dispatches = take(entry => entry.collection === 'notes', 4);
  const workbench = take(isTech, 4);
  const links = take(entry => entry.collection === 'links', 2);
  const seen = take(entry => entry.collection === 'seen', 5);
  const kitchen = take(entry => entry.collection === 'blog' && entry.data.category === 'food', 5);
  const life = take(entry => entry.collection === 'blog' && entry.data.category === 'life', 3);
  const artifacts = take(entry => entry.collection === 'artifacts', 3);
  const notebook = take(entry => entry.collection === 'notes', 3);
  return { lead, supporting, dispatches, workbench, links, seen, kitchen, life, artifacts, notebook, count: used.size };
}
