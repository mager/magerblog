import { getCollection, type CollectionEntry } from 'astro:content';
import { comparePublicationDates, feedDate } from './publication-date';

export type FeedEntry = CollectionEntry<'blog' | 'notes' | 'seen' | 'links'>;

export async function getFeed(): Promise<FeedEntry[]> {
  const collections = await Promise.all([
    getCollection('blog'), getCollection('notes'), getCollection('seen'), getCollection('links'),
  ]);
  return collections.flat()
    .filter(entry => !entry.data.draft && !(entry.collection === 'blog' && entry.data.locale === 'ja'))
    // Authored updates bring older posts back into the latest feed.
    .sort((a, b) => comparePublicationDates(feedDate(a.data), feedDate(b.data))
      || `${a.collection}/${a.id}`.localeCompare(`${b.collection}/${b.id}`));
}

export const entryHref = (entry: FeedEntry) => `/${entry.collection}/${entry.id}/`;
export const entryTitle = (entry: FeedEntry) => entry.data.title
  || (entry.collection === 'notes' && entry.data.linkText) || 'A note';
