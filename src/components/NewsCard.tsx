'use client';

import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface Article {
  id: string;
  title: string;
  excerpt: string | null;
  url: string;
  imageUrl: string | null;
  author: string | null;
  publishedAt: string | null;
  scrapedAt: string;
  source: {
    name: string;
    label: string;
    country: string;
  };
  league: { name: string; label: string } | null;
}

interface NewsCardProps {
  article: Article;
  index: number;
  isFirst: boolean;
}

function timeAgo(date: string | null): string {
  if (!date) return '';
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: es });
  } catch {
    return '';
  }
}

function countryFlag(country: string): string {
  switch (country) {
    case 'es':
      return '🇪🇸';
    case 'ar':
      return '🇦🇷';
    default:
      return '🌐';
  }
}

export default function NewsCard({ article, index, isFirst }: NewsCardProps) {
  const hasImage = !!article.imageUrl;
  const time = timeAgo(article.publishedAt || article.scrapedAt);
  const isRecent =
    article.publishedAt &&
    Date.now() - new Date(article.publishedAt).getTime() < 3600000 * 3;

  return (
    <motion.a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: Math.min(index * 0.04, 0.5), duration: 0.5 }}
      className="snap-item group relative flex h-[calc(100vh-4rem)] w-full flex-col overflow-hidden"
    >
      {/* Background Image */}
      {hasImage ? (
        <>
          <div className="absolute inset-0">
            <img
              src={article.imageUrl!}
              alt=""
              className="h-full w-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.03]"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
          {/* Cinematic gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/10" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />
        </>
      ) : (
        /* No-image fallback */
        <div className="absolute inset-0 bg-gradient-to-br from-[#0F1012] via-obsidian to-[#0a1a12]">
          <div className="absolute inset-0 opacity-5">
            <div className="h-full w-full" style={{
              backgroundImage: 'radial-gradient(circle at 25% 25%, var(--color-accent) 1px, transparent 1px)',
              backgroundSize: '40px 40px'
            }} />
          </div>
        </div>
      )}

      {/* Top badges row */}
      <div className="relative z-10 flex items-center justify-between p-5 lg:p-6">
        {/* Source badge */}
        <div className="flex items-center gap-2 rounded-full bg-black/50 px-3 py-1.5 backdrop-blur-md border border-white/[0.08]">
          <div className="h-2 w-2 rounded-full bg-accent shrink-0" />
          <span className="text-xs font-semibold text-bone">
            {article.source.label}
          </span>
          <span className="text-sm leading-none">{countryFlag(article.source.country)}</span>
        </div>

        {/* Recent badge */}
        {isRecent && (
          <div className="flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1.5 backdrop-blur-md border border-accent/20">
            <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
            <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-accent">
              Reciente
            </span>
          </div>
        )}
      </div>

      {/* Spacer pushes content to bottom */}
      <div className="flex-1" />

      {/* Bottom content area */}
      <div className="relative z-10 p-5 pb-8 lg:p-6 lg:pb-10">
        {/* League tag */}
        {article.league && (
          <div className="mb-3 inline-flex items-center rounded-md bg-white/10 px-2.5 py-1 backdrop-blur-sm border border-white/[0.06]">
            <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-accent-light">
              {article.league.label}
            </span>
          </div>
        )}

        {/* Headline */}
        <h2 className="mb-3 text-2xl font-extrabold leading-[1.15] text-bone drop-shadow-lg transition-colors duration-300 group-hover:text-accent-light sm:text-3xl lg:text-4xl">
          {article.title}
        </h2>

        {/* Excerpt */}
        {article.excerpt && (
          <p className="mb-4 max-w-2xl text-sm leading-relaxed text-white/60 line-clamp-2 lg:text-base">
            {article.excerpt}
          </p>
        )}

        {/* Meta row */}
        <div className="flex items-center gap-3 text-xs text-white/40">
          {article.author && (
            <span className="font-medium text-white/55">{article.author}</span>
          )}
          {article.author && time && (
            <span className="h-1 w-1 rounded-full bg-white/20" />
          )}
          {time && <span>{time}</span>}
        </div>

        {/* "Read more" on hover */}
        <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-accent opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-1">
          <span>Leer artículo completo</span>
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
            />
          </svg>
        </div>
      </div>

      {/* Scroll hint on first card */}
      {isFirst && (
        <div className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2">
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className="flex flex-col items-center gap-1 text-white/25"
          >
            <span className="text-[9px] font-medium tracking-[0.2em] uppercase">
              Scroll
            </span>
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </motion.div>
        </div>
      )}
    </motion.a>
  );
}
