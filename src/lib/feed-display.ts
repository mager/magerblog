import { type FeedEntry, entryTitle } from './feed';
import { publicationTimeZone } from './publication-date';

export const entryImage = (entry: FeedEntry) => entry.collection === 'blog'
  ? entry.data.heroImage || entry.body?.match(/!\[[^\]]*\]\((https?:\/\/[^\s)]+)(?:\s+"[^"]*")?\)/)?.[1]
  : entry.collection === 'seen' ? entry.data.photo : undefined;

export function entryDescription(entry: FeedEntry): string {
  if ('description' in entry.data && entry.data.description) return entry.data.description;
  if (entry.collection === 'seen') return entry.data.location || '';
  const text = (entry.body || '').trim().split(/\n\s*\n/)[0]
    .replace(/!?\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/<[^>]*>/g, '').replace(/[*_`#]/g, '').replace(/\s+/g, ' ').trim();
  return text === entryTitle(entry) ? '' : text;
}

export const entryCategory = (entry: FeedEntry) => entry.collection === 'blog' ? entry.data.category || 'tech' : entry.collection;
export const entryDate = (date: Date) => date.toLocaleDateString('en-US', { timeZone: publicationTimeZone(date), month: 'short', day: 'numeric', year: 'numeric' });
