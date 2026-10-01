import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE_TITLE } from '../../consts';

export async function GET(context) {
	const seen = (await getCollection('seen'))
		.filter((entry) => !entry.data.draft)
		.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

	return rss({
		title: `${SITE_TITLE} — seen`,
		description: 'Photos, screenshots, and things worth a second look.',
		site: context.site,
		items: seen.map((entry) => ({
			title: entry.data.title,
			description: entry.body?.trim() || entry.data.location || entry.data.title,
			pubDate: entry.data.pubDate,
			link: `/seen/${entry.id}/`,
			categories: entry.data.tags,
		})),
	});
}
