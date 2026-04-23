'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface FDTeam {
  id: number;
  name: string;
  shortName: string;
  tla: string;
  crest: string;
}

interface FDMatch {
  id: number;
  utcDate: string;
  status: string;
  stage: string;
  group: string | null;
  homeTeam: FDTeam;
  awayTeam: FDTeam;
  score: {
    winner: string | null;
    fullTime: { home: number | null; away: number | null };
  };
}

interface FDStandingRow {
  position: number;
  team: FDTeam;
  playedGames: number;
  won: number;
  draw: number;
  lost: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
}

interface FDGroup {
  group: string;
  table: FDStandingRow[];
}

interface Props {
  teamId: number;
  teamName: string;
  teamCrest: string;
  onChangeteam: () => void;
}

function formatDate(utcDate: string) {
  return new Date(utcDate).toLocaleDateString('es-ES', {
    weekday: 'short', day: 'numeric', month: 'short',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function WorldCupBanner({ teamId, teamName, teamCrest, onChangeteam }: Props) {
  const [matches, setMatches] = useState<FDMatch[]>([]);
  const [myGroup, setMyGroup] = useState<FDGroup | null>(null);
  const [loading, setLoading] = useState(true);
  const [showGroup, setShowGroup] = useState(false);

  useEffect(() => {
    setLoading(true);
    setShowGroup(false);

    Promise.all([
      fetch(`/api/worldcup?type=matches&teamId=${teamId}`).then(r => r.json()),
      fetch(`/api/worldcup?type=standings`).then(r => r.json()),
    ]).then(([matchData, standingsData]) => {
      if (matchData.success) setMatches(matchData.matches);
      if (standingsData.success) {
        const group = standingsData.standings.find((g: FDGroup) =>
          g.table.some((row: FDStandingRow) => row.team.id === teamId)
        );
        setMyGroup(group ?? null);
      }
    }).finally(() => setLoading(false));
  }, [teamId]);

  const nextMatch = matches.find(m =>
    ['SCHEDULED', 'LIVE', 'IN_PLAY', 'PAUSED'].includes(m.status)
  );
  const lastMatch = matches.filter(m => m.status === 'FINISHED').at(-1);
  const displayed = nextMatch ?? lastMatch;
  const isLive = displayed && ['LIVE', 'IN_PLAY', 'PAUSED'].includes(displayed.status);
  const hasMatch = !!displayed;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-3 mt-1 mb-2 rounded-xl border border-white/8 bg-white/4 backdrop-blur-sm overflow-hidden"
    >
      {/* Main row */}
      <div className="flex items-center gap-3 px-4 py-2.5">
        {/* Team crest */}
        <div className="relative h-7 w-7 shrink-0">
          <Image src={teamCrest} alt={teamName} fill className="object-contain" unoptimized />
        </div>

        {/* Match / group info */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="h-3 w-48 animate-pulse rounded bg-white/10" />
          ) : !hasMatch ? (
            <button
              onClick={() => setShowGroup(v => !v)}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <span className="text-xs text-[#9CA3AF]">
                {teamName}
              </span>
              <span className="rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent">
                Mundial 2026
              </span>
              {myGroup && (
                <span className="text-[10px] text-[#4B5563] group-hover:text-[#9CA3AF] transition-colors">
                  {showGroup ? 'ocultar grupo' : `ver ${myGroup.group}`}
                </span>
              )}
            </button>
          ) : (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
              <span className="text-xs font-semibold text-[#FFFCF7]">
                {displayed.homeTeam.tla}
                {(isLive || displayed.status === 'FINISHED') ? (
                  <span className="mx-1.5 tabular-nums text-accent">
                    {displayed.score.fullTime.home ?? 0}–{displayed.score.fullTime.away ?? 0}
                  </span>
                ) : (
                  <span className="mx-1.5 text-[#4B5563]">vs</span>
                )}
                {displayed.awayTeam.tla}
              </span>

              {isLive ? (
                <span className="flex items-center gap-1 rounded-full bg-red/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red" />
                  EN VIVO
                </span>
              ) : (
                <span className="text-[10px] text-[#4B5563]">
                  {displayed.status === 'FINISHED' ? 'Finalizado' : formatDate(displayed.utcDate)}
                </span>
              )}

              {displayed.group && (
                <button
                  onClick={() => setShowGroup(v => !v)}
                  className="text-[10px] text-[#4B5563] hover:text-accent transition-colors cursor-pointer"
                >
                  {displayed.group.replace('GROUP_', 'Grupo ')} {showGroup ? '▲' : '▼'}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Change team */}
        <button
          onClick={onChangeteam}
          className="shrink-0 rounded-lg border border-white/8 px-2.5 py-1 text-[10px] font-medium text-[#4B5563] transition-colors hover:border-white/20 hover:text-[#9CA3AF] cursor-pointer"
        >
          Cambiar
        </button>
      </div>

      {/* Group standings drawer */}
      <AnimatePresence>
        {showGroup && myGroup && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-white/5"
          >
            <div className="px-4 py-3">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[#4B5563]">
                {myGroup.group} · FIFA World Cup 2026
              </p>
              <table className="w-full">
                <thead>
                  <tr className="text-[10px] text-[#4B5563]">
                    <th className="pb-1 text-left font-medium w-5">#</th>
                    <th className="pb-1 text-left font-medium">Selección</th>
                    <th className="pb-1 text-right font-medium w-6">PJ</th>
                    <th className="pb-1 text-right font-medium w-6">G</th>
                    <th className="pb-1 text-right font-medium w-6">E</th>
                    <th className="pb-1 text-right font-medium w-6">P</th>
                    <th className="pb-1 text-right font-medium w-6">GD</th>
                    <th className="pb-1 text-right font-medium w-8 text-accent">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {myGroup.table.map((row) => {
                    const isMyTeam = row.team.id === teamId;
                    return (
                      <tr
                        key={row.team.id}
                        className={`text-xs ${isMyTeam ? 'text-[#FFFCF7]' : 'text-[#6B7280]'}`}
                      >
                        <td className="py-1 tabular-nums">{row.position}</td>
                        <td className="py-1">
                          <div className="flex items-center gap-2">
                            <div className="relative h-4 w-4 shrink-0">
                              <Image
                                src={row.team.crest}
                                alt={row.team.name}
                                fill
                                className="object-contain"
                                unoptimized
                              />
                            </div>
                            <span className={`font-medium ${isMyTeam ? 'text-accent' : ''}`}>
                              {row.team.tla}
                            </span>
                            <span className="hidden sm:inline text-[11px] text-[#4B5563]">
                              {row.team.shortName}
                            </span>
                          </div>
                        </td>
                        <td className="py-1 text-right tabular-nums">{row.playedGames}</td>
                        <td className="py-1 text-right tabular-nums">{row.won}</td>
                        <td className="py-1 text-right tabular-nums">{row.draw}</td>
                        <td className="py-1 text-right tabular-nums">{row.lost}</td>
                        <td className="py-1 text-right tabular-nums">
                          {row.goalsFor - row.goalsAgainst > 0 ? '+' : ''}{row.goalsFor - row.goalsAgainst}
                        </td>
                        <td className={`py-1 text-right tabular-nums font-bold ${isMyTeam ? 'text-accent' : ''}`}>
                          {row.points}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
