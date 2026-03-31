import { NextRequest, NextResponse } from 'next/server';
import { RSS_SOURCES, RssSourceKey } from '@/lib/rss/sources';
import { ingestRssFeed } from '@/lib/services/rss-ingestion';

// Manual trigger: POST /api/scrape?source=marca
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sourceName = searchParams.get('source') as RssSourceKey | null;

    if (!sourceName || !(sourceName in RSS_SOURCES)) {
      return NextResponse.json(
        { error: 'Invalid source. Available: ' + Object.keys(RSS_SOURCES).join(', ') },
        { status: 400 }
      );
    }

    const result = await ingestRssFeed(sourceName);

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('Scrape error:', error);
    return NextResponse.json({ error: 'Failed to run scraper' }, { status: 500 });
  }
}
