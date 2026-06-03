import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE_TITLE } from '../../consts';

export async function GET(context) {
	const notes = (await getCollection('notes'))
		.filter((note) => !note.data.draft)
		.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

	return rss({
		title: `${SITE_TITLE} — notes`,
		description: 'Short notes — quick links, thoughts, and things learned.',
		site: context.site,
		items: notes.map((note) => ({
			// Untitled notes still need a title in RSS readers — fall back to the
			// linked host or the date so the feed never shows a blank entry.
			title:
				note.data.title ??
				(note.data.link ? new URL(note.data.link).host.replace(/^www\./, '') : 'Note'),
			pubDate: note.data.pubDate,
			link: `/notes/${note.id}/`,
			categories: note.data.tags,
		})),
	});
}
