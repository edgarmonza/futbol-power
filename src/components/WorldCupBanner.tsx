'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
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

interface Props {
  teamId: number;
  teamName: string;
  teamCrest: string;
  onChangeteam: () => void;
}

const STATUS_LABEL: Record<string, string> = {
  SCHEDULED: 'Programado',
  LIVE: 'EN VIVO',
  IN_PLAY: 'EN VIVO',
  PAUSED: 'Descanso',
  FINISHED: 'Finalizado',
  POSTPONED: 'Postergado',
  CANCELLED: 'Cancelado',
};

function formatDate(utcDate: string) {
  const d = new Date(utcDate);
  return d.toLocaleDateString('es-ES', {
    weekday: 'short', day: 'numeric', month: 'short',
    hour: '2-digit', minute: '2-digit', timeZoneName: 'short',
  });
}

export default function WorldCupBanner({ teamId, teamName, teamCrest, onChangeteam }: Props) {
  const [matches, setMatches] = useState<FDMatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/worldcup?type=matches&teamId=${teamId}`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setMatches(d.matches); })
      .finally(() => setLoading(false));
  }, [teamId]);

  const nextMatch = matches.find((m) =>
    ['SCHEDULED', 'LIVE', 'IN_PLAY', 'PAUSED'].includes(m.status)
  );
  const lastMatch = matches.filter((m) => m.status === 'FINISHED').at(-1);
  const displayed = nextMatch ?? lastMatch;

  const isLive = displayed && ['LIVE', 'IN_PLAY', 'PAUSED'].includes(displayed.status);

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-3 mt-1 mb-2 rounded-xl border border-white/8 bg-white/4 backdrop-blur-sm overflow-hidden"
    >
      <div className="flex items-center gap-3 px-4 py-2.5">
        {/* Team badge */}
        <div className="relative h-7 w-7 shrink-0">
          <Image src={teamCrest} alt={teamName} fill className="object-contain" unoptimized />
        </div>

        {/* Match info */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="h-3 w-48 animate-pulse rounded bg-white/10" />
          ) : !displayed ? (
            <p className="text-xs text-[#4B5563]">{teamName} — sin partidos programados</p>
          ) : (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
              {/* Teams */}
              <span className="text-xs font-semibold text-[#FFFCF7]">
                {displayed.homeTeam.tla}
                {(isLive || displayed.status === 'FINISHED') && (
                  <span className="mx-1.5 tabular-nums text-accent">
                    {displayed.score.fullTime.home ?? 0}–{displayed.score.fullTime.away ?? 0}
                  </span>
                )}
                {!isLive && displayed.status === 'SCHEDULED' && (
                  <span className="mx-1.5 text-[#4B5563]">vs</span>
                )}
                {displayed.awayTeam.tla}
              </span>

              {/* Status pill */}
              {isLive ? (
                <span className="flex items-center gap-1 rounded-full bg-red/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red" />
                  EN VIVO
                </span>
              ) : (
                <span className="text-[10px] text-[#4B5563]">
                  {displayed.status === 'FINISHED'
                    ? 'Finalizado'
                    : formatDate(displayed.utcDate)}
                </span>
              )}

              {/* Group */}
              {displayed.group && (
                <span className="text-[10px] text-[#4B5563]">{displayed.group.replace('GROUP_', 'Grupo ')}</span>
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
    </motion.div>
  );
}
