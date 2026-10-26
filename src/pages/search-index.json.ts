import { entryHref, entryTitle, getFeed } from '../lib/feed';
import type { SearchEntry } from '../lib/search';

export async function GET() {
  const entries = await getFeed();
  const blogKinds: Record<string, string> = { food: 'Cooking', life: 'Life', tech: 'Tech' };
  const plainText = (text: string) => text
    .replace(/<[^>]*>/g, ' ')
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/[#*_`~|>]/g, ' ')
    .replace(/\s+/g, ' ').trim();
  const data: SearchEntry[] = entries.map(entry => {
    const kind = entry.collection === 'blog'
      ? (blogKinds[entry.data.category || 'tech'] || 'Article')
      : ({ notes: 'Note', seen: 'Seen', links: 'Link' }[entry.collection]);
    const body = plainText(entry.body || '');
    const description = ('description' in entry.data && entry.data.description) || body.slice(0, 180);
    return {
      title: entryTitle(entry), href: entryHref(entry), kind,
      description: plainText(description),
      text: `${body} ${'tags' in entry.data ? (entry.data.tags || []).join(' ') : ''} ${'location' in entry.data ? entry.data.location || '' : ''} ${'alt' in entry.data ? entry.data.alt || '' : ''}`,
    };
  });
  return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
}
