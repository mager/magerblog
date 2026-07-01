import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async () => {
  const posts = (await getCollection('blog', ({ data }) => !data.draft)).sort(
    (a, b) => new Date(b.data.pubDate).getTime() - new Date(a.data.pubDate).getTime()
  );

  const BASE = 'https://www.mager.co';

  const blogLines = posts
    .map((post) => `- [${post.data.title}](${BASE}/blog/${post.id}/): ${post.data.description}`)
    .join('\n');

  const mdLines = posts
    .map((post) => `- [${post.data.title}](${BASE}/blog/${post.id}.md): Full post markdown`)
    .join('\n');

  const body = `# mager.co

> Mager is a software engineer in Chicago building AI agents, developer tools, and weird internet products. He writes about what actually worked, what broke, and what he learned along the way.

## Blog

${blogLines}

## Full content (markdown)

${mdLines}
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};
