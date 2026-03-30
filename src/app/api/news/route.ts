import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '30'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const source = searchParams.get('source'); // filter by source name
    const country = searchParams.get('country'); // "es", "ar", "int"
    const league = searchParams.get('league'); // filter by league slug

    const where: Record<string, unknown> = {};

    if (source) {
      where.source = { name: source };
    }
    if (country) {
      where.source = { ...((where.source as object) || {}), country };
    }
    if (league) {
      where.league = { name: league };
    }

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        include: {
          source: { select: { name: true, label: true, country: true, logoUrl: true } },
          league: { select: { name: true, label: true } },
        },
        orderBy: [
          { publishedAt: 'desc' },
          { scrapedAt: 'desc' },
        ],
        take: limit,
        skip: offset,
      }),
      prisma.article.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      articles,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch news' },
      { status: 500 }
    );
  }
}
