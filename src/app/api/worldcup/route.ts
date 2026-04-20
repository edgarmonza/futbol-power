import { NextRequest, NextResponse } from 'next/server';
import { getWCMatches, getWCStandings, getWCTeams } from '@/lib/football-data/client';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') ?? 'matches'; // matches | standings | teams
  const teamId = searchParams.get('teamId');

  try {
    if (type === 'standings') {
      const standings = await getWCStandings();
      return NextResponse.json({ success: true, standings });
    }

    if (type === 'teams') {
      const teams = await getWCTeams();
      return NextResponse.json({ success: true, teams });
    }

    // default: matches
    const matches = await getWCMatches(teamId ? parseInt(teamId) : undefined);
    return NextResponse.json({ success: true, matches });
  } catch (error) {
    console.error('[worldcup]', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
