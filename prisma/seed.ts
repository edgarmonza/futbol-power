import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

// Use require for the generated client to avoid path resolution issues with tsx
const { PrismaClient } = require('../src/generated/prisma/client');

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // ---- Sources ----
  const sources = [
    { name: 'marca', label: 'Marca', country: 'es', url: 'https://www.marca.com' },
    { name: 'as', label: 'AS', country: 'es', url: 'https://as.com' },
    { name: 'mundo-deportivo', label: 'Mundo Deportivo', country: 'es', url: 'https://www.mundodeportivo.com' },
    { name: 'relevo', label: 'Relevo', country: 'es', url: 'https://www.relevo.com' },
    { name: 'ole', label: 'Olé', country: 'ar', url: 'https://www.ole.com.ar' },
    { name: 'tyc', label: 'TyC Sports', country: 'ar', url: 'https://www.tycsports.com' },
    { name: 'espn-ar', label: 'ESPN Argentina', country: 'ar', url: 'https://www.espn.com.ar' },
    { name: 'espn', label: 'ESPN', country: 'int', url: 'https://www.espn.com' },
    { name: 'goal', label: 'Goal', country: 'int', url: 'https://www.goal.com' },
    { name: 'transfermarkt', label: 'Transfermarkt', country: 'int', url: 'https://www.transfermarkt.es' },
  ];

  for (const source of sources) {
    await prisma.source.upsert({
      where: { name: source.name },
      update: source,
      create: source,
    });
  }
  console.log(`  ✓ ${sources.length} sources seeded`);

  // ---- Leagues ----
  const leagues = [
    { name: 'laliga', label: 'LaLiga EA Sports', country: 'es' },
    { name: 'laliga2', label: 'LaLiga Hypermotion', country: 'es' },
    { name: 'liga-profesional', label: 'Liga Profesional Argentina', country: 'ar' },
    { name: 'copa-argentina', label: 'Copa Argentina', country: 'ar' },
    { name: 'champions', label: 'UEFA Champions League', country: 'int' },
    { name: 'europa-league', label: 'UEFA Europa League', country: 'int' },
    { name: 'copa-libertadores', label: 'Copa Libertadores', country: 'int' },
    { name: 'copa-sudamericana', label: 'Copa Sudamericana', country: 'int' },
    { name: 'copa-del-rey', label: 'Copa del Rey', country: 'es' },
    { name: 'selecciones', label: 'Selecciones', country: 'int' },
  ];

  for (const league of leagues) {
    await prisma.league.upsert({
      where: { name: league.name },
      update: league,
      create: league,
    });
  }
  console.log(`  ✓ ${leagues.length} leagues seeded`);

  // ---- Tags ----
  const tags = [
    'transferencias', 'resultados', 'lesiones', 'champions',
    'laliga', 'liga-argentina', 'seleccion', 'mercado',
    'goles', 'analisis', 'opinion', 'fichajes',
    'mundial-2026', 'libertadores', 'clasico',
  ];

  for (const name of tags) {
    await prisma.tag.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log(`  ✓ ${tags.length} tags seeded`);

  // ---- Teams (main ones for Spain & Argentina) ----
  const laliga = await prisma.league.findUnique({ where: { name: 'laliga' } });
  const ligaArg = await prisma.league.findUnique({ where: { name: 'liga-profesional' } });

  const teams = [
    // Spain
    { name: 'Real Madrid', slug: 'real-madrid', shortName: 'RMA', country: 'es', leagueId: laliga?.id },
    { name: 'FC Barcelona', slug: 'fc-barcelona', shortName: 'BAR', country: 'es', leagueId: laliga?.id },
    { name: 'Atlético de Madrid', slug: 'atletico-madrid', shortName: 'ATM', country: 'es', leagueId: laliga?.id },
    { name: 'Athletic Club', slug: 'athletic-club', shortName: 'ATH', country: 'es', leagueId: laliga?.id },
    { name: 'Real Sociedad', slug: 'real-sociedad', shortName: 'RSO', country: 'es', leagueId: laliga?.id },
    { name: 'Real Betis', slug: 'real-betis', shortName: 'BET', country: 'es', leagueId: laliga?.id },
    { name: 'Villarreal CF', slug: 'villarreal', shortName: 'VIL', country: 'es', leagueId: laliga?.id },
    { name: 'Sevilla FC', slug: 'sevilla', shortName: 'SEV', country: 'es', leagueId: laliga?.id },
    { name: 'Valencia CF', slug: 'valencia', shortName: 'VAL', country: 'es', leagueId: laliga?.id },
    { name: 'Girona FC', slug: 'girona', shortName: 'GIR', country: 'es', leagueId: laliga?.id },
    // Argentina
    { name: 'Boca Juniors', slug: 'boca-juniors', shortName: 'BOC', country: 'ar', leagueId: ligaArg?.id },
    { name: 'River Plate', slug: 'river-plate', shortName: 'RIV', country: 'ar', leagueId: ligaArg?.id },
    { name: 'Racing Club', slug: 'racing-club', shortName: 'RAC', country: 'ar', leagueId: ligaArg?.id },
    { name: 'Independiente', slug: 'independiente', shortName: 'IND', country: 'ar', leagueId: ligaArg?.id },
    { name: 'San Lorenzo', slug: 'san-lorenzo', shortName: 'SLO', country: 'ar', leagueId: ligaArg?.id },
    { name: 'Vélez Sarsfield', slug: 'velez-sarsfield', shortName: 'VEL', country: 'ar', leagueId: ligaArg?.id },
    { name: 'Estudiantes LP', slug: 'estudiantes', shortName: 'EST', country: 'ar', leagueId: ligaArg?.id },
    { name: 'Talleres', slug: 'talleres', shortName: 'TAL', country: 'ar', leagueId: ligaArg?.id },
    { name: 'Huracán', slug: 'huracan', shortName: 'HUR', country: 'ar', leagueId: ligaArg?.id },
    { name: 'Argentinos Juniors', slug: 'argentinos-juniors', shortName: 'ARG', country: 'ar', leagueId: ligaArg?.id },
  ];

  for (const team of teams) {
    await prisma.team.upsert({
      where: { slug: team.slug },
      update: team,
      create: team,
    });
  }
  console.log(`  ✓ ${teams.length} teams seeded`);

  // ---- Standings (2024-25 season - realistic data) ----
  const allTeamsLaLiga = await prisma.team.findMany({ where: { leagueId: laliga?.id } });
  const allTeamsArg = await prisma.team.findMany({ where: { leagueId: ligaArg?.id } });

  // LaLiga 2024-25 realistic standings
  const laligaStandings = [
    { slug: 'fc-barcelona',    pos: 1,  p: 26, w: 19, d: 4,  l: 3,  gf: 62, ga: 25 },
    { slug: 'real-madrid',     pos: 2,  p: 26, w: 17, d: 5,  l: 4,  gf: 55, ga: 24 },
    { slug: 'atletico-madrid', pos: 3,  p: 26, w: 16, d: 6,  l: 4,  gf: 47, ga: 21 },
    { slug: 'athletic-club',   pos: 4,  p: 26, w: 13, d: 7,  l: 6,  gf: 39, ga: 27 },
    { slug: 'villarreal',      pos: 5,  p: 26, w: 13, d: 5,  l: 8,  gf: 45, ga: 36 },
    { slug: 'real-betis',      pos: 6,  p: 26, w: 11, d: 8,  l: 7,  gf: 35, ga: 30 },
    { slug: 'real-sociedad',   pos: 7,  p: 26, w: 10, d: 8,  l: 8,  gf: 30, ga: 28 },
    { slug: 'girona',          pos: 8,  p: 26, w: 9,  d: 7,  l: 10, gf: 34, ga: 38 },
    { slug: 'sevilla',         pos: 9,  p: 26, w: 8,  d: 8,  l: 10, gf: 28, ga: 33 },
    { slug: 'valencia',        pos: 10, p: 26, w: 5,  d: 8,  l: 13, gf: 22, ga: 38 },
  ];

  for (const s of laligaStandings) {
    const team = allTeamsLaLiga.find((t: { slug: string }) => t.slug === s.slug);
    if (team && laliga) {
      await prisma.standing.upsert({
        where: { season_teamId_leagueId: { season: '2024-25', teamId: team.id, leagueId: laliga.id } },
        update: { position: s.pos, played: s.p, won: s.w, drawn: s.d, lost: s.l, goalsFor: s.gf, goalsAgainst: s.ga, goalDiff: s.gf - s.ga, points: s.w * 3 + s.d },
        create: { season: '2024-25', position: s.pos, played: s.p, won: s.w, drawn: s.d, lost: s.l, goalsFor: s.gf, goalsAgainst: s.ga, goalDiff: s.gf - s.ga, points: s.w * 3 + s.d, teamId: team.id, leagueId: laliga.id },
      });
    }
  }
  console.log(`  ✓ ${laligaStandings.length} LaLiga standings seeded`);

  // Liga Profesional Argentina 2024-25 realistic standings
  const argStandings = [
    { slug: 'river-plate',       pos: 1,  p: 20, w: 13, d: 4,  l: 3,  gf: 35, ga: 15 },
    { slug: 'racing-club',       pos: 2,  p: 20, w: 12, d: 3,  l: 5,  gf: 30, ga: 18 },
    { slug: 'talleres',          pos: 3,  p: 20, w: 11, d: 5,  l: 4,  gf: 28, ga: 16 },
    { slug: 'boca-juniors',      pos: 4,  p: 20, w: 10, d: 5,  l: 5,  gf: 27, ga: 19 },
    { slug: 'huracan',           pos: 5,  p: 20, w: 10, d: 4,  l: 6,  gf: 25, ga: 20 },
    { slug: 'estudiantes',       pos: 6,  p: 20, w: 9,  d: 5,  l: 6,  gf: 24, ga: 22 },
    { slug: 'velez-sarsfield',   pos: 7,  p: 20, w: 8,  d: 6,  l: 6,  gf: 22, ga: 20 },
    { slug: 'independiente',     pos: 8,  p: 20, w: 7,  d: 6,  l: 7,  gf: 20, ga: 21 },
    { slug: 'san-lorenzo',       pos: 9,  p: 20, w: 5,  d: 7,  l: 8,  gf: 18, ga: 25 },
    { slug: 'argentinos-juniors',pos: 10, p: 20, w: 4,  d: 5,  l: 11, gf: 15, ga: 28 },
  ];

  for (const s of argStandings) {
    const team = allTeamsArg.find((t: { slug: string }) => t.slug === s.slug);
    if (team && ligaArg) {
      await prisma.standing.upsert({
        where: { season_teamId_leagueId: { season: '2024-25', teamId: team.id, leagueId: ligaArg.id } },
        update: { position: s.pos, played: s.p, won: s.w, drawn: s.d, lost: s.l, goalsFor: s.gf, goalsAgainst: s.ga, goalDiff: s.gf - s.ga, points: s.w * 3 + s.d },
        create: { season: '2024-25', position: s.pos, played: s.p, won: s.w, drawn: s.d, lost: s.l, goalsFor: s.gf, goalsAgainst: s.ga, goalDiff: s.gf - s.ga, points: s.w * 3 + s.d, teamId: team.id, leagueId: ligaArg.id },
      });
    }
  }
  console.log(`  ✓ ${argStandings.length} Liga Profesional standings seeded`);

  console.log('\nSeed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
