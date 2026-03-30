import { NextRequest, NextResponse } from 'next/server';
import { apifyClient, APIFY_SOURCES, SourceKey } from '@/lib/apify/client';
import { ingestApifyData } from '@/lib/services/ingestion';

// Manual trigger: POST /api/scrape?source=marca
// Runs the Apify actor directly and ingests results
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sourceName = searchParams.get('source') as SourceKey | null;

    if (!sourceName || !(sourceName in APIFY_SOURCES)) {
      return NextResponse.json(
        {
          error: 'Invalid source. Available: ' + Object.keys(APIFY_SOURCES).join(', '),
        },
        { status: 400 }
      );
    }

    const config = APIFY_SOURCES[sourceName];

    // Run the Website Content Crawler actor
    const run = await apifyClient.actor('apify/website-content-crawler').call({
      startUrls: [{ url: config.startUrl }],
      crawlerType: 'cheerio',
      maxCrawlDepth: 2,
      maxCrawlPages: 30,
      includeUrlGlobs: [...config.includeGlobs],
      excludeUrlGlobs: [...config.excludeGlobs],
      saveHtml: false,
      saveMarkdown: true,
      removeElementsCssSelector: 'nav, footer, .ad, .publicidad, .ads, script, style, aside, .related-news, .comments',
    });

    if (run.status !== 'SUCCEEDED') {
      return NextResponse.json(
        { error: 'Apify run failed', status: run.status },
        { status: 500 }
      );
    }

    // Fetch results from the dataset
    const dataset = apifyClient.dataset(run.defaultDatasetId);
    const { items } = await dataset.listItems({ limit: 100 });

    // Ingest into our database
    const result = await ingestApifyData(sourceName, items as Record<string, unknown>[]);

    return NextResponse.json({
      success: true,
      apifyRunId: run.id,
      result,
    });
  } catch (error) {
    console.error('Scrape error:', error);
    return NextResponse.json(
      { error: 'Failed to run scraper' },
      { status: 500 }
    );
  }
}
