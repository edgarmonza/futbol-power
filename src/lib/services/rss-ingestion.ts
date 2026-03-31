import Parser from 'rss-parser';
import { prisma } from '@/lib/db/prisma';
import { RSS_SOURCES, RssSourceKey } from '@/lib/rss/sources';

const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'mediaContent', { keepArray: false }],
      ['media:thumbnail', 'mediaThumbnail', { keepArray: false }],
      ['enclosure', 'enclosure', { keepArray: false }],
    ],
  },
});

interface IngestionResult {
  source: string;
  total: number;
  saved: number;
  duplicates: number;
  errors: number;
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
  // Strip HTML tags that some feeds include in descriptions
  const stripped = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  if (stripped.length <= maxLength) return stripped;
  return stripped.slice(0, maxLength).replace(/\s+\S*$/, '') + '...';
}

function extractImageUrl(item: Record<string, unknown>): string | null {
  // media:content (common in Marca, AS)
  const mediaContent = item.mediaContent as { $?: { url?: string } } | undefined;
  if (mediaContent?.$?.url) return mediaContent.$.url;

  // media:thumbnail
  const mediaThumbnail = item.mediaThumbnail as { $?: { url?: string } } | undefined;
  if (mediaThumbnail?.$?.url) return mediaThumbnail.$.url;

  // enclosure (podcasts / some news feeds)
  const enclosure = item.enclosure as { url?: string; type?: string } | undefined;
  if (enclosure?.url && enclosure.type?.startsWith('image/')) return enclosure.url;

  return null;
}

export async function ingestRssFeed(sourceKey: RssSourceKey): Promise<IngestionResult> {
  const config = RSS_SOURCES[sourceKey];
  const result: IngestionResult = { source: sourceKey, total: 0, saved: 0, duplicates: 0, errors: 0 };

  const source = await prisma.source.findUnique({ where: { name: config.name } });
  if (!source) {
    console.warn(`[RSS] Source "${config.name}" not found in DB. Run db:seed first.`);
    return result;
  }

  let feed;
  try {
    feed = await parser.parseURL(config.feedUrl);
  } catch (err) {
    console.error(`[RSS] Failed to fetch feed for ${config.name}:`, err);
    result.errors++;
    return result;
  }

  result.total = feed.items.length;

  // Fetch all existing URLs in a single query instead of one per article
  const candidateUrls = feed.items.map(i => i.link).filter((u): u is string => !!u);
  const existingArticles = await prisma.article.findMany({
    where: { url: { in: candidateUrls } },
    select: { url: true },
  });
  const existingUrls = new Set(existingArticles.map(a => a.url));

  for (const item of feed.items) {
    try {
      const url = item.link;
      if (!url) { result.errors++; continue; }

      const title = item.title?.trim();
      if (!title || title.length < 10) { result.errors++; continue; }

      // Deduplicacion por URL
      if (existingUrls.has(url)) { result.duplicates++; continue; }

      const imageUrl = extractImageUrl(item as unknown as Record<string, unknown>);
      const excerpt = extractExcerpt(item.contentSnippet || item.content);
      const publishedAt = item.pubDate ? new Date(item.pubDate) : null;
      const author = item.creator || item.author || null;
      const slug = slugify(title) + '-' + Date.now().toString(36);

      await prisma.article.create({
        data: {
          title,
          slug,
          excerpt,
          content: null,
          url,
          imageUrl,
          author,
          publishedAt,
          sourceId: source.id,
        },
      });

      result.saved++;
    } catch (err) {
      console.error(`[RSS] Error saving article:`, err);
      result.errors++;
    }
  }

  console.log(`[RSS] ${config.name}: ${result.saved} saved, ${result.duplicates} duplicates, ${result.errors} errors`);
  return result;
}
