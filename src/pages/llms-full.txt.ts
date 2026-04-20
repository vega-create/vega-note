import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { siteConfig } from '../site.config';

const FULL_CONTENT_CAP = 50;

export const GET: APIRoute = async () => {
  const origin = 'https://vega-note.com';
  const now = new Date();
  const posts = (await getCollection('posts', ({ data }) => !data.draft && new Date(data.publishDate) <= now))
    .sort((a, b) => new Date(b.data.publishDate).getTime() - new Date(a.data.publishDate).getTime());

  const header: string[] = [
    `# ${siteConfig.name} — Full Content`,
    '',
    '> 所有發佈文章的 markdown 全文，供 AI agent 引用。',
    '',
    `Source: ${origin}/`,
    `Generated: ${new Date().toISOString()}`,
    `Posts: ${posts.length}`,
    '',
  ];

  const sections: string[] = [];
  const fullPosts = posts.slice(0, FULL_CONTENT_CAP);
  const digestPosts = posts.slice(FULL_CONTENT_CAP);

  for (const post of fullPosts) {
    const meta: string[] = [
      `Source: ${origin}/posts/${post.slug}/`,
      `Published: ${new Date(post.data.publishDate).toISOString().slice(0, 10)}`,
    ];
    if (post.data.category) meta.push(`Category: ${post.data.category}`);
    if (post.data.tags && post.data.tags.length) meta.push(`Tags: ${post.data.tags.join(', ')}`);

    sections.push('---', '', `# ${post.data.title}`, '', ...meta, '', post.body || '_(no content)_', '');
  }

  if (digestPosts.length > 0) {
    sections.push('---', '', `# Additional Posts (title-only, ${digestPosts.length})`, '');
    sections.push('File size cap reached — remaining posts listed below. Fetch each URL for full content.', '');
    for (const post of digestPosts) {
      const cat = post.data.category ? ` [${post.data.category}]` : '';
      const date = ` — ${new Date(post.data.publishDate).toISOString().slice(0, 10)}`;
      sections.push(`- [${post.data.title}](${origin}/posts/${post.slug}/)${cat}${date}`);
    }
    sections.push('');
  }

  return new Response([...header, ...sections].join('\n'), {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
