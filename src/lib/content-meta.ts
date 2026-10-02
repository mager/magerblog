import type { FeedEntry } from './feed';

export function contentMeta(entry: FeedEntry): string | undefined {
  if (entry.collection === 'seen') {
    return entry.data.location || (entry.data.mediaType === 'screenshot' ? 'Screenshot' : undefined);
  }
  if (entry.collection !== 'blog' && entry.collection !== 'notes') return undefined;
  if (entry.collection === 'blog' && entry.data.category === 'food') {
    const { prepTime, cookTime } = entry.data;
    if (prepTime != null && cookTime != null) return `${prepTime + cookTime} min total`;
    if (cookTime != null) return `${cookTime} min cooking`;
    if (prepTime != null) return `${prepTime} min prep`;
    return undefined;
  }
  const text = (entry.body || '').trim();
  if (!text) return undefined;
  return `${Math.max(1, Math.ceil(text.split(/\s+/).length / 220))} min read`;
}
