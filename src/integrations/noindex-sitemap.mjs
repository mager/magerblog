import { readFile } from 'node:fs/promises';
import sitemap from '@astrojs/sitemap';

// Read the generated HTML before the sitemap runs, so draft status comes from
// the rendered page rather than a second parser for content frontmatter.
export function noindexSitemap() {
  const excluded = new Set();
  return [
    {
      name: 'exclude-noindex-from-sitemap',
      hooks: {
        'astro:build:done': async ({ dir, pages }) => {
          excluded.clear();
          await Promise.all(pages.map(async ({ pathname }) => {
            const path = pathname.replace(/^\/+|\/+$/g, '');
            const html = await readFile(new URL(path ? `${path}/index.html` : 'index.html', dir), 'utf8');
            if (/<meta\s+name="robots"\s+content="[^"]*\bnoindex\b/i.test(html)) {
              excluded.add(`/${path}`);
            }
          }));
        },
      },
    },
    sitemap({ filter: url => !excluded.has(new URL(url).pathname.replace(/\/$/, '')) }),
  ];
}
