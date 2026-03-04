'use client';

import { useState } from 'react';
import { Trophy, ChevronUp, ChevronDown, Minus } from 'lucide-react';

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

interface SidebarProps {
  standingsData: LeagueStandings[];
}

function countryFlag(country: string): string {
  switch (country) {
    case 'es': return '🇪🇸';
    case 'ar': return '🇦🇷';
    default: return '🌐';
  }
}

function positionBadge(pos: number) {
  if (pos <= 4) return 'bg-accent/20 text-accent border-accent/30';
  if (pos <= 6) return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
  if (pos >= 18) return 'bg-red-500/20 text-red-400 border-red-500/30';
  return 'bg-white/[0.04] text-[#9CA3AF] border-white/[0.06]';
}

function formIndicator(diff: number) {
  if (diff > 0) return <ChevronUp className="h-3 w-3 text-accent" />;
  if (diff < 0) return <ChevronDown className="h-3 w-3 text-red-400" />;
  return <Minus className="h-3 w-3 text-[#6B7280]" />;
}

export default function Sidebar({ standingsData }: SidebarProps) {
  const leaguesWithStandings = standingsData.filter((d) => d.standings.length > 0);
  const [activeTab, setActiveTab] = useState(leaguesWithStandings[0]?.league.name || '');

  const currentLeague = leaguesWithStandings.find((d) => d.league.name === activeTab);

  return (
    <aside className="h-full flex flex-col overflow-hidden bg-[rgba(15,16,18,0.4)]">
      {/* ── League Tabs ── */}
      <div className="shrink-0 border-b border-white/5">
        <div className="flex items-center gap-2 px-3 pt-3 pb-1.5">
          <Trophy className="h-3.5 w-3.5 text-accent" />
          <span className="text-[9px] font-semibold tracking-[0.25em] uppercase text-[#6B7280]">
            Posiciones
          </span>
        </div>
        <div className="flex gap-0.5 px-2 pb-2 overflow-x-auto no-scrollbar">
          {leaguesWithStandings.map((d) => (
            <button
              key={d.league.name}
              onClick={() => setActiveTab(d.league.name)}
              className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all ${
                activeTab === d.league.name
                  ? 'bg-accent/15 text-accent border border-accent/25'
                  : 'text-[#6B7280] hover:text-[#9CA3AF] hover:bg-white/[0.03] border border-transparent'
              }`}
            >
              <span className="text-xs">{countryFlag(d.league.country)}</span>
              <span className="whitespace-nowrap">
                {d.league.name === 'laliga' ? 'LaLiga' : d.league.name === 'liga-profesional' ? 'Argentina' : d.league.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Standings Table ── */}
      {currentLeague ? (
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          {/* League header */}
          <div className="shrink-0 px-3 pt-3 pb-2">
            <h3 className="text-[13px] font-bold text-bone tracking-tight">
              {currentLeague.league.label}
            </h3>
            <p className="text-[9px] text-[#6B7280] mt-0.5">
              Temporada 2024-25 · {currentLeague.standings.length} equipos
            </p>
          </div>

          {/* Table header */}
          <div className="shrink-0 grid grid-cols-[28px_1fr_32px_32px_32px_36px] gap-0 px-3 py-1.5 border-y border-white/5 bg-white/[0.02]">
            <span className="text-[8px] font-bold tracking-wider uppercase text-[#6B7280] text-center">#</span>
            <span className="text-[8px] font-bold tracking-wider uppercase text-[#6B7280] pl-1">Equipo</span>
            <span className="text-[8px] font-bold tracking-wider uppercase text-[#6B7280] text-center">PJ</span>
            <span className="text-[8px] font-bold tracking-wider uppercase text-[#6B7280] text-center">DG</span>
            <span className="text-[8px] font-bold tracking-wider uppercase text-[#6B7280] text-center"></span>
            <span className="text-[8px] font-bold tracking-wider uppercase text-accent text-center">Pts</span>
          </div>

          {/* Rows */}
          <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
            {currentLeague.standings.map((s, i) => (
              <div
                key={s.id}
                className={`grid grid-cols-[28px_1fr_32px_32px_32px_36px] gap-0 px-3 py-2 border-b border-white/[0.03] transition-colors hover:bg-white/[0.03] group/row ${
                  i === 3 ? 'border-b-accent/20' : ''
                }`}
              >
                {/* Position */}
                <div className="flex items-center justify-center">
                  <span className={`flex h-5 w-5 items-center justify-center rounded-md text-[9px] font-bold border ${positionBadge(s.position)}`}>
                    {s.position}
                  </span>
                </div>

                {/* Team name */}
                <div className="flex items-center gap-1.5 pl-1 min-w-0">
                  <span className="text-[11px] font-semibold text-bone truncate group-hover/row:text-accent transition-colors">
                    {s.team.shortName || s.team.name}
                  </span>
                </div>

                {/* Played */}
                <span className="text-[10px] tabular-nums text-[#9CA3AF] text-center self-center">
                  {s.played}
                </span>

                {/* Goal Diff */}
                <span className={`text-[10px] tabular-nums text-center self-center font-medium ${
                  s.goalDiff > 0 ? 'text-accent' : s.goalDiff < 0 ? 'text-red-400' : 'text-[#6B7280]'
                }`}>
                  {s.goalDiff > 0 ? `+${s.goalDiff}` : s.goalDiff}
                </span>

                {/* Form arrow */}
                <div className="flex items-center justify-center">
                  {formIndicator(s.goalDiff)}
                </div>

                {/* Points */}
                <span className="text-[11px] tabular-nums font-bold text-accent text-center self-center">
                  {s.points}
                </span>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="shrink-0 px-3 py-2 border-t border-white/5 bg-white/[0.01]">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-sm bg-accent/30 border border-accent/40" />
                <span className="text-[8px] text-[#6B7280]">Champions</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-sm bg-blue-500/30 border border-blue-500/40" />
                <span className="text-[8px] text-[#6B7280]">Europa</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-sm bg-red-500/30 border border-red-500/40" />
                <span className="text-[8px] text-[#6B7280]">Descenso</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <Trophy className="h-8 w-8 text-[#4B5563]/40 mx-auto mb-2" />
            <p className="text-[11px] text-[#6B7280]">Sin datos de posiciones</p>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="shrink-0 px-3 py-2 border-t border-white/5">
        <p className="text-[7px] tracking-[0.3em] uppercase text-white/[0.06] font-semibold text-center">
          Futbol Power · Live
        </p>
      </div>
    </aside>
  );
}
