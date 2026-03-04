import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
  try {
    const sources = await prisma.source.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        label: true,
        country: true,
        url: true,
        logoUrl: true,
        _count: { select: { articles: true } },
      },
      orderBy: { label: 'asc' },
    });

    return NextResponse.json({ success: true, sources });
  } catch (error) {
    console.error('Error fetching sources:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sources' },
      { status: 500 }
    );
  }
}
