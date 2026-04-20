import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { siteConfig } from '../site.config';

export const GET: APIRoute = async () => {
  const origin = 'https://vega-note.com';
  const now = new Date();
  const posts = (await getCollection('posts', ({ data }) => !data.draft && new Date(data.publishDate) <= now))
    .sort((a, b) => new Date(b.data.publishDate).getTime() - new Date(a.data.publishDate).getTime());

  const lines: string[] = [];
  lines.push(`# ${siteConfig.name}`);
  lines.push('');
  lines.push(`> ${siteConfig.description}`);
  lines.push('');
  lines.push(`${siteConfig.name}（vega-note.com）是 Vega 的個人多元學習筆記站，記錄 AI 工具使用心得、網站行銷、開發日誌、以及生活感悟。內容偏實作紀錄與工具評測，適合同時在玩 AI / 自架站 / 自媒體的讀者。`);
  lines.push('');
  lines.push('## 主要分類');
  lines.push('');
  lines.push(`- [部落格](${origin}/blog/): 所有文章`);
  lines.push(`- [關於我](${origin}/about/): Vega 是誰`);
  lines.push('');
  lines.push('## 主要頁面');
  lines.push('');
  lines.push(`- [首頁](${origin}/): 最新筆記總覽`);
  lines.push(`- [部落格索引](${origin}/blog/): 完整文章清單（可依分類篩選）`);
  lines.push('');

  const recent = posts.slice(0, 10);
  if (recent.length > 0) {
    lines.push('## 最新筆記');
    lines.push('');
    for (const post of recent) {
      const cat = post.data.category ? ` [${post.data.category}]` : '';
      const date = ` — ${new Date(post.data.publishDate).toISOString().slice(0, 10)}`;
      lines.push(`- [${post.data.title}](${origin}/posts/${post.slug}/)${cat}${date}`);
    }
    lines.push('');
  }

  lines.push('## Optional');
  lines.push('');
  lines.push(`- [Sitemap](${origin}/sitemap-index.xml): 完整頁面清單`);
  lines.push(`- [全文索引](${origin}/llms-full.txt): 所有文章的 markdown 全文`);

  return new Response(lines.join('\n') + '\n', {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
