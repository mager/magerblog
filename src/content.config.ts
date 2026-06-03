import { glob } from 'astro/loaders';
import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema
	schema: z.object({
		title: z.string(),
		description: z.string(),
		// Transform string to Date object
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		heroImage: z.string().optional(),
		prepTime: z.number().optional(),
		cookTime: z.number().optional(),
		category: z.string().optional(),
		tags: z.array(z.string()).optional(),
		draft: z.boolean().optional(),
		keyword: z.string().optional(), // Short 1-2 word phrase for hero cycling (e.g., "green curry", "Sicily", "AI agents")
		recipeLayout: z.enum(['default', 'compact']).optional(), // Compact layout shows images alongside text on desktop
		subcategory: z.string().optional(), // Recipe subcategory for filtering (soup, casserole, meat, pasta, comfort, etc.)
		locale: z.string().optional(), // 'en' or 'ja' — omit for English default
		translationKey: z.string().optional(), // Shared key linking EN and JA versions of the same post
	}),
});

// Short-form micro-posts — Simon Willison-style "notes": a quick thought, a
// link with commentary, or a TIL. Title is optional on purpose; the whole
// note is meant to be read inline on /notes without a click-through.
const notes = defineCollection({
	loader: glob({ base: './src/content/notes', pattern: '**/*.{md,mdx}' }),
	schema: z.object({
		title: z.string().optional(),
		pubDate: z.coerce.date(),
		link: z.string().url().optional(), // link-blog: the URL this note points at
		linkText: z.string().optional(), // display label for `link` (defaults to the host)
		tags: z.array(z.string()).optional(),
		category: z.enum(['tech', 'food', 'life']).optional(), // surfaces the note on that category page
		draft: z.boolean().optional(),
	}),
});

export const collections = { blog, notes };
