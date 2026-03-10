import { Router } from 'express';

// Browser-like headers to avoid 403 errors
const BROWSER_HEADERS: Record<string, string> = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
  'Cache-Control': 'max-age=0',
  'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
  'Sec-Ch-Ua-Mobile': '?0',
  'Sec-Ch-Ua-Platform': '"Windows"',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Sec-Fetch-User': '?1',
  'Upgrade-Insecure-Requests': '1',
};

function isBlockedHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return host === 'localhost' || host === '127.0.0.1' || host === '::1' ||
    /^(10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|169\.254\.)/.test(host);
}

/**
 * Strip HTML to plain text, keeping basic structure via newlines.
 */
function htmlToText(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/?(p|div|h[1-6]|li|tr|blockquote|pre)[^>]*>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

const router = Router();

// ─── Web Search Proxy ──────────────────────────────────────────────

router.post('/web-search', async (req, res) => {
  const { query, provider = 'duckduckgo', maxResults = 8 } = req.body;
  const braveKey = req.headers['x-brave-api-key'] as string | undefined;
  if (!query || typeof query !== 'string' || query.length > 500) {
    return res.status(400).json({ error: 'Invalid or missing query' });
  }

  try {
    if (provider === 'brave' && braveKey) {
      const url = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=${maxResults}`;
      const r = await fetch(url, {
        headers: { Accept: 'application/json', 'Accept-Encoding': 'gzip', 'X-Subscription-Token': braveKey },
      });
      if (!r.ok) throw new Error(`Brave Search: ${r.status} ${r.statusText}`);
      const data = await r.json() as any;
      const results = (data.web?.results || []).slice(0, maxResults).map((item: any) => ({
        title: item.title || '',
        url: item.url || '',
        snippet: item.description || '',
        source: 'brave',
      }));
      res.json({ results, query, provider: 'brave' });
    } else {
      // DuckDuckGo HTML search (no API key needed)
      const ddgUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
      const r = await fetch(ddgUrl, { headers: BROWSER_HEADERS });
      if (!r.ok) throw new Error(`DuckDuckGo: ${r.status}`);
      const html = await r.text();

      const results: { title: string; url: string; snippet: string; source: string }[] = [];
      const resultRegex = /<a[^>]+class="result__a"[^>]+href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
      const snippetRegex = /<a[^>]+class="result__snippet"[^>]*>([\s\S]*?)<\/a>/gi;

      const titles: { url: string; title: string }[] = [];
      let match;
      while ((match = resultRegex.exec(html)) !== null && titles.length < maxResults) {
        let href = match[1];
        const uddgMatch = href.match(/uddg=([^&]+)/);
        if (uddgMatch) href = decodeURIComponent(uddgMatch[1]);
        const title = match[2].replace(/<[^>]*>/g, '').trim();
        if (href && title && href.startsWith('http')) {
          titles.push({ url: href, title });
        }
      }

      const snippets: string[] = [];
      while ((match = snippetRegex.exec(html)) !== null) {
        snippets.push(match[1].replace(/<[^>]*>/g, '').trim());
      }

      for (let i = 0; i < titles.length; i++) {
        results.push({
          title: titles[i].title,
          url: titles[i].url,
          snippet: snippets[i] || '',
          source: 'duckduckgo',
        });
      }

      res.json({ results, query, provider: 'duckduckgo' });
    }
  } catch (e: unknown) {
    res.status(502).json({ error: e instanceof Error ? e.message : 'Unknown error' });
  }
});

// ─── Web Fetch Proxy ───────────────────────────────────────────────

router.post('/web-fetch', async (req, res) => {
  const { url } = req.body;
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Missing url' });
  }
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return res.status(400).json({ error: 'Only HTTP/HTTPS URLs allowed' });
    }
    if (isBlockedHost(parsed.hostname)) {
      return res.status(400).json({ error: 'Internal URLs not allowed' });
    }
  } catch {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  try {
    const r = await fetch(url, {
      headers: BROWSER_HEADERS,
      redirect: 'follow',
      signal: AbortSignal.timeout(15000),
    });
    if (!r.ok) throw new Error(`Fetch failed: ${r.status}`);
    const contentType = r.headers.get('content-type') || '';
    if (!contentType.includes('text/') && !contentType.includes('application/json') && !contentType.includes('application/xml')) {
      return res.json({ url, content: '[Binary content — not extractable]', contentType });
    }
    const html = await r.text();
    const text = htmlToText(html);
    // Truncate to ~30K chars to avoid token overflow
    const truncated = text.length > 30000 ? text.substring(0, 30000) + '\n\n[...content truncated...]' : text;
    res.json({ url, content: truncated, charCount: text.length });
  } catch (e: unknown) {
    res.status(502).json({ error: e instanceof Error ? e.message : 'Unknown error' });
  }
});

export default router;
