import { type FeedEntry, entryTitle } from './feed';
export { makeEdition } from './edition-selection';

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
