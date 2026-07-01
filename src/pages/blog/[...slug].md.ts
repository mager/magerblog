import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return posts.map((post) => ({
    params: { slug: post.id },
    props: { post },
  }));
};

export const GET: APIRoute = async ({ props }) => {
  const { post } = props as Awaited<ReturnType<typeof getStaticPaths>>[number]['props'] & {
    post: Awaited<ReturnType<typeof getCollection<'blog'>>>[number];
  };

  if (!post || post.data.draft) {
    return new Response('Not found', { status: 404 });
  }

  return new Response(post.body, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
    },
  });
};
