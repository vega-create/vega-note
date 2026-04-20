/**
 * Cloudflare Pages middleware for agent-readiness.
 *
 *  1. Content negotiation: when a client sends `Accept: text/markdown`,
 *     serve the pre-built .md version of the requested page (built at
 *     Astro build time as src/pages/**\/*.md.ts endpoints).
 *  2. RFC 8288 Link headers on every HTML response, advertising
 *     llms.txt, llms-full.txt, sitemap, and the markdown alternate.
 */

function markdownAssetPath(pathname: string): string | null {
  const p = pathname.replace(/\/+$/, '') || '/';
  if (p === '/') return '/index.md';
  if (p.startsWith('/posts/') && p !== '/posts') return `${p}.md`;
  return null;
}

type PagesCtx = {
  request: Request;
  next: () => Promise<Response>;
  env: Record<string, any>;
};

export const onRequest = async (context: PagesCtx): Promise<Response> => {
  const { request, next, env } = context;
  const url = new URL(request.url);
  const accept = request.headers.get('accept') || '';

  if (accept.includes('text/markdown')) {
    const mdPath = markdownAssetPath(url.pathname);
    if (mdPath) {
      try {
        const assetUrl = new URL(mdPath, url.origin);
        const assetReq = new Request(assetUrl.toString(), { method: 'GET' });
        const assetRes = env.ASSETS
          ? await env.ASSETS.fetch(assetReq)
          : await fetch(assetReq);
        if (assetRes.status === 200) {
          const canonicalPath = url.pathname || '/';
          return new Response(assetRes.body, {
            status: 200,
            headers: {
              'Content-Type': 'text/markdown; charset=utf-8',
              'Cache-Control': 'public, max-age=3600',
              'X-Content-Type-Options': 'nosniff',
              'Link': `<${canonicalPath}>; rel="canonical"; type="text/html"`,
              'Vary': 'Accept',
            },
          });
        }
      } catch {}
    }
  }

  const response = await next();
  const ct = response.headers.get('content-type') || '';
  if (!ct.includes('text/html')) return response;

  const links: string[] = [
    '</llms.txt>; rel="describedby"; type="text/plain"',
    '</llms-full.txt>; rel="alternate"; type="text/plain"; title="Full site content"',
    '</sitemap-index.xml>; rel="sitemap"; type="application/xml"',
  ];
  if (markdownAssetPath(url.pathname)) {
    const self = url.pathname || '/';
    links.push(`<${self}>; rel="alternate"; type="text/markdown"`);
  }

  const newHeaders = new Headers(response.headers);
  newHeaders.set('Link', links.join(', '));
  const existingVary = newHeaders.get('Vary');
  newHeaders.set('Vary', existingVary ? `${existingVary}, Accept` : 'Accept');

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
};
