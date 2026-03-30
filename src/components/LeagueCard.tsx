'use client';

import { motion } from 'framer-motion';
import { Trophy, TrendingUp, Newspaper, ChevronRight } from 'lucide-react';

interface Team {
  id: string;
  name: string;
  shortName: string | null;
  slug: string;
}

interface LeagueWithTeams {
  id: string;
  name: string;
  label: string;
  country: string;
  articleCount: number;
  teams: Team[];
}

interface LeagueCardProps {
  league: LeagueWithTeams;
  index: number;
}

function countryFlag(country: string): string {
  switch (country) {
    case 'es': return '🇪🇸';
    case 'ar': return '🇦🇷';
    default: return '🌐';
  }
}

export default function LeagueCard({ league, index }: LeagueCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: Math.min(index * 0.06, 0.5), duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="snap-x-item w-full flex-shrink-0 p-3 lg:p-4"
    >
      <div className="h-full rounded-[28px] overflow-hidden bg-obsidian-card border border-white/5 hover:border-accent/20 transition-all duration-300">
        <div className="h-full overflow-y-auto no-scrollbar">
          {/* ── Header Section ── */}
          <div className="relative shrink-0 px-6 pt-6 pb-4 border-b border-white/5">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[100px] bg-accent/[0.04] blur-3xl rounded-full" />
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 border border-accent/15">
                  <Trophy className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="text-[9px] font-semibold tracking-[0.25em] uppercase text-accent/70">
                    Liga {countryFlag(league.country)}
                  </p>
                  <h2 className="text-xl lg:text-2xl font-bold text-bone tracking-tight">
                    {league.label}
                  </h2>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1.5 border border-accent/15">
                <Newspaper className="h-3 w-3 text-accent" />
                <span className="text-[11px] font-bold tabular-nums text-accent">{league.articleCount}</span>
                <span className="text-[9px] text-accent/60">arts.</span>
              </div>
            </div>
          </div>

          {/* ── Teams Table ── */}
          <div className="px-6 py-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-3.5 w-3.5 text-[#6B7280]" />
              <span className="text-[9px] font-semibold tracking-[0.25em] uppercase text-[#6B7280]">
                Equipos en la Liga
              </span>
            </div>

            <div className="grid grid-cols-[32px_1fr_60px] gap-2 px-3 py-2 text-[8px] font-semibold tracking-[0.2em] uppercase text-[#4B5563]">
              <span>#</span>
              <span>Equipo</span>
              <span className="text-right">Código</span>
            </div>

            <div className="space-y-0.5">
              {league.teams.map((team, i) => (
                <div
                  key={team.id}
                  className="grid grid-cols-[32px_1fr_60px] gap-2 items-center px-3 py-2.5 rounded-xl transition-colors hover:bg-white/[0.02] group/row"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/[0.04] text-[10px] font-bold tabular-nums text-[#6B7280] group-hover/row:bg-accent group-hover/row:text-black transition-colors">
                    {i + 1}
                  </span>
                  <span className="text-[13px] font-semibold text-bone group-hover/row:text-accent transition-colors truncate">
                    {team.name}
                  </span>
                  <span className="text-[11px] font-mono font-medium text-[#6B7280] text-right">
                    {team.shortName || '—'}
                  </span>
                </div>
              ))}
            </div>

            {league.teams.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Trophy className="h-8 w-8 text-[#4B5563]/40 mb-2" />
                <p className="text-[12px] text-[#6B7280]">Sin equipos registrados</p>
              </div>
            )}
          </div>

          {/* ── Footer Stats ── */}
          <div className="px-6 py-4 border-t border-white/5 bg-accent/[0.02]">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <span className="text-[8px] font-semibold tracking-[0.2em] uppercase text-[#6B7280]">Equipos</span>
                <p className="text-[16px] font-bold tabular-nums text-bone">{league.teams.length}</p>
              </div>
              <div>
                <span className="text-[8px] font-semibold tracking-[0.2em] uppercase text-[#6B7280]">Noticias</span>
                <p className="text-[16px] font-bold tabular-nums text-accent">{league.articleCount}</p>
              </div>
              <div>
                <span className="text-[8px] font-semibold tracking-[0.2em] uppercase text-[#6B7280]">País</span>
                <p className="text-[16px] font-bold text-bone">{countryFlag(league.country)}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-[11px] font-semibold tracking-[0.1em] uppercase text-[#6B7280]">
                Ver noticias de esta liga
              </span>
              <ChevronRight className="h-4 w-4 text-[#6B7280]" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
