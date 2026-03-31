import axios from 'axios';
import * as cheerio from 'cheerio';
import { prisma } from '@/lib/db/prisma';

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
};

export interface HtmlSource {
  name: string;
  label: string;
  country: 'es' | 'ar' | 'int';
  listingUrl: string;
  /** Regex que debe cumplir la URL para ser considerada un artículo */
  articlePattern: RegExp;
  /** Máximo de artículos a scrapear por ejecución */
  maxArticles: number;
}

export const HTML_SOURCES: Record<string, HtmlSource> = {
  as: {
    name: 'as',
    label: 'AS',
    country: 'es',
    listingUrl: 'https://as.com/futbol/',
    articlePattern: /as\.com\/futbol\/.+\/[a-z0-9-]+-[fn]202[0-9]/,
    maxArticles: 25,
  },
  relevo: {
    name: 'relevo',
    label: 'Relevo',
    country: 'es',
    listingUrl: 'https://www.relevo.com/futbol/',
    articlePattern: /relevo\.com\/futbol\/.+\/202[0-9]/,
    maxArticles: 25,
  },
};

export type HtmlSourceKey = keyof typeof HTML_SOURCES;

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
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (cleaned.length <= maxLength) return cleaned;
  return cleaned.slice(0, maxLength).replace(/\s+\S*$/, '') + '...';
}

/** Extrae los links de artículos de la página de listado */
async function extractArticleLinks(source: HtmlSource): Promise<string[]> {
  const { data } = await axios.get(source.listingUrl, { headers: HEADERS, timeout: 15000 });
  const $ = cheerio.load(data);

  const links = new Set<string>();
  $('a[href]').each((_, el) => {
    let href = $(el).attr('href') || '';
    // Normalizar URLs relativas
    if (href.startsWith('/')) href = new URL(href, source.listingUrl).toString();
    if (source.articlePattern.test(href)) links.add(href);
  });

  return [...links].slice(0, source.maxArticles);
}

/** Extrae los metadatos OG de una página de artículo */
async function extractArticleMeta(url: string) {
  const { data } = await axios.get(url, { headers: HEADERS, timeout: 15000 });
  const $ = cheerio.load(data);

  const og = (prop: string) => $(`meta[property="${prop}"]`).attr('content') || null;
  const meta = (name: string) => $(`meta[name="${name}"]`).attr('content') || null;

  const title = og('og:title') || $('title').text().trim() || null;
  const description = og('og:description') || meta('description') || null;
  const imageUrl = og('og:image') || null;
  const author = og('article:author') || meta('author') || null;
  const publishedTimeStr = og('article:published_time') || og('article:modified_time');
  const publishedAt = publishedTimeStr ? new Date(publishedTimeStr) : null;

  return { title, description, imageUrl, author, publishedAt };
}

export async function scrapeHtmlSource(sourceKey: HtmlSourceKey): Promise<IngestionResult> {
  const config = HTML_SOURCES[sourceKey];
  const result: IngestionResult = { source: sourceKey, total: 0, saved: 0, duplicates: 0, errors: 0 };

  const source = await prisma.source.findUnique({ where: { name: config.name } });
  if (!source) {
    console.warn(`[Scraper] Source "${config.name}" not found in DB. Run db:seed first.`);
    return result;
  }

  // 1. Obtener links de la página de listado
  let articleLinks: string[];
  try {
    articleLinks = await extractArticleLinks(config);
  } catch (err) {
    console.error(`[Scraper] Failed to fetch listing page for ${config.name}:`, err);
    result.errors++;
    return result;
  }

  result.total = articleLinks.length;

  // 2. Deduplicar contra DB en una sola query
  const existingArticles = await prisma.article.findMany({
    where: { url: { in: articleLinks } },
    select: { url: true },
  });
  const existingUrls = new Set(existingArticles.map(a => a.url));

  // 3. Scrapear y guardar cada artículo nuevo
  for (const url of articleLinks) {
    if (existingUrls.has(url)) { result.duplicates++; continue; }

    try {
      const meta = await extractArticleMeta(url);

      if (!meta.title || meta.title.length < 10) { result.errors++; continue; }

      const slug = slugify(meta.title) + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
      const excerpt = extractExcerpt(meta.description);

      await prisma.article.create({
        data: {
          title: meta.title,
          slug,
          excerpt,
          content: null,
          url,
          imageUrl: meta.imageUrl,
          author: meta.author,
          publishedAt: meta.publishedAt,
          sourceId: source.id,
        },
      });

      result.saved++;
    } catch (err) {
      console.error(`[Scraper] Error processing ${url}:`, err);
      result.errors++;
    }
  }

  console.log(`[Scraper] ${config.name}: ${result.saved} saved, ${result.duplicates} duplicates, ${result.errors} errors`);
  return result;
}
