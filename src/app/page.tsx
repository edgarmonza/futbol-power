'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import NewsCard from '@/components/NewsCard';
import ContextPanel from '@/components/ContextPanel';

interface Source {
  name: string;
  label: string;
  country: string;
  logoUrl: string | null;
}

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  url: string;
  imageUrl: string | null;
  author: string | null;
  publishedAt: string | null;
  scrapedAt: string;
  source: Source;
  league: { name: string; label: string } | null;
}

interface SourceWithCount {
  id: string;
  name: string;
  label: string;
  country: string;
  url: string;
  logoUrl: string | null;
  _count: { articles: number };
}

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [sources, setSources] = useState<SourceWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCountry, setActiveCountry] = useState('all');
  const [activeSource, setActiveSource] = useState<string | null>(null);
  const [activeLeague, setActiveLeague] = useState<string | null>(null);
  const [totalArticles, setTotalArticles] = useState(0);
  const feedRef = useRef<HTMLDivElement>(null);

  // Fetch sources on mount
  useEffect(() => {
    fetch('/api/sources')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setSources(data.sources);
      })
      .catch(console.error);
  }, []);

  // Fetch articles when filters change
  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '50', offset: '0' });
      if (activeCountry !== 'all') params.set('country', activeCountry);
      if (activeSource) params.set('source', activeSource);
      if (activeLeague) params.set('league', activeLeague);

      const res = await fetch(`/api/news?${params}`);
      const data = await res.json();

      if (data.success) {
        setArticles(data.articles);
        setTotalArticles(data.pagination.total);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  }, [activeCountry, activeSource, activeLeague]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  // Scroll feed to top when filters change
  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeCountry, activeSource, activeLeague]);

  function handleCountryChange(country: string) {
    setActiveCountry(country);
    setActiveSource(null);
    setActiveLeague(null);
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden noise-overlay">
      {/* Header */}
      <Header
        activeCountry={activeCountry}
        onCountryChange={handleCountryChange}
        totalArticles={totalArticles}
      />

      {/* Main 3-Column Layout */}
      <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-[280px_1fr_320px]">
        {/* Left Sidebar — hidden on mobile */}
        <div className="hidden lg:block">
          <Sidebar
            sources={sources}
            activeSource={activeSource}
            onSourceChange={setActiveSource}
            activeLeague={activeLeague}
            onLeagueChange={setActiveLeague}
          />
        </div>

        {/* Center Feed */}
        <main className="relative overflow-hidden">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <div className="relative h-14 w-14">
                  <div className="absolute inset-0 rounded-2xl bg-accent/20 animate-ping" />
                  <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 border border-accent/20">
                    <span className="text-2xl">⚽</span>
                  </div>
                </div>
                <div className="text-sm font-medium text-cool-gray">
                  Cargando noticias...
                </div>
              </div>
            </div>
          ) : articles.length === 0 ? (
            /* Empty State */
            <div className="flex h-full flex-col items-center justify-center p-8 text-center">
              <div className="mb-6 relative">
                <div className="absolute inset-0 rounded-3xl bg-accent/10 blur-2xl" />
                <div className="relative text-7xl">⚽</div>
              </div>
              <h2 className="mb-2 text-2xl font-bold text-bone">
                No hay noticias aún
              </h2>
              <p className="mb-6 max-w-sm text-sm leading-relaxed text-cool-gray">
                Configura tus fuentes en Apify y ejecuta el primer scrape para
                ver las noticias aquí.
              </p>
              <code className="rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] px-5 py-3 text-xs font-medium text-accent">
                POST /api/scrape?source=marca
              </code>
            </div>
          ) : (
            /* Scroll-Snap News Feed */
            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeCountry}-${activeSource}-${activeLeague}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                ref={feedRef}
                className="snap-scroll-container h-full"
              >
                {articles.map((article, i) => (
                  <NewsCard
                    key={article.id}
                    article={article}
                    index={i}
                    isFirst={i === 0}
                  />
                ))}
              </motion.div>
            </AnimatePresence>
          )}
        </main>

        {/* Right Context Panel — hidden on mobile */}
        <div className="hidden lg:block">
          <ContextPanel
            articles={articles}
            sources={sources}
            totalArticles={totalArticles}
          />
        </div>
      </div>
    </div>
  );
}
