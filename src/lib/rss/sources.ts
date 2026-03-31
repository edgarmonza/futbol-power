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
};

export type RssSourceKey = keyof typeof RSS_SOURCES;
