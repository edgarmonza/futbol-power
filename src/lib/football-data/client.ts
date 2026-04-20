const BASE_URL = 'https://api.football-data.org/v4';
const API_KEY = process.env.FOOTBALL_DATA_API_KEY!;

async function fetchFD<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'X-Auth-Token': API_KEY },
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error(`football-data.org ${res.status}: ${await res.text()}`);
  }

  return res.json() as Promise<T>;
}

/* ── Types ── */

export interface FDTeam {
  id: number;
  name: string;
  shortName: string;
  tla: string;
  crest: string;
  area: { id: number; name: string; code: string; flag: string | null };
}

export interface FDScore {
  winner: 'HOME_TEAM' | 'AWAY_TEAM' | 'DRAW' | null;
  duration: string;
  fullTime: { home: number | null; away: number | null };
  halfTime: { home: number | null; away: number | null };
}

export interface FDMatch {
  id: number;
  utcDate: string;
  status: 'SCHEDULED' | 'LIVE' | 'IN_PLAY' | 'PAUSED' | 'FINISHED' | 'POSTPONED' | 'CANCELLED';
  stage: string;
  group: string | null;
  homeTeam: FDTeam;
  awayTeam: FDTeam;
  score: FDScore;
}

export interface FDStandingRow {
  position: number;
  team: FDTeam;
  playedGames: number;
  won: number;
  draw: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: string | null;
}

export interface FDGroup {
  stage: string;
  type: string;
  group: string;
  table: FDStandingRow[];
}

/* ── API calls ── */

export async function getWCMatches(teamId?: number): Promise<FDMatch[]> {
  const path = teamId
    ? `/competitions/WC/matches?status=SCHEDULED,LIVE,IN_PLAY,PAUSED,FINISHED&limit=10`
    : `/competitions/WC/matches?status=SCHEDULED,LIVE,IN_PLAY,PAUSED,FINISHED`;

  const data = await fetchFD<{ matches: FDMatch[] }>(path);
  const matches = data.matches;

  if (teamId) {
    return matches.filter(
      (m) => m.homeTeam.id === teamId || m.awayTeam.id === teamId
    );
  }

  return matches;
}

export async function getWCStandings(): Promise<FDGroup[]> {
  const data = await fetchFD<{ standings: FDGroup[] }>('/competitions/WC/standings');
  return data.standings;
}

export async function getWCTeams(): Promise<FDTeam[]> {
  const data = await fetchFD<{ teams: FDTeam[] }>('/competitions/WC/teams');
  return data.teams;
}
