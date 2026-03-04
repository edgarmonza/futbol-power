import { prisma } from '@/lib/db/prisma';

// Shape of data coming from Apify's Website Content Crawler
export interface ApifyArticleRaw {
  url?: string;
  crawl?: {
    loadedUrl?: string;
    httpStatusCode?: number;
    depth?: number;
    [key: string]: unknown;
  };
  metadata?: {
    title?: string;
    description?: string;
    author?: string;
    canonicalUrl?: string;
    openGraph?: Array<{ property: string; content: string }>;
    [key: string]: unknown;
  };
  text?: string;
  markdown?: string;
  [key: string]: unknown;
}

interface IngestionResult {
  source: string;
  total: number;
  saved: number;
  duplicates: number;
  errors: number;
}

// Extract a specific OpenGraph property from the OG array
function getOgValue(og: Array<{ property: string; content: string }> | undefined, property: string): string | null {
  if (!og) return null;
  const entry = og.find(item => item.property === property);
  return entry?.content || null;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 200);
}

function extractExcerpt(text: string | undefined | null, maxLength = 300): string | null {
  if (!text) return null;
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (cleaned.length <= maxLength) return cleaned;
  return cleaned.slice(0, maxLength).replace(/\s+\S*$/, '') + '...';
}

export async function ingestApifyData(
  sourceName: string,
  rawArticles: Record<string, unknown>[]
): Promise<IngestionResult> {
  const result: IngestionResult = {
    source: sourceName,
    total: rawArticles.length,
    saved: 0,
    duplicates: 0,
    errors: 0,
  };

  const source = await prisma.source.findUnique({
    where: { name: sourceName },
  });

  if (!source) {
    console.warn(`Source "${sourceName}" not found in DB, skipping ingestion.`);
    return result;
  }

  for (const item of rawArticles) {
    try {
      const raw = item as unknown as ApifyArticleRaw;
      const og = raw.metadata?.openGraph;

      // Get URL from crawl data or direct url
      const url = raw.crawl?.loadedUrl || raw.url;
      if (!url) {
        result.errors++;
        continue;
      }

      // Skip non-article pages (depth 0 = start page, or index pages)
      if (raw.crawl?.depth === 0) {
        continue;
      }

      // Get title from OG or metadata
      const title = getOgValue(og, 'og:title') || raw.metadata?.title;
      if (!title || title.length < 10) {
        result.errors++;
        continue;
      }

      // Check for duplicate
      const existing = await prisma.article.findUnique({
        where: { url },
      });

      if (existing) {
        result.duplicates++;
        continue;
      }

      // Extract all fields from OpenGraph metadata
      const imageUrl = getOgValue(og, 'og:image') || null;
      const description = getOgValue(og, 'og:description') || raw.metadata?.description;
      const author = getOgValue(og, 'article:author') || raw.metadata?.author || null;
      const publishedTimeStr = getOgValue(og, 'article:published_time') || getOgValue(og, 'article:modified_time');
      const publishedAt = publishedTimeStr ? new Date(publishedTimeStr) : null;

      const slug = slugify(title) + '-' + Date.now().toString(36);
      const excerpt = extractExcerpt(description || raw.text);

      await prisma.article.create({
        data: {
          title,
          slug,
          excerpt,
          content: raw.markdown || raw.text || null,
          url,
          imageUrl,
          author,
          publishedAt,
          sourceId: source.id,
        },
      });

      result.saved++;
    } catch (error) {
      console.error(`Error ingesting article:`, error);
      result.errors++;
    }
  }

  console.log(
    `[Ingestion] ${sourceName}: ${result.saved} saved, ${result.duplicates} duplicates, ${result.errors} errors`
  );

  return result;
}
