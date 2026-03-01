import * as cheerio from 'cheerio';

export interface ScrapeResult {
  title: string;
  content: string;
  url: string;
  contentLength: number;
}

export async function scrapeUrl(url: string): Promise<ScrapeResult> {
  // Validate URL
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error('Invalid URL format');
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('Only HTTP and HTTPS URLs are supported');
  }

  // Fetch with timeout
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  let html: string;
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'SupportKit/1.0 (Knowledge Scraper)',
        'Accept': 'text/html,application/xhtml+xml',
      },
      redirect: 'follow',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: HTTP ${response.status}`);
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html') && !contentType.includes('text/plain')) {
      throw new Error('URL does not return HTML content');
    }

    html = await response.text();
  } finally {
    clearTimeout(timeout);
  }

  // Parse with Cheerio
  const $ = cheerio.load(html);

  // Extract title
  const pageTitle = $('title').first().text().trim()
    || $('h1').first().text().trim()
    || parsed.hostname;

  // Remove non-content elements
  $('script, style, noscript, iframe, svg, nav, footer, header, aside').remove();
  $('[role="navigation"], [role="banner"], [role="contentinfo"]').remove();
  $('.nav, .navbar, .footer, .sidebar, .menu, .ad, .advertisement, .cookie-banner').remove();

  // Find main content area
  let contentEl = $('main, article, [role="main"], .content, .post-content, .article-body').first();
  if (contentEl.length === 0) {
    contentEl = $('body');
  }

  // Extract and clean text
  let text = contentEl.text()
    .replace(/\s+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  // Cap at 50K characters
  const MAX_CHARS = 50000;
  if (text.length > MAX_CHARS) {
    text = text.substring(0, MAX_CHARS) + '\n\n[Content truncated]';
  }

  if (text.length < 50) {
    throw new Error('Could not extract meaningful content from this URL. The page may require JavaScript to render.');
  }

  return {
    title: pageTitle.substring(0, 200),
    content: text,
    url,
    contentLength: text.length,
  };
}
