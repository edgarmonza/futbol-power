'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Clock, ChevronRight, ArrowUpRight } from 'lucide-react';

interface Article {
  id: string;
  title: string;
  excerpt: string | null;
  url: string;
  imageUrl: string | null;
  author: string | null;
  publishedAt: string | null;
  scrapedAt: string;
  source: { name: string; label: string; country: string };
  league: { name: string; label: string } | null;
}

interface NewsCardProps {
  article: Article;
  index: number;
  isFirst: boolean;
}

function timeAgo(date: string | null): string {
  if (!date) return '';
  try { return formatDistanceToNow(new Date(date), { addSuffix: true, locale: es }); }
  catch { return ''; }
}

/* Source → brand gradient for text-first cards */
const SOURCE_THEME: Record<string, { from: string; to: string; accent: string }> = {
  espn:           { from: '#3a0a0a', to: '#0b0b10', accent: '#f87171' },
  'espn-ar':      { from: '#3a0a0a', to: '#0b0b10', accent: '#f87171' },
  marca:          { from: '#0a1a3a', to: '#0b0b10', accent: '#60a5fa' },
  as:             { from: '#2a1000', to: '#0b0b10', accent: '#fb923c' },
  ole:            { from: '#0a1a2a', to: '#0b0b10', accent: '#38bdf8' },
  relevo:         { from: '#0a2a18', to: '#0b0b10', accent: '#34d399' },
  'mundo-deportivo': { from: '#0a1a3a', to: '#0b0b10', accent: '#818cf8' },
  transformarkt:  { from: '#1a1a00', to: '#0b0b10', accent: '#facc15' },
  goal:           { from: '#0f1a0f', to: '#0b0b10', accent: '#4ade80' },
};

function getSourceTheme(name: string) {
  return SOURCE_THEME[name] ?? { from: '#0a1a12', to: '#0b0b10', accent: '#34d399' };
}

