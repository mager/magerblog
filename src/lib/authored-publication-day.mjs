import { CORE_SCHEMA, load } from 'js-yaml';

/**
 * Read the calendar day only when the author omitted the time.
 * Astro converts unquoted YAML dates and timestamps to Date before validation.
 * Its normalized midnight can therefore represent either precision.
 * @param {string} source Markdown or MDX source with YAML frontmatter.
 * @param {'pubDate' | 'updatedDate'} field The date used by the listing.
 * @returns {string | undefined}
 */
export function authoredPublicationDay(source, field = 'pubDate') {
  const frontmatter = /^\uFEFF?\s*---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(?=\r?\n|$)/.exec(source);
  if (!frontmatter) throw new Error('Missing publication frontmatter');
  // CORE_SCHEMA preserves the authored timestamp scalar as text, including 00:00Z.
  const value = load(frontmatter[1], { schema: CORE_SCHEMA })[field];
  if (typeof value !== 'string' || /\d{1,2}:\d{2}/.test(value)) return;
  const day = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(day)) return day;

  // Legacy calendar strings such as "Jun 01 2024" also have day precision.
  const midnight = new Date(day + ' 00:00:00 GMT');
  if (!Number.isFinite(midnight.valueOf())) throw new Error(`Unsupported publication day: ${day}`);
  return midnight.toISOString().slice(0, 10);
}
