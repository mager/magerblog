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

  const artifacts = (await getCollection('artifacts', ({ data }) => !data.draft))
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf() || a.id.localeCompare(b.id));
  const artifactLines = artifacts
    .map(entry => `- [${entry.data.title}](${BASE}/artifacts/${entry.id}/): ${entry.data.description} [Markdown](${BASE}/artifacts/${entry.id}.md)`)
    .join('\n');

  const body = `# mager.co

> Mager is a software engineer in Chicago specializing in personal software. He built [prxps](https://github.com/mager/prxps), [loooom](https://github.com/mager/loooom.xyz), and [kotsu](https://github.com/mager/kotsu), and writes about what worked, what broke, and what he learned along the way.

## Software

- [Software](${BASE}/software/): Perch, Mood Shell, Homeport, and prxps. Project websites, public source links, and build logs.

## Blog

${blogLines}

## Artifacts

${artifactLines}

## Full content (markdown)

${mdLines}
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};
