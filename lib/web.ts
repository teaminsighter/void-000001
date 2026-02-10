// ══════════════════════════════════════
// VOID — Web Fetch & Search Helpers
// ══════════════════════════════════════

// ── Configuration ─────────────────────

const SEARXNG_URL = process.env.SEARXNG_URL || 'http://localhost:8080';
const FETCH_TIMEOUT_MS = 10_000;
const MAX_BODY_CHARS = 2000;
const MAX_HTML_SIZE = 512_000;

// ── Types ─────────────────────────────

export interface WebMetadata {
  url: string;
  title: string;
  description: string;
  image?: string;
  siteName?: string;
  type?: string;
  author?: string;
  contentPreview: string;
  fetchedAt: string;
}

export interface SearchResult {
  title: string;
  url: string;
  content: string;
  engine: string;
}

export interface SearchResponse {
  query: string;
  results: SearchResult[];
  count: number;
}

// ── Private IP Guard (SSRF Protection) ──

const BLOCKED_PATTERNS = [
  /^https?:\/\/localhost/i,
  /^https?:\/\/127\./,
  /^https?:\/\/0\./,
  /^https?:\/\/10\./,
  /^https?:\/\/172\.(1[6-9]|2\d|3[01])\./,
  /^https?:\/\/192\.168\./,
  /^https?:\/\/\[::1\]/,
  /^https?:\/\/169\.254\./,
  /^https?:\/\/metadata\.google/i,
];

function isBlockedUrl(url: string): boolean {
  return BLOCKED_PATTERNS.some(p => p.test(url));
}

// ── YouTube Detection & oEmbed ────────

function isYouTubeUrl(url: string): boolean {
  return /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//i.test(url);
}

async function fetchYouTubeMetadata(url: string): Promise<WebMetadata> {
  const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
  const response = await fetch(oembedUrl, {
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`YouTube oEmbed failed: HTTP ${response.status}`);
  }

  const data = await response.json() as {
    title?: string;
    author_name?: string;
    thumbnail_url?: string;
    provider_name?: string;
  };

  return {
    url,
    title: data.title || 'Untitled Video',
    description: `YouTube video by ${data.author_name || 'unknown'}`,
    image: data.thumbnail_url || undefined,
    siteName: 'YouTube',
    type: 'video',
    author: data.author_name || undefined,
    contentPreview: `Video: "${data.title}" by ${data.author_name}. Provider: ${data.provider_name || 'YouTube'}.`,
    fetchedAt: new Date().toISOString(),
  };
}

// ── HTML Metadata Extraction (regex) ──

function extractTitle(html: string): string {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match ? decodeEntities(match[1].trim()) : '';
}

function extractMeta(html: string, nameOrProp: string): string {
  const patterns = [
    new RegExp(`<meta[^>]+(?:name|property)=["']${nameOrProp}["'][^>]+content=["']([^"']*?)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']*?)["'][^>]+(?:name|property)=["']${nameOrProp}["']`, 'i'),
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) return decodeEntities(match[1].trim());
  }
  return '';
}

function extractBodyText(html: string): string {
  let text = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<header[\s\S]*?<\/header>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '');

  text = text.replace(/<[^>]+>/g, ' ');
  text = text.replace(/\s+/g, ' ').trim();

  if (text.length > MAX_BODY_CHARS) {
    text = text.slice(0, MAX_BODY_CHARS) + '...';
  }

  return text;
}

function decodeEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/');
}

// ── Public: fetchWebPage ──────────────

export async function fetchWebPage(url: string): Promise<WebMetadata> {
  if (isBlockedUrl(url)) {
    throw new Error('Cannot fetch internal/private URLs');
  }

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }

  if (isYouTubeUrl(url)) {
    return fetchYouTubeMetadata(url);
  }

  const response = await fetch(url, {
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    headers: {
      'User-Agent': 'VOID-Agent/1.0 (Personal AI OS)',
      'Accept': 'text/html,application/xhtml+xml,*/*',
    },
    redirect: 'follow',
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} fetching ${url}`);
  }

  const contentType = response.headers.get('content-type') || '';

  if (!contentType.includes('text/html') && !contentType.includes('xhtml')) {
    return {
      url: response.url,
      title: url.split('/').pop() || url,
      description: `Non-HTML content (${contentType})`,
      contentPreview: `Binary or non-HTML content at ${response.url}. Content-Type: ${contentType}`,
      fetchedAt: new Date().toISOString(),
    };
  }

  // Read HTML with size limit
  const reader = response.body?.getReader();
  if (!reader) throw new Error('No response body');

  let html = '';
  const decoder = new TextDecoder();
  while (html.length < MAX_HTML_SIZE) {
    const { done, value } = await reader.read();
    if (done) break;
    html += decoder.decode(value, { stream: true });
  }
  reader.cancel();

  const title = extractMeta(html, 'og:title') || extractTitle(html);
  const description = extractMeta(html, 'og:description') || extractMeta(html, 'description') || '';
  const image = extractMeta(html, 'og:image') || undefined;
  const siteName = extractMeta(html, 'og:site_name') || undefined;
  const ogType = extractMeta(html, 'og:type') || undefined;
  const author = extractMeta(html, 'author') || undefined;
  const contentPreview = extractBodyText(html);

  return {
    url: response.url,
    title: title || url,
    description,
    image,
    siteName,
    type: ogType,
    author,
    contentPreview,
    fetchedAt: new Date().toISOString(),
  };
}

// ── Public: searchWeb ─────────────────

export async function searchWeb(query: string, limit: number = 5): Promise<SearchResponse> {
  const url = `${SEARXNG_URL}/search?q=${encodeURIComponent(query)}&format=json&categories=general`;

  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`SearXNG returned HTTP ${response.status}`);
    }

    const data = await response.json() as {
      results?: Array<{ title?: string; url?: string; content?: string; engine?: string }>;
    };

    const results: SearchResult[] = (data.results || [])
      .slice(0, limit)
      .map(r => ({
        title: r.title || '',
        url: r.url || '',
        content: r.content || '',
        engine: r.engine || 'unknown',
      }));

    return { query, results, count: results.length };
  } catch (error) {
    console.error('[Web] Search error:', error);
    return { query, results: [], count: 0 };
  }
}
