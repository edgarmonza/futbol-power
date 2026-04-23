export interface RssSource {
  /** Debe coincidir con el campo `name` en la tabla sources de la DB */
  name: string;
  label: string;
  country: 'es' | 'ar' | 'int';
  /** URL del feed RSS */
  feedUrl: string;
}

export const RSS_SOURCES: Record<string, RssSource> = {
  marca: {
    name: 'marca',
    label: 'Marca',
    country: 'es',
    feedUrl: 'https://e00-marca.uecdn.es/rss/futbol/primera-division.xml',
  },
  'mundo-deportivo': {
    name: 'mundo-deportivo',
    label: 'Mundo Deportivo',
    country: 'es',
    feedUrl: 'https://www.mundodeportivo.com/rss/futbol.xml',
  },
  ole: {
    name: 'ole',
    label: 'Olé',
    country: 'ar',
    feedUrl: 'https://www.ole.com.ar/rss/',
  },
  espn: {
    name: 'espn',
    label: 'ESPN',
    country: 'int',
    feedUrl: 'https://www.espn.com/espn/rss/soccer/news',
  },
};

export type RssSourceKey = keyof typeof RSS_SOURCES;
