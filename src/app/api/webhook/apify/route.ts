import { NextRequest, NextResponse } from 'next/server';
import { apifyClient } from '@/lib/apify/client';
import { ingestApifyData } from '@/lib/services/ingestion';

// Apify sends a webhook when a task/actor run finishes
// Payload includes: { resource: { defaultDatasetId, status, ... }, eventType, ... }
export async function POST(request: NextRequest) {
  try {
    // Verify webhook secret
    const webhookSecret = request.headers.get('x-apify-webhook-secret');
    if (webhookSecret !== process.env.APIFY_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { resource, eventData } = body;

    // Only process successful runs
    if (resource?.status !== 'SUCCEEDED') {
      return NextResponse.json({
        message: 'Run did not succeed, skipping',
        status: resource?.status,
      });
    }

    // Get source name from eventData (we'll set this in the Apify webhook config)
    const sourceName = eventData?.source;
    if (!sourceName) {
      return NextResponse.json(
        { error: 'Missing source name in eventData' },
        { status: 400 }
      );
    }

    // Fetch the dataset from the completed run
    const datasetId = resource.defaultDatasetId;
    const dataset = apifyClient.dataset(datasetId);
    const { items } = await dataset.listItems({ limit: 100 });

    // Process and save articles
    const result = await ingestApifyData(sourceName, items as Record<string, unknown>[]);

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
