import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
  try {
    const leagues = await prisma.league.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        label: true,
        country: true,
        teams: {
          select: {
            id: true,
            name: true,
            shortName: true,
            slug: true,
          },
          orderBy: { name: 'asc' },
        },
        _count: { select: { articles: true } },
      },
      orderBy: { label: 'asc' },
    });

    const formatted = leagues.map((l) => ({
      id: l.id,
      name: l.name,
      label: l.label,
      country: l.country,
      articleCount: l._count.articles,
      teams: l.teams,
    }));

    return NextResponse.json({ success: true, leagues: formatted });
  } catch (error) {
    console.error('Error fetching leagues:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch leagues' },
      { status: 500 }
    );
  }
}
