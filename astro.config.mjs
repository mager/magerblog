// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
	site: 'https://mager.co',
	integrations: [mdx(), sitemap()],
	redirects: {
		'/blog/2026-03-21-kotsu-the-knack-of-japanese': '/blog/2026-03-21-kotsu-the-knack-for-japanese',
		'/notes/2026-06-04-openclaw-mac-mini-harness': '/blog/2026-06-04-an-openclaw-setup-for-dad',
		'/blog/2026-06-17-claude-voice-agent': '/blog/2026-06-25-claude-voice-agent',
		'/blog/2026-07-18-mager-bench-free-models': '/notes/2026-07-18-mager-bench-free-models',
	},
	markdown: {
		smartypants: false,
	},
});
