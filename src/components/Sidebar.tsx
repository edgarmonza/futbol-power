'use client';

import { Trophy, ChevronRight, Rss } from 'lucide-react';

interface Source {
  id: string;
  name: string;
  label: string;
  country: string;
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

interface SidebarProps {
  sources: Source[];
  leagues: LeagueWithTeams[];
  activeSource: string | null;
  onSourceChange: (source: string | null) => void;
  activeLeague: string | null;
  onLeagueChange: (league: string | null) => void;
}

function countryFlag(country: string): string {
  switch (country) {
    case 'es': return '🇪🇸';
    case 'ar': return '🇦🇷';
    default: return '🌐';
  }
}

export default function Sidebar({
  sources,
  leagues,
  activeSource,
  onSourceChange,
  activeLeague,
  onLeagueChange,
}: SidebarProps) {
  return (
    <aside className="h-full flex flex-col border-r border-white/5 overflow-hidden bg-[rgba(15,16,18,0.4)]">
      {/* ── LEAGUES ── */}
      <div className="flex-1 min-h-0 flex flex-col">
        <div className="shrink-0 flex items-center justify-between px-4 pt-4 pb-2">
          <div className="flex items-center gap-2">
            <Trophy className="h-3.5 w-3.5 text-accent" />
            <span className="text-[9px] font-semibold tracking-[0.25em] uppercase text-[#6B7280]">
              Ligas
            </span>
          </div>
          <span className="text-[9px] font-mono text-[#6B7280]">
            {leagues.length}
          </span>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
          {/* All leagues button */}
          <button
            onClick={() => onLeagueChange(null)}
            className={`w-full text-left px-4 py-2.5 border-b border-white/[0.03] transition-all border-l-2 ${
              !activeLeague
                ? 'bg-accent/[0.06] border-l-accent'
                : 'border-l-transparent hover:bg-white/[0.02]'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm">⚽</span>
                <span className={`text-[12px] font-semibold ${!activeLeague ? 'text-accent' : 'text-bone'}`}>
                  Todas las ligas
                </span>
              </div>
              {!activeLeague && (
                <ChevronRight className="h-3 w-3 text-accent rotate-90" />
              )}
            </div>
          </button>

          {leagues.map((league) => (
            <button
              key={league.id}
              onClick={() => onLeagueChange(activeLeague === league.name ? null : league.name)}
              className={`w-full text-left px-4 py-2.5 border-b border-white/[0.03] transition-all group/league border-l-2 ${
                activeLeague === league.name
                  ? 'bg-accent/[0.06] border-l-accent'
                  : 'border-l-transparent hover:bg-white/[0.02]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{countryFlag(league.country)}</span>
                  <span className={`text-[12px] font-semibold transition-colors ${
                    activeLeague === league.name ? 'text-accent' : 'text-bone group-hover/league:text-accent'
                  }`}>
                    {league.label}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {league.articleCount > 0 && (
                    <span className="text-[9px] font-mono text-[#6B7280]">{league.articleCount}</span>
                  )}
                  <ChevronRight className={`h-3 w-3 transition-transform ${
                    activeLeague === league.name ? 'text-accent rotate-90' : 'text-[#4B5563]'
                  }`} />
                </div>
              </div>

              {/* Mini team list when active */}
              {activeLeague === league.name && league.teams.length > 0 && (
                <div className="mt-2 ml-6 space-y-1">
                  {league.teams.slice(0, 5).map((team) => (
                    <div key={team.id} className="flex items-center gap-2 py-0.5">
                      <div className="h-1 w-1 rounded-full bg-accent/40" />
                      <span className="text-[10px] text-[#9CA3AF]">{team.name}</span>
                      {team.shortName && (
                        <span className="text-[8px] font-mono text-[#4B5563]">{team.shortName}</span>
                      )}
                    </div>
                  ))}
                  {league.teams.length > 5 && (
                    <span className="text-[9px] text-[#4B5563] ml-3">
                      +{league.teams.length - 5} más
                    </span>
                  )}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-white/5" />

      {/* ── SOURCES ── */}
      <div className="flex-1 min-h-0 flex flex-col">
        <div className="shrink-0 flex items-center justify-between px-4 pt-3 pb-2">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
            <Rss className="h-3 w-3 text-accent" />
            <span className="text-[9px] font-semibold tracking-[0.25em] uppercase text-accent">
              Fuentes Activas
            </span>
          </div>
          <span className="text-[9px] font-mono text-[#6B7280]">
            {sources.filter((s) => s._count.articles > 0).length}
          </span>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
          {/* All sources button */}
          <button
            onClick={() => onSourceChange(null)}
            className={`w-full text-left px-4 py-2.5 border-b border-white/[0.03] transition-all border-l-2 ${
              !activeSource
                ? 'bg-accent/[0.06] border-l-accent'
                : 'border-l-transparent hover:bg-white/[0.02]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-[12px] font-semibold ${!activeSource ? 'text-accent' : 'text-bone'}`}>
                Todas las fuentes
              </span>
            </div>
          </button>

          {sources.map((source) => (
            <button
              key={source.id}
              onClick={() => onSourceChange(activeSource === source.name ? null : source.name)}
              className={`w-full text-left px-4 py-2.5 border-b border-white/[0.03] transition-all border-l-2 ${
                activeSource === source.name
                  ? 'bg-accent/[0.06] border-l-accent'
                  : 'border-l-transparent hover:bg-white/[0.02]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${
                    source._count.articles > 0 ? 'bg-accent' : 'bg-[#4B5563]/40'
                  }`} />
                  <span className={`text-[12px] font-semibold ${
                    activeSource === source.name ? 'text-accent' : 'text-bone'
                  }`}>
                    {source.label}
                  </span>
                  <span className="text-xs">{countryFlag(source.country)}</span>
                </div>
                <span className="text-[10px] text-[#6B7280] font-mono tabular-nums">
                  {source._count.articles}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Footer branding */}
      <div className="shrink-0 px-4 py-3 border-t border-white/5">
        <p className="text-[8px] tracking-[0.3em] uppercase text-white/[0.06] font-semibold text-center">
          Futbol Power · Apify + Supabase
        </p>
      </div>
    </aside>
  );
}
