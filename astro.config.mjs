// @ts-check
import { defineConfig } from 'astro/config';
import { satteri } from '@astrojs/markdown-satteri';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
	site: 'https://mager.co',
	// Only optimize the kitchen thumbnails; leave legacy Markdown images untouched.
	image: {
		remotePatterns: [
			{ protocol: 'https', hostname: 'sdld3v8bpzf3snqo.public.blob.vercel-storage.com', pathname: '/blog/2026-06-06-euglena-yogo-parfait/hero.jpg' },
			{ protocol: 'https', hostname: 'sdld3v8bpzf3snqo.public.blob.vercel-storage.com', pathname: '/blog/2026-08-07-cherry-tomato-pasta/hero.jpg' },
			{ protocol: 'https', hostname: 'lh3.googleusercontent.com', pathname: '/pw/AP1GczMXnudm2XjUjkec0fmixxvHO5BLNpsmIaz_v5FUktoj04gaQEcaxRaIasv9SScrlKHRX1av0nR4fc-2_d_eURa0XT9zbiPDl8D24X-STzyIu0qmYWNYHSKHFaU2I_GB1iuOhu-O9-zvTCugGKLY12qVSQ=w2030-h1522-s-no-gm' },
			{ protocol: 'https', hostname: 'sdld3v8bpzf3snqo.public.blob.vercel-storage.com', pathname: '/blog/2026-05-30-japanese-spaghetti/hero.jpg' },
		],
	},
	// Preserve the publication's existing spacing between inline elements.
	compressHTML: true,
	integrations: [mdx(), sitemap()],
	redirects: {
		'/blog/2026-03-21-kotsu-the-knack-of-japanese': '/blog/2026-03-21-kotsu-the-knack-for-japanese',
		'/notes/2026-06-04-openclaw-mac-mini-harness': '/blog/2026-06-04-an-openclaw-setup-for-dad',
		'/blog/2026-06-17-claude-voice-agent': '/blog/2026-06-25-claude-voice-agent',
		'/blog/2026-07-18-mager-bench-free-models': '/notes/2026-07-18-mager-bench-free-models',
		'/blog/2026-07-29-cherry-tomato-sauce': '/blog/2026-08-07-cherry-tomato-pasta',
		'/blog/2026-07-29-cherry-tomato-pasta': '/blog/2026-08-07-cherry-tomato-pasta',
	},
	markdown: {
		processor: satteri({
			features: { smartPunctuation: false },
			hastPlugins: [{
				name: 'keyboard-accessible-tables',
				element: {
					filter: ['table'],
					visit(node, ctx) {
						// Tables scroll horizontally on small screens, including without JS.
						ctx.setProperty(node, 'tabIndex', 0);
					},
				},
			}],
		}),
		shikiConfig: {
			themes: { light: 'github-light', dark: 'github-dark' },
			defaultColor: 'dark',
		},
	},
});
