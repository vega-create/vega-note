import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { siteConfig } from '../site.config';

export const GET: APIRoute = async () => {
  const origin = 'https://vega-note.com';
  const now = new Date();
  const posts = (await getCollection('posts', ({ data }) => !data.draft && new Date(data.publishDate) <= now))
    .sort((a, b) => new Date(b.data.publishDate).getTime() - new Date(a.data.publishDate).getTime())
    .slice(0, 5);

  const lines: string[] = [];
  lines.push(`# ${siteConfig.name}`);
  lines.push('');
  lines.push(`> ${siteConfig.description}`);
  lines.push('');
  lines.push(`Source: ${origin}/`);
  lines.push('');
  lines.push('Vega 的個人多元學習筆記，記錄 AI 工具、網站行銷、前端開發、自媒體經營、生活感悟。');
  lines.push('');
  lines.push('## 主要入口');
  lines.push('');
  lines.push(`- **部落格** — ${origin}/blog/ — 完整文章清單`);
  lines.push(`- **關於我** — ${origin}/about/`);
  lines.push('');

  if (posts.length > 0) {
    lines.push('## 最新筆記');
    lines.push('');
    for (const post of posts) {
      const cat = post.data.category ? ` [${post.data.category}]` : '';
      const date = ` — ${new Date(post.data.publishDate).toISOString().slice(0, 10)}`;
      lines.push(`- [${post.data.title}](${origin}/posts/${post.slug}/)${cat}${date}`);
    }
    lines.push('');
  }

  lines.push('## 機器可讀索引');
  lines.push('');
  lines.push(`- ${origin}/llms.txt — AI agent 專用站點導覽`);
  lines.push(`- ${origin}/llms-full.txt — 所有文章的 markdown 全文`);
  lines.push(`- ${origin}/sitemap-index.xml`);

  return new Response(lines.join('\n') + '\n', {
    status: 200,
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
