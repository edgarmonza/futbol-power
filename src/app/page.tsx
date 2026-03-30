'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import NewsCard from '@/components/NewsCard';
import LeagueCard from '@/components/LeagueCard';
import SourceCard from '@/components/SourceCard';
import ContextPanel from '@/components/ContextPanel';
import FutbolPowerLoader from '@/components/FutbolPowerLoader';

/* ── Types ── */

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

interface LeagueWithTeams {
  id: string;
  name: string;
  label: string;
  country: string;
  articleCount: number;
  teams: { id: string; name: string; shortName: string | null; slug: string }[];
}

interface StandingRow {
  id: string;
  position: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
  team: { id: string; name: string; shortName: string | null; slug: string };
}

interface LeagueStandings {
  league: { id: string; name: string; label: string; country: string };
  standings: StandingRow[];
}

/* ── Card union for carousel ── */
type CarouselItem =
  | { type: 'news'; data: Article }
  | { type: 'league'; data: LeagueWithTeams }
  | { type: 'source'; data: { id: string; name: string; label: string; country: string; url: string; articleCount: number; recentArticles: Article[] } };

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [sources, setSources] = useState<SourceWithCount[]>([]);
  const [leagues, setLeagues] = useState<LeagueWithTeams[]>([]);
  const [standings, setStandings] = useState<LeagueStandings[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCountry, setActiveCountry] = useState('all');
  const [activeSource, setActiveSource] = useState<string | null>(null);
  const [activeLeague, setActiveLeague] = useState<string | null>(null);
  const [totalArticles, setTotalArticles] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const feedRef = useRef<HTMLDivElement>(null);

  // Fetch sources + leagues + standings on mount
  useEffect(() => {
    fetch('/api/sources')
      .then((res) => res.json())
      .then((data) => { if (data.success) setSources(data.sources); })
      .catch(console.error);

    fetch('/api/leagues')
      .then((res) => res.json())
      .then((data) => { if (data.success) setLeagues(data.leagues); })
      .catch(console.error);

    fetch('/api/standings')
      .then((res) => res.json())
      .then((data) => { if (data.success) setStandings(data.data); })
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

  useEffect(() => { fetchArticles(); }, [fetchArticles]);

  // Scroll feed to start when filters change
  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
    setCurrentIndex(0);
  }, [activeCountry, activeSource, activeLeague]);

  // Track scroll position for context panel sync
  useEffect(() => {
    const container = feedRef.current;
    if (!container) return;
    const handleScroll = () => {
      const cardWidth = container.offsetWidth;
      if (cardWidth === 0) return;
      const idx = Math.round(container.scrollLeft / cardWidth);
      setCurrentIndex(idx);
    };
    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [articles]);

  function handleCountryChange(country: string) {
    setActiveCountry(country);
    setActiveSource(null);
    setActiveLeague(null);
  }

  // Build mixed carousel items
  const carouselItems: CarouselItem[] = [];
  if (articles.length > 0) {
    const filteredLeagues = leagues.filter(
      (l) => l.articleCount > 0 && (activeCountry === 'all' || l.country === activeCountry)
    );
    const filteredSources = sources
      .filter((s) => s._count.articles > 0 && (activeCountry === 'all' || s.country === activeCountry))
      .map((s) => ({
        id: s.id,
        name: s.name,
        label: s.label,
        country: s.country,
        url: s.url,
        articleCount: s._count.articles,
        recentArticles: articles.filter((a) => a.source.name === s.name).slice(0, 5),
      }));

    let leagueIdx = 0;
    let sourceIdx = 0;

    articles.forEach((article, i) => {
      if (i > 0 && i % 4 === 0 && leagueIdx < filteredLeagues.length) {
        carouselItems.push({ type: 'league', data: filteredLeagues[leagueIdx++] });
      }
      if (i > 0 && i % 7 === 0 && sourceIdx < filteredSources.length) {
        carouselItems.push({ type: 'source', data: filteredSources[sourceIdx++] });
      }
      carouselItems.push({ type: 'news', data: article });
    });
  }

  // Get current item for context panel
  const currentItem = carouselItems[currentIndex] || null;
  const currentArticle = currentItem?.type === 'news' ? currentItem.data : null;

  // Source options for header filters
  const sourceOptions = sources.map((s) => ({
    name: s.name,
    label: s.label,
    country: s.country,
    articleCount: s._count.articles,
  }));
  const leagueOptions = leagues.map((l) => ({
    name: l.name,
    label: l.label,
    country: l.country,
  }));

  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden noise-overlay" style={{ '--header-h': '88px' } as React.CSSProperties}>
      {/* Header — fixed ~88px (2 rows) */}
      <Header
        activeCountry={activeCountry}
        onCountryChange={handleCountryChange}
        totalArticles={totalArticles}
        leagues={leagueOptions}
        sources={sourceOptions}
        activeLeague={activeLeague}
        onLeagueChange={setActiveLeague}
        activeSource={activeSource}
        onSourceChange={setActiveSource}
      />

      {/* Main 3-Column Layout */}
      <div className="flex-1 min-h-0 pt-[88px] grid grid-cols-1 lg:grid-cols-[280px_1fr_320px] overflow-hidden">
        {/* Left Sidebar — Standings Tables */}
        <div className="hidden lg:block border-r border-white/5">
          <Sidebar standingsData={standings} />
        </div>

        {/* Center Feed — Horizontal Carousel */}
        <main className="relative overflow-hidden">
          {loading ? (
            <FutbolPowerLoader />
          ) : carouselItems.length === 0 ? (
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
            <>
              {/* Fade edges */}
              <div className="feed-fade-left" />
              <div className="feed-fade-right" />

              {/* Horizontal Snap Carousel */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${activeCountry}-${activeSource}-${activeLeague}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  ref={feedRef}
                  className="snap-x-container h-full"
                >
                  {carouselItems.map((item, i) => {
                    if (item.type === 'league') {
                      return (
                        <LeagueCard
                          key={`league-${item.data.id}`}
                          league={item.data}
                          index={i}
                        />
                      );
                    }
                    if (item.type === 'source') {
                      return (
                        <SourceCard
                          key={`source-${item.data.id}`}
                          source={item.data}
                          index={i}
                        />
                      );
                    }
                    return (
                      <NewsCard
                        key={item.data.id}
                        article={item.data}
                        index={i}
                        isFirst={i === 0}
                      />
                    );
                  })}
                </motion.div>
              </AnimatePresence>

              {/* Carousel position indicator */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 rounded-full bg-[rgba(11,11,16,0.8)] backdrop-blur-md px-4 py-2 border border-white/5">
                <span className="text-[10px] font-bold tabular-nums text-accent">
                  {currentIndex + 1}
                </span>
                <div className="h-0.5 w-8 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-accent transition-all duration-300"
                    style={{ width: `${((currentIndex + 1) / carouselItems.length) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] tabular-nums text-[#6B7280]">
                  {carouselItems.length}
                </span>
              </div>
            </>
          )}
        </main>

        {/* Right Context Panel */}
        <div className="hidden lg:block">
          <ContextPanel
            articles={articles}
            sources={sources}
            totalArticles={totalArticles}
            currentArticle={currentArticle}
          />
        </div>
      </div>
    </div>
  );
}
