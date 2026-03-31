import { NextRequest, NextResponse } from 'next/server';
import { RSS_SOURCES, RssSourceKey } from '@/lib/rss/sources';
import { HTML_SOURCES, HtmlSourceKey } from '@/lib/scrapers/html-scraper';
import { ingestRssFeed } from '@/lib/services/rss-ingestion';
import { scrapeHtmlSource } from '@/lib/scrapers/html-scraper';

const ALL_SOURCES = { ...RSS_SOURCES, ...HTML_SOURCES };

// Manual trigger: POST /api/scrape?source=marca
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sourceName = searchParams.get('source');

    if (!sourceName || !(sourceName in ALL_SOURCES)) {
      return NextResponse.json(
        { error: 'Invalid source. Available: ' + Object.keys(ALL_SOURCES).join(', ') },
        { status: 400 }
      );
    }

    let result;
    if (sourceName in RSS_SOURCES) {
      result = await ingestRssFeed(sourceName as RssSourceKey);
    } else {
      result = await scrapeHtmlSource(sourceName as HtmlSourceKey);
    }

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('Scrape error:', error);
    return NextResponse.json({ error: 'Failed to run scraper' }, { status: 500 });
  }
}
