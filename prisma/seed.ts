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
