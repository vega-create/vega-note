import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';

export const getStaticPaths: GetStaticPaths = async () => {
  const now = new Date();
  const posts = await getCollection('posts', ({ data }) => !data.draft && new Date(data.publishDate) <= now);
  return posts.map((post) => ({
    params: { slug: post.slug },
    props: { post },
  }));
};

export const GET: APIRoute = async ({ props }) => {
  const origin = 'https://vega-note.com';
  const post = (props as any).post as Awaited<ReturnType<typeof getCollection>>[number];

  const lines: string[] = [];
  lines.push(`# ${post.data.title}`);
  lines.push('');
  lines.push(`Source: ${origin}/posts/${post.slug}/`);
  lines.push(`Published: ${new Date(post.data.publishDate).toISOString().slice(0, 10)}`);
  if (post.data.category) lines.push(`Category: ${post.data.category}`);
  if (post.data.tags && post.data.tags.length) lines.push(`Tags: ${post.data.tags.join(', ')}`);
  if (post.data.image) lines.push(`Image: ${post.data.image}`);
  lines.push('', '---', '', post.body || '_(no content)_');

  return new Response(lines.join('\n') + '\n', {
    status: 200,
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
