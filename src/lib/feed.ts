import { getCollection, type CollectionEntry } from 'astro:content';
import { comparePublicationDates } from './publication-date';

export type FeedEntry = CollectionEntry<'blog' | 'notes' | 'seen' | 'links'>;

export async function getFeed(): Promise<FeedEntry[]> {
  const collections = await Promise.all([
    getCollection('blog'), getCollection('notes'), getCollection('seen'), getCollection('links'),
  ]);
  return collections.flat()
    .filter(entry => !entry.data.draft && !(entry.collection === 'blog' && entry.data.locale === 'ja'))
    // Match displayed publication dates; edits don't bump old posts.
    .sort((a, b) => comparePublicationDates(a.data.pubDate, b.data.pubDate)
      || `${a.collection}/${a.id}`.localeCompare(`${b.collection}/${b.id}`));
}

export const entryHref = (entry: FeedEntry) => `/${entry.collection}/${entry.id}/`;
export const entryTitle = (entry: FeedEntry) => entry.data.title
  || (entry.collection === 'notes' && entry.data.linkText) || 'A note';
