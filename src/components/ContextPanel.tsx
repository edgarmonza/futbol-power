'use client';

import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Newspaper, TrendingUp, BarChart3, Activity } from 'lucide-react';

interface Article {
  id: string;
  title: string;
  url: string;
  imageUrl: string | null;
  excerpt?: string | null;
  author?: string | null;
  publishedAt: string | null;
  scrapedAt: string;
  source: {
    name?: string;
    label: string;
    country: string;
  };
  league?: { name: string; label: string } | null;
}

interface Source {
  id: string;
  name: string;
  label: string;
  country: string;
  _count: { articles: number };
}

interface ContextPanelProps {
  articles: Article[];
  sources: Source[];
  totalArticles: number;
  currentArticle: Article | null;
}

function timeAgo(date: string | null): string {
  if (!date) return '';
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: es });
  } catch {
    return '';
  }
}

export default function ContextPanel({
  articles,
  sources,
  totalArticles,
  currentArticle,
}: ContextPanelProps) {
  const activeSources = sources.filter((s) => s._count.articles > 0);
  const recentCount = articles.filter((a) => {
    const d = a.publishedAt || a.scrapedAt;
    return d && Date.now() - new Date(d).getTime() < 86400000;
  }).length;
  const coverageScore = Math.min(10, Math.round((activeSources.length / Math.max(sources.length, 1)) * 10));

  return (
    <aside className="h-full flex flex-col overflow-y-auto no-scrollbar border-l border-white/5 bg-[rgba(15,16,18,0.4)]">
      {/* ── 1. Current Article ── */}
      <div className="px-5 py-4 border-b border-white/5">
        <div className="flex items-center gap-2 mb-3">
          <Newspaper className="h-4 w-4 text-accent" />
          <span className="text-[9px] font-semibold tracking-[0.25em] uppercase text-[#9CA3AF]">
            Artículo Actual
          </span>
        </div>
        {currentArticle ? (
          <>
            <h3 className="text-[13px] font-bold text-bone leading-snug line-clamp-3">
              {currentArticle.title}
            </h3>
            {currentArticle.excerpt && (
              <p className="text-[11px] leading-relaxed text-[#9CA3AF] mt-2 line-clamp-3">
                {currentArticle.excerpt}
              </p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] font-semibold text-accent/70">{currentArticle.source.label}</span>
              <span className="h-0.5 w-0.5 rounded-full bg-[#4B5563]" />
              <span className="text-[10px] text-[#6B7280]">{timeAgo(currentArticle.publishedAt || currentArticle.scrapedAt)}</span>
            </div>
          </>
        ) : (
          <p className="text-[11px] text-[#6B7280]">Desliza para ver artículos</p>
        )}
      </div>

      {/* ── 2. Key Metrics ── */}
      <div className="px-5 py-3 border-b border-white/5 bg-accent/[0.02]">
        <div className="grid grid-cols-3 gap-3">
          <div>
            <span className="text-[8px] font-semibold tracking-[0.2em] uppercase text-[#6B7280]">Total</span>
            <p className="text-[16px] font-bold tabular-nums text-bone">{totalArticles}</p>
          </div>
          <div>
            <span className="text-[8px] font-semibold tracking-[0.2em] uppercase text-[#6B7280]">Fuentes</span>
            <p className="text-[16px] font-bold tabular-nums text-accent">{activeSources.length}</p>
          </div>
          <div>
            <span className="text-[8px] font-semibold tracking-[0.2em] uppercase text-[#6B7280]">Liga</span>
            <p className="text-[13px] font-bold text-bone truncate">
              {currentArticle?.league?.label || '—'}
            </p>
          </div>
        </div>
      </div>

      {/* ── 3. Trending Articles ── */}
      <div className="px-5 py-4 border-b border-white/5">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="h-4 w-4 text-accent" />
          <span className="text-[9px] font-semibold tracking-[0.25em] uppercase text-[#9CA3AF]">
            Últimas Noticias
          </span>
        </div>
        <div className="space-y-0.5">
          {articles.slice(0, 8).map((article, i) => (
            <a
              key={article.id}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 py-2 px-2 rounded-xl group/item hover:bg-white/[0.02] transition-colors"
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-white/[0.04] text-[9px] font-bold tabular-nums text-[#6B7280] group-hover/item:bg-accent group-hover/item:text-black transition-colors mt-0.5">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-medium text-bone leading-snug line-clamp-2 group-hover/item:text-accent transition-colors">
                  {article.title}
                </p>
                <p className="text-[9px] text-[#6B7280] mt-0.5">
                  {article.source.label} · {timeAgo(article.publishedAt || article.scrapedAt)}
                </p>
              </div>
              {article.imageUrl && (
                <div className="h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-white/[0.04]">
                  <img
                    src={article.imageUrl}
                    alt=""
                    className="h-full w-full object-cover transition-transform group-hover/item:scale-110"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                </div>
              )}
            </a>
          ))}
        </div>
      </div>

      {/* ── 4. Source Stats ── */}
      <div className="px-5 py-4 border-b border-white/5">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="h-4 w-4 text-accent" />
          <span className="text-[9px] font-semibold tracking-[0.25em] uppercase text-[#9CA3AF]">
            Fuentes Activas
          </span>
        </div>
        <div className="space-y-1">
          {activeSources.map((source) => (
            <div key={source.id} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-white/[0.02] transition-colors">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-accent" />
                <span className="text-[11px] font-medium text-bone">{source.label}</span>
              </div>
              <span className="text-[11px] font-mono font-semibold tabular-nums text-accent">
                {source._count.articles}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── 5. Activity / Coverage Gauge ── */}
      <div className="px-5 py-4 bg-accent/[0.02]">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="h-4 w-4 text-accent" />
          <span className="text-[9px] font-semibold tracking-[0.25em] uppercase text-[#9CA3AF]">
            Actividad
          </span>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#9CA3AF]">Artículos hoy</span>
            <span className="text-[12px] font-mono font-semibold tabular-nums text-bone">{recentCount}</span>
          </div>

          {/* Coverage bar */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] text-[#9CA3AF]">Cobertura</span>
              <span className="text-[12px] font-mono font-bold tabular-nums text-accent">{coverageScore}/10</span>
            </div>
            <div className="flex gap-1">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-[6px] flex-1 rounded-sm transition-colors ${
                    i < coverageScore ? 'bg-accent/50' : 'bg-white/[0.04]'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Configured sources */}
          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            <span className="text-[11px] text-[#9CA3AF]">Medios configurados</span>
            <div className="flex -space-x-1">
              {sources.slice(0, 5).map((s) => (
                <div
                  key={s.id}
                  className={`flex h-5 w-5 items-center justify-center rounded-full border border-obsidian text-[7px] font-bold ${
                    s._count.articles > 0 ? 'bg-accent text-black' : 'bg-white/[0.06] text-[#6B7280]'
                  }`}
                >
                  {s.label.charAt(0)}
                </div>
              ))}
              {sources.length > 5 && (
                <div className="flex h-5 w-5 items-center justify-center rounded-full border border-obsidian bg-white/[0.06] text-[7px] font-bold text-[#6B7280]">
                  +{sources.length - 5}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