export default function NewsCard({ article, index, isFirst }: NewsCardProps) {
  const hasImage = !!article.imageUrl;
  const [imgError, setImgError] = useState(false);
  const showImage = hasImage && !imgError;
  const time = timeAgo(article.publishedAt || article.scrapedAt);
  const isRecent = article.publishedAt &&
    Date.now() - new Date(article.publishedAt).getTime() < 3600000 * 3;
  const theme = getSourceTheme(article.source.name);

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: Math.min(index * 0.06, 0.5), duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="snap-x-item w-full flex-shrink-0 p-3 lg:p-4"
    >
      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group block h-full rounded-[28px] overflow-hidden border border-white/5 hover:border-white/12 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        style={{ background: '#0F1012' }}
      >
        {showImage ? (
          /* ── IMAGE-FIRST LAYOUT ── */
          <div className="relative h-full flex flex-col">
            {/* Hero image — 55% of card height */}
            <div className="relative overflow-hidden" style={{ height: '55%' }}>
              <img
                src={article.imageUrl!}
                alt=""
                className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                onError={() => setImgError(true)}
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F1012] via-[#0F1012]/30 to-transparent" />

              {/* Badges row */}
              <div className="absolute top-4 left-4 right-4 flex items-start justify-between gap-2 z-10">
                {article.league ? (
                  <span className="inline-flex items-center rounded-full bg-accent/20 backdrop-blur-md px-3 py-1 text-[9px] font-bold tracking-[0.12em] uppercase text-accent border border-accent/15">
                    {article.league.label}
                  </span>
                ) : <span />}
                <span className="inline-flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-[9px] font-semibold tracking-[0.1em] uppercase text-bone/80 border border-white/8">
                  {article.source.label}
                </span>
              </div>

              {isRecent && (
                <div className="absolute bottom-4 right-4 z-10 flex items-center gap-1.5 rounded-full bg-red/15 backdrop-blur-md px-2.5 py-1 border border-red/20">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red" />
                  </span>
                  <span className="text-[8px] font-bold tracking-[0.2em] uppercase text-red">RECIENTE</span>
                </div>
              )}
            </div>

            {/* Content — remaining 45% */}
            <div className="flex flex-1 flex-col justify-between px-5 py-4 lg:px-6 lg:py-5">
              <div>
                <p className="text-[9px] font-semibold tracking-[0.25em] uppercase mb-1.5" style={{ color: theme.accent }}>
                  {article.source.label}
                </p>
                <h2
                  className="text-xl lg:text-2xl font-bold text-bone tracking-tight leading-[1.2] group-hover:text-accent transition-colors duration-300 line-clamp-3"
                  style={{ fontFamily: 'var(--font-editorial), var(--font-sans), serif' }}
                >
                  {article.title}
                </h2>
                {article.excerpt && (
                  <p className="text-[13px] text-[#6B7280] mt-2 leading-relaxed line-clamp-2">
                    {article.excerpt}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                <div className="flex items-center gap-1.5 text-[#4B5563]">
                  <Clock className="h-3 w-3" />
                  <span className="text-[11px]">{time || 'Reciente'}</span>
                  {article.league && (
                    <span className="ml-2 text-[11px] text-[#4B5563]">· {article.league.label}</span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-[#4B5563] group-hover:text-accent transition-colors duration-300">
                  <span className="text-[10px] font-semibold tracking-[0.1em] uppercase">Leer</span>
                  <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform duration-300" />
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ── TEXT-FIRST LAYOUT (no image) — Cinema Dark style ── */
          <div
            className="relative h-full flex flex-col overflow-hidden"
            style={{ background: '#0a0a0c' }}
          >
            {/* Ambient light blobs — animated, source-color */}
            <div
              className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full opacity-[0.18] blur-[80px] animate-blob-1"
              style={{ background: theme.accent }}
            />
            <div
              className="pointer-events-none absolute -bottom-16 -right-16 h-56 w-56 rounded-full opacity-[0.12] blur-[60px] animate-blob-2"
              style={{ background: theme.accent }}
            />

            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${theme.accent}80, transparent)` }} />

            {/* Content */}
            <div className="relative z-10 flex flex-1 flex-col justify-between p-6 lg:p-8">
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-1.5">
                  {article.league && (
                    <span
                      className="inline-flex w-fit items-center rounded-full px-3 py-1 text-[9px] font-bold tracking-[0.15em] uppercase border"
                      style={{ color: theme.accent, borderColor: `${theme.accent}30`, background: `${theme.accent}12` }}
                    >
                      {article.league.label}
                    </span>
                  )}
                  <span className="text-[9px] font-semibold tracking-[0.2em] uppercase text-white/35">
                    {article.source.label}
                  </span>
                </div>

                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-transform duration-200 group-hover:scale-110"
                  style={{ borderColor: `${theme.accent}40`, background: `${theme.accent}12` }}
                >
                  <ArrowUpRight className="h-3.5 w-3.5" style={{ color: theme.accent }} />
                </div>
              </div>

              {/* Title — editorial hero text */}
              <div className="my-auto py-6">
                <h2
                  className="text-2xl lg:text-3xl xl:text-[2rem] font-bold tracking-tight leading-[1.15] text-white"
                  style={{ fontFamily: 'var(--font-editorial), var(--font-sans), serif' }}
                >
                  {article.title}
                </h2>
                {article.excerpt && (
                  <p className="mt-4 text-sm leading-relaxed text-white/35 line-clamp-3">
                    {article.excerpt}
                  </p>
                )}
              </div>

              {/* Footer — CTA always visible (not hover-only) */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white/25">
                  <Clock className="h-3 w-3" />
                  <span className="text-[11px]">{time || 'Reciente'}</span>
                </div>
                <span
                  className="text-[10px] font-bold tracking-[0.15em] uppercase transition-opacity duration-200"
                  style={{ color: theme.accent }}
                >
                  Leer artículo →
                </span>
              </div>
            </div>
          </div>
        )}
      </a>

      {/* Scroll hint on first card */}
      {isFirst && (
        <motion.div
          animate={{ x: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 text-white/20 pointer-events-none"
        >
          <span className="text-[9px] font-medium tracking-[0.25em] uppercase">Desliza</span>
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </motion.div>
      )}
    </motion.div>
  );
}

