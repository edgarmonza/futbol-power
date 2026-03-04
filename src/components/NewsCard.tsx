'use client';

import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { User, Clock, Trophy, ChevronRight } from 'lucide-react';

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
    case 'es': return '🇪🇸';
    case 'ar': return '🇦🇷';
    default: return '🌐';
  }
}

export default function NewsCard({ article, index, isFirst }: NewsCardProps) {
  const hasImage = !!article.imageUrl;
  const time = timeAgo(article.publishedAt || article.scrapedAt);
  const isRecent =
    article.publishedAt &&
    Date.now() - new Date(article.publishedAt).getTime() < 3600000 * 3;

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: Math.min(index * 0.06, 0.5), duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="snap-x-item relative h-[calc(100dvh-80px)] w-full flex-shrink-0 p-3 lg:p-4"
    >
      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-full flex-col rounded-[28px] overflow-hidden bg-obsidian-card border border-white/5 group cursor-pointer hover:border-accent/20 transition-all duration-300"
      >
        {/* ── Image Section (16:9) ── */}
        <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden">
          {hasImage ? (
            <img
              src={article.imageUrl!}
              alt=""
              className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-[#0F1012] via-obsidian to-[#0a1a12]">
              <div className="h-full w-full opacity-[0.04]" style={{
                backgroundImage: 'radial-gradient(circle at 25% 25%, var(--color-accent) 1px, transparent 1px)',
                backgroundSize: '32px 32px'
              }} />
            </div>
          )}

          {/* Vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F1012] via-transparent to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-transparent" />

          {/* League badge (top-left) */}
          {article.league && (
            <div className="absolute top-4 left-4 z-10">
              <span className="inline-flex items-center rounded-full bg-accent/20 backdrop-blur-md px-3 py-1 text-[9px] font-bold tracking-[0.12em] uppercase text-accent border border-accent/15">
                {article.league.label}
              </span>
            </div>
          )}

          {/* Source badge (top-right) */}
          <div className="absolute top-4 right-4 z-10">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(11,11,16,0.7)] backdrop-blur-md px-3 py-1 text-[9px] font-semibold tracking-[0.1em] uppercase text-bone/80 border border-white/[0.06]">
              {article.source.label} {countryFlag(article.source.country)}
            </span>
          </div>

          {/* Recent/Live indicator */}
          {isRecent && (
            <div className="absolute bottom-4 right-4 z-10 flex items-center gap-1.5 rounded-full bg-accent/15 backdrop-blur-md px-2.5 py-1 border border-accent/20">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
              </span>
              <span className="text-[8px] font-bold tracking-[0.2em] uppercase text-accent">LIVE</span>
            </div>
          )}
        </div>

        {/* ── Content Section ── */}
        <div className="flex flex-1 flex-col justify-between p-5 lg:p-6">
          <div>
            {/* Source label */}
            <p className="text-[9px] font-semibold tracking-[0.25em] uppercase text-accent/70 mb-1.5">
              {article.source.label}
            </p>

            {/* Title */}
            <h2 className="text-xl lg:text-2xl xl:text-3xl font-bold text-bone tracking-tight leading-[1.15] group-hover:text-accent transition-colors duration-300 line-clamp-3">
              {article.title}
            </h2>

            {/* Excerpt */}
            {article.excerpt && (
              <p className="text-[13px] text-[#6B7280] mt-2 leading-relaxed line-clamp-2">
                {article.excerpt}
              </p>
            )}
          </div>

          {/* Stats Grid — 3 columns */}
          <div className="grid grid-cols-3 gap-4 mt-5 pt-4 border-t border-white/5">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-[#6B7280]">
                <User className="h-3 w-3" />
                <span className="text-[8px] font-semibold tracking-[0.2em] uppercase">Autor</span>
              </div>
              <p className="text-[12px] font-medium text-bone truncate">
                {article.author || article.source.label}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-[#6B7280]">
                <Clock className="h-3 w-3" />
                <span className="text-[8px] font-semibold tracking-[0.2em] uppercase">Tiempo</span>
              </div>
              <p className="text-[12px] font-medium text-bone">
                {time || 'Reciente'}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-[#6B7280]">
                <Trophy className="h-3 w-3" />
                <span className="text-[8px] font-semibold tracking-[0.2em] uppercase">Liga</span>
              </div>
              <p className="text-[12px] font-medium text-bone truncate">
                {article.league?.label || 'General'}
              </p>
            </div>
          </div>

          {/* CTA Row */}
          <div className="mt-5 flex items-center justify-between">
            <span className="text-[11px] font-semibold tracking-[0.1em] uppercase text-[#6B7280] group-hover:text-accent transition-colors duration-300">
              Leer artículo completo
            </span>
            <ChevronRight className="h-4 w-4 text-[#6B7280] group-hover:text-accent group-hover:translate-x-1 transition-all duration-300" />
          </div>
        </div>
      </a>

      {/* Scroll hint on first card */}
      {isFirst && (
        <motion.div
          animate={{ x: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 text-white/20"
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
