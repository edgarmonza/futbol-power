'use client';

interface Source {
  id: string;
  name: string;
  label: string;
  country: string;
  _count: { articles: number };
}

interface SidebarProps {
  sources: Source[];
  activeSource: string | null;
  onSourceChange: (source: string | null) => void;
  activeLeague: string | null;
  onLeagueChange: (league: string | null) => void;
}

const LEAGUES = [
  { key: 'laliga', label: 'La Liga', icon: '🇪🇸' },
  { key: 'premier-league', label: 'Premier League', icon: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { key: 'serie-a', label: 'Serie A', icon: '🇮🇹' },
  { key: 'bundesliga', label: 'Bundesliga', icon: '🇩🇪' },
  { key: 'ligue-1', label: 'Ligue 1', icon: '🇫🇷' },
  { key: 'liga-profesional', label: 'Liga Profesional', icon: '🇦🇷' },
  { key: 'champions-league', label: 'Champions League', icon: '⭐' },
  { key: 'europa-league', label: 'Europa League', icon: '🟠' },
  { key: 'copa-america', label: 'Copa América', icon: '🌎' },
  { key: 'world-cup', label: 'Mundial', icon: '🏆' },
];

export default function Sidebar({
  sources,
  activeSource,
  onSourceChange,
  activeLeague,
  onLeagueChange,
}: SidebarProps) {
  return (
    <aside className="h-full overflow-y-auto border-r border-[var(--color-border)] bg-obsidian-card/50 no-scrollbar">
      <div className="p-5 space-y-7">
        {/* Ligas */}
        <section>
          <h3 className="text-[10px] font-medium tracking-[0.2em] uppercase text-deep-gray mb-3">
            Ligas
          </h3>
          <div className="space-y-0.5">
            <button
              onClick={() => onLeagueChange(null)}
              className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ${
                !activeLeague
                  ? 'bg-accent-dim text-accent'
                  : 'text-cool-gray hover:bg-[var(--color-surface)] hover:text-bone'
              }`}
            >
              <span className="text-base">⚽</span>
              <span className="font-medium">Todas las ligas</span>
            </button>
            {LEAGUES.map((league) => (
              <button
                key={league.key}
                onClick={() =>
                  onLeagueChange(activeLeague === league.key ? null : league.key)
                }
                className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ${
                  activeLeague === league.key
                    ? 'bg-accent-dim text-accent'
                    : 'text-cool-gray hover:bg-[var(--color-surface)] hover:text-bone'
                }`}
              >
                <span className="text-base">{league.icon}</span>
                <span className="font-medium">{league.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Divider */}
        <div className="h-px bg-[var(--color-border)]" />

        {/* Fuentes */}
        <section>
          <h3 className="text-[10px] font-medium tracking-[0.2em] uppercase text-deep-gray mb-3">
            Fuentes
          </h3>
          <div className="space-y-0.5">
            <button
              onClick={() => onSourceChange(null)}
              className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-all ${
                !activeSource
                  ? 'bg-accent-dim text-accent'
                  : 'text-cool-gray hover:bg-[var(--color-surface)] hover:text-bone'
              }`}
            >
              <span className="font-medium">Todas las fuentes</span>
            </button>
            {sources.map((source) => (
              <button
                key={source.id}
                onClick={() =>
                  onSourceChange(
                    activeSource === source.name ? null : source.name
                  )
                }
                className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-all ${
                  activeSource === source.name
                    ? 'bg-accent-dim text-accent'
                    : 'text-cool-gray hover:bg-[var(--color-surface)] hover:text-bone'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      source._count.articles > 0 ? 'bg-accent' : 'bg-deep-gray/50'
                    }`}
                  />
                  <span className="font-medium">{source.label}</span>
                </div>
                {source._count.articles > 0 && (
                  <span className="rounded-md bg-[var(--color-surface)] px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-deep-gray">
                    {source._count.articles}
                  </span>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Divider */}
        <div className="h-px bg-[var(--color-border)]" />

        {/* About */}
        <section>
          <h3 className="text-[10px] font-medium tracking-[0.2em] uppercase text-deep-gray mb-3">
            Acerca de
          </h3>
          <p className="text-xs leading-relaxed text-deep-gray">
            Futbol Power agrega las mejores noticias del fútbol mundial en
            tiempo real desde las fuentes más confiables.
          </p>
          <div className="mt-3 text-[10px] text-deep-gray/60">
            Powered by Apify + Supabase
          </div>
        </section>
      </div>
    </aside>
  );
}
