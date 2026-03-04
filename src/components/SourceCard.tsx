'use client';

import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Rss, ExternalLink, ChevronRight, Clock } from 'lucide-react';

interface ArticleSummary {
  id: string;
  title: string;
  url: string;
  publishedAt: string | null;
  scrapedAt: string;
  league: { name: string; label: string } | null;
}

interface SourceWithArticles {
  id: string;
  name: string;
  label: string;
  country: string;
  url: string;
  articleCount: number;
  recentArticles: ArticleSummary[];
}

interface SourceCardProps {
  source: SourceWithArticles;
  index: number;
}

function countryFlag(country: string): string {
  switch (country) {
    case 'es': return '🇪🇸';
    case 'ar': return '🇦🇷';
    default: return '🌐';
  }
}

function timeAgo(date: string | null): string {
  if (!date) return '';
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: es });
  } catch {
    return '';
  }
}

export default function SourceCard({ source, index }: SourceCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: Math.min(index * 0.06, 0.5), duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="snap-x-item w-full flex-shrink-0 p-3 lg:p-4"
    >
      <div className="h-full rounded-[28px] overflow-hidden bg-obsidian-card border border-white/5 hover:border-accent/20 transition-all duration-300">
        <div className="h-full overflow-y-auto no-scrollbar">
          {/* ── Header ── */}
          <div className="relative shrink-0 px-6 pt-6 pb-4 border-b border-white/5">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[100px] bg-accent/[0.04] blur-3xl rounded-full" />
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 border border-accent/15">
                  <Rss className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="text-[9px] font-semibold tracking-[0.25em] uppercase text-accent/70">
                    Fuente {countryFlag(source.country)}
                  </p>
                  <h2 className="text-xl lg:text-2xl font-bold text-bone tracking-tight">
                    {source.label}
                  </h2>
                </div>
              </div>
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-full bg-white/[0.04] px-3 py-1.5 border border-white/[0.06] text-[10px] font-semibold text-[#9CA3AF] hover:text-accent hover:border-accent/20 transition-colors"
              >
                <ExternalLink className="h-3 w-3" />
                <span>Visitar</span>
              </a>
            </div>
          </div>

          {/* ── Recent Articles List ── */}
          <div className="px-6 py-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-3.5 w-3.5 text-[#6B7280]" />
              <span className="text-[9px] font-semibold tracking-[0.25em] uppercase text-[#6B7280]">
                Últimas Noticias
              </span>
            </div>

            <div className="space-y-1">
              {source.recentArticles.map((article, i) => (
                <a
                  key={article.id}
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 py-3 px-3 rounded-xl border-b border-white/[0.03] last:border-0 group/item hover:bg-white/[0.02] transition-colors"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-[10px] font-bold tabular-nums text-[#6B7280] group-hover/item:bg-accent group-hover/item:text-black transition-colors mt-0.5">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-bone leading-snug group-hover/item:text-accent transition-colors">
                      {article.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      {article.league && (
                        <>
                          <span className="text-[9px] font-bold tracking-[0.1em] uppercase text-accent/60">
                            {article.league.label}
                          </span>
                          <span className="h-0.5 w-0.5 rounded-full bg-[#4B5563]" />
                        </>
                      )}
                      <span className="text-[10px] text-[#6B7280]">
                        {timeAgo(article.publishedAt || article.scrapedAt)}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[#4B5563] group-hover/item:text-accent transition-colors mt-1" />
                </a>
              ))}

              {source.recentArticles.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Rss className="h-8 w-8 text-[#4B5563]/40 mb-2" />
                  <p className="text-[12px] text-[#6B7280]">Sin artículos recientes</p>
                </div>
              )}
            </div>
          </div>

          {/* ── Footer Stats ── */}
          <div className="px-6 py-4 border-t border-white/5 bg-accent/[0.02]">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <span className="text-[8px] font-semibold tracking-[0.2em] uppercase text-[#6B7280]">Total</span>
                <p className="text-[16px] font-bold tabular-nums text-accent">{source.articleCount}</p>
              </div>
              <div>
                <span className="text-[8px] font-semibold tracking-[0.2em] uppercase text-[#6B7280]">País</span>
                <p className="text-[16px] font-bold text-bone">{countryFlag(source.country)}</p>
              </div>
              <div>
                <span className="text-[8px] font-semibold tracking-[0.2em] uppercase text-[#6B7280]">Estado</span>
                <div className="flex items-center gap-1.5 mt-1">
                  <div className="h-2 w-2 rounded-full bg-accent" />
                  <span className="text-[11px] font-semibold text-bone">Activa</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
