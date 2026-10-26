import rss from '@astrojs/rss';
import { getFeed, entryHref, entryTitle } from '../lib/feed';
import { SITE_TITLE, SITE_DESCRIPTION } from '../consts';

export async function GET(context) {
	const entries = await getFeed();
	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site,
		items: entries.map((entry) => ({
			title: entryTitle(entry),
			pubDate: entry.data.pubDate,
			description: entry.collection === 'blog' || entry.collection === 'links'
				? entry.data.description || entry.data.title
				: entry.body?.trim() || entryTitle(entry),
			link: entryHref(entry),
			categories: entry.data.tags,
			...(entry.collection === 'links' ? { content: `<p><a href="${escapeHtml(entry.data.url)}">${escapeHtml(entry.data.title)}</a></p>` } : {}),
		})),
	});
}

function escapeHtml(value) {
	return value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}
