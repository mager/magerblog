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
	},
	markdown: {
		smartypants: false,
	},
});
