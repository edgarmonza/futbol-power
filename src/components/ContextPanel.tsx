'use client';

import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface Article {
  id: string;
  title: string;
  url: string;
  imageUrl: string | null;
  publishedAt: string | null;
  scrapedAt: string;
  source: {
    label: string;
    country: string;
  };
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
}

function timeAgo(date: string | null): string {
  if (!date) return '';
  try {
    return formatDistanceToNow(new Date(date), {
      addSuffix: true,
      locale: es,
    });
  } catch {
    return '';
  }
}

export default function ContextPanel({
  articles,
  sources,
  totalArticles,
}: ContextPanelProps) {
  const topArticles = articles.slice(0, 10);
  const activeSources = sources.filter((s) => s._count.articles > 0);

  return (
    <aside className="h-full overflow-y-auto border-l border-[var(--color-border)] bg-obsidian-card/30 no-scrollbar">
      <div className="p-5 space-y-7">
        {/* Top Stories */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
            <h3 className="text-[10px] font-medium tracking-[0.2em] uppercase text-accent">
              Últimas Noticias
            </h3>
          </div>

          <div className="space-y-1">
            {topArticles.map((article, i) => (
              <a
                key={article.id}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex gap-3 rounded-lg p-2 transition-all hover:bg-[var(--color-surface)]"
              >
                {/* Rank number */}
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[var(--color-surface)] text-[10px] font-bold tabular-nums text-deep-gray transition-colors group-hover:bg-accent group-hover:text-black">
                  {i + 1}
                </span>

                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-semibold leading-snug text-bone line-clamp-2 transition-colors group-hover:text-accent-light">
                    {article.title}
                  </h4>
                  <div className="mt-1 flex items-center gap-1.5 text-[10px] text-deep-gray">
                    <span className="font-medium text-cool-gray">
                      {article.source.label}
                    </span>
                    <span className="h-0.5 w-0.5 rounded-full bg-deep-gray" />
                    <span>
                      {timeAgo(article.publishedAt || article.scrapedAt)}
                    </span>
                  </div>
                </div>

                {/* Thumbnail */}
                {article.imageUrl && (
                  <div className="h-11 w-11 shrink-0 overflow-hidden rounded-md bg-[var(--color-surface)]">
                    <img
                      src={article.imageUrl}
                      alt=""
                      className="h-full w-full object-cover transition-transform group-hover:scale-110"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </a>
            ))}
          </div>
        </section>

        {/* Divider */}
        <div className="h-px bg-[var(--color-border)]" />

        {/* Active Sources */}
        <section>
          <h3 className="text-[10px] font-medium tracking-[0.2em] uppercase text-deep-gray mb-3">
            Fuentes Activas
          </h3>
          <div className="space-y-1.5">
            {sources.map((source) => {
              const hasArticles = source._count.articles > 0;
              return (
                <div
                  key={source.id}
                  className="flex items-center justify-between rounded-lg px-3 py-2"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        hasArticles ? 'bg-accent' : 'bg-deep-gray/40'
                      }`}
                    />
                    <span
                      className={`text-sm ${
                        hasArticles ? 'font-medium text-bone' : 'text-deep-gray'
                      }`}
                    >
                      {source.label}
                    </span>
                  </div>
                  <span className="text-xs tabular-nums text-deep-gray">
                    {source._count.articles}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Divider */}
        <div className="h-px bg-[var(--color-border)]" />

        {/* Stats Grid */}
        <section>
          <h3 className="text-[10px] font-medium tracking-[0.2em] uppercase text-deep-gray mb-3">
            Resumen
          </h3>
          <div className="grid grid-cols-2 gap-2.5">
            <div className="rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] p-3.5">
              <div className="text-2xl font-bold tabular-nums text-bone">
                {totalArticles}
              </div>
              <div className="mt-0.5 text-[10px] font-medium tracking-[0.15em] uppercase text-deep-gray">
                Artículos
              </div>
            </div>
            <div className="rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] p-3.5">
              <div className="text-2xl font-bold tabular-nums text-accent">
                {activeSources.length}
              </div>
              <div className="mt-0.5 text-[10px] font-medium tracking-[0.15em] uppercase text-deep-gray">
                Activas
              </div>
            </div>
            <div className="col-span-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] p-3.5">
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="text-2xl font-bold tabular-nums text-bone">
                    {sources.length}
                  </div>
                  <div className="mt-0.5 text-[10px] font-medium tracking-[0.15em] uppercase text-deep-gray">
                    Medios configurados
                  </div>
                </div>
                <div className="flex -space-x-1">
                  {sources.slice(0, 5).map((s) => (
                    <div
                      key={s.id}
                      className={`flex h-6 w-6 items-center justify-center rounded-full border-2 border-obsidian-card text-[8px] font-bold ${
                        s._count.articles > 0
                          ? 'bg-accent text-black'
                          : 'bg-[var(--color-surface)] text-deep-gray'
                      }`}
                    >
                      {s.label.charAt(0)}
                    </div>
                  ))}
                  {sources.length > 5 && (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-obsidian-card bg-[var(--color-surface)] text-[8px] font-bold text-deep-gray">
                      +{sources.length - 5}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </aside>
  );
}
