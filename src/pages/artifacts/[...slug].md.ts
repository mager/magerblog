import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection, type CollectionEntry } from 'astro:content';

export const getStaticPaths: GetStaticPaths = async () =>
  (await getCollection('artifacts', ({ data }) => !data.draft))
    .map(entry => ({ params: { slug: entry.id }, props: { entry } }));

export const GET: APIRoute = ({ props }) => {
  const entry = props.entry as CollectionEntry<'artifacts'> | undefined;
  if (!entry || entry.data.draft) return new Response('Not found', { status: 404 });
  // Include the document title; publishing metadata stays out of the portable file.
  return new Response(`# ${entry.data.title}\n\n${entry.body || ''}`, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
};
