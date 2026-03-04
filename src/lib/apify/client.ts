import { ApifyClient } from 'apify-client';

if (!process.env.APIFY_API_TOKEN) {
  throw new Error('Missing APIFY_API_TOKEN environment variable');
}

export const apifyClient = new ApifyClient({
  token: process.env.APIFY_API_TOKEN,
});

// Source configurations for Apify scraping
// includeGlobs filter for actual article URLs (with dates/slugs), not section pages
// excludeGlobs filter out nav pages, category indexes, multimedia, etc.
export const APIFY_SOURCES = {
  marca: {
    label: 'Marca',
    country: 'es',
    baseUrl: 'https://www.marca.com',
    startUrl: 'https://www.marca.com/futbol.html',
    includeGlobs: ['https://www.marca.com/futbol/**/202*/**/*.html'],
    excludeGlobs: ['**?intcmp=**', '**/multimedia/**', '**/video/**'],
  },
  as: {
    label: 'AS',
    country: 'es',
    baseUrl: 'https://as.com',
    startUrl: 'https://as.com/futbol/',
    includeGlobs: ['https://as.com/futbol/**/n/**', 'https://as.com/futbol/**/*-n/'],
    excludeGlobs: ['**/video/**', '**/galeria/**'],
  },
  'mundo-deportivo': {
    label: 'Mundo Deportivo',
    country: 'es',
    baseUrl: 'https://www.mundodeportivo.com',
    startUrl: 'https://www.mundodeportivo.com/futbol',
    includeGlobs: ['https://www.mundodeportivo.com/futbol/**/**/202*/**'],
    excludeGlobs: ['**/video/**', '**/galeria/**'],
  },
  relevo: {
    label: 'Relevo',
    country: 'es',
    baseUrl: 'https://www.relevo.com',
    startUrl: 'https://www.relevo.com/futbol',
    includeGlobs: ['https://www.relevo.com/futbol/**-202*'],
    excludeGlobs: [],
  },
  ole: {
    label: 'Olé',
    country: 'ar',
    baseUrl: 'https://www.ole.com.ar',
    startUrl: 'https://www.ole.com.ar/futbol',
    includeGlobs: ['https://www.ole.com.ar/futbol/**/*.html'],
    excludeGlobs: ['**/video/**'],
  },
  tyc: {
    label: 'TyC Sports',
    country: 'ar',
    baseUrl: 'https://www.tycsports.com',
    startUrl: 'https://www.tycsports.com/futbol',
    includeGlobs: ['https://www.tycsports.com/futbol/**-id*.html'],
    excludeGlobs: [],
  },
  'espn-ar': {
    label: 'ESPN Argentina',
    country: 'ar',
    baseUrl: 'https://www.espn.com.ar',
    startUrl: 'https://www.espn.com.ar/futbol/',
    includeGlobs: ['https://www.espn.com.ar/futbol/*/nota/_/**'],
    excludeGlobs: [],
  },
  espn: {
    label: 'ESPN',
    country: 'int',
    baseUrl: 'https://www.espn.com',
    startUrl: 'https://www.espn.com/soccer/',
    includeGlobs: ['https://www.espn.com/soccer/story/_/**'],
    excludeGlobs: [],
  },
  goal: {
    label: 'Goal',
    country: 'int',
    baseUrl: 'https://www.goal.com',
    startUrl: 'https://www.goal.com/es',
    includeGlobs: ['https://www.goal.com/es/**/*-*'],
    excludeGlobs: ['**/live-scores/**', '**/fixtures/**', '**/standings/**'],
  },
  transfermarkt: {
    label: 'Transfermarkt',
    country: 'int',
    baseUrl: 'https://www.transfermarkt.es',
    startUrl: 'https://www.transfermarkt.es',
    includeGlobs: ['https://www.transfermarkt.es/**-news/**'],
    excludeGlobs: [],
  },
} as const;

export type SourceKey = keyof typeof APIFY_SOURCES;
