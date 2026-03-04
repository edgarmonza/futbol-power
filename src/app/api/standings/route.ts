import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const league = searchParams.get('league');
    const season = searchParams.get('season') || '2024-25';

    const where: Record<string, unknown> = { season };
    if (league) {
      where.league = { name: league };
    }

    const standings = await prisma.standing.findMany({
      where,
      include: {
        team: { select: { id: true, name: true, shortName: true, slug: true, logoUrl: true } },
        league: { select: { id: true, name: true, label: true, country: true } },
      },
      orderBy: [{ leagueId: 'asc' }, { position: 'asc' }],
    });

    // Group by league
    const grouped: Record<string, {
      league: { id: string; name: string; label: string; country: string };
      standings: typeof standings;
    }> = {};

    for (const s of standings) {
      if (!grouped[s.league.name]) {
        grouped[s.league.name] = { league: s.league, standings: [] };
      }
      grouped[s.league.name].standings.push(s);
    }

    return NextResponse.json({
      success: true,
      season,
      data: Object.values(grouped),
    });
  } catch (error) {
    console.error('Error fetching standings:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch standings' }, { status: 500 });
  }
}
