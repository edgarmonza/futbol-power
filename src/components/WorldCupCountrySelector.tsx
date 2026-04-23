'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface WCTeam {
  id: number;
  name: string;
  shortName: string;
  tla: string;
  crest: string;
  area: { id: number; name: string; code: string; flag: string | null };
}

interface Props {
  onSelect: (team: WCTeam) => void;
  onSkip: () => void;
}

export default function WorldCupCountrySelector({ onSelect, onSkip }: Props) {
  const [teams, setTeams] = useState<WCTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<WCTeam | null>(null);

  useEffect(() => {
    fetch('/api/worldcup?type=teams')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          const sorted = [...d.teams].sort((a: WCTeam, b: WCTeam) =>
            a.name.localeCompare(b.name)
          );
          setTeams(sorted);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = teams.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.tla.toLowerCase().includes(search.toLowerCase()) ||
      t.area.name.toLowerCase().includes(search.toLowerCase())
  );

  function handleConfirm() {
    if (selected) onSelect(selected);
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0b0b10] px-4">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/4 h-96 w-96 -translate-x-1/2 rounded-full bg-accent/10 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-2xl"
      >
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-accent">
            FIFA World Cup 2026
          </div>
          <h1 className="text-3xl font-bold text-[#FFFCF7] sm:text-4xl">
            ¿De qué país eres?
          </h1>
          <p className="mt-2 text-sm text-[#9CA3AF]">
            Te mostramos noticias y partidos de tu selección
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <svg
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#4B5563]"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Busca tu país..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-white/8 bg-white/5 py-3 pl-10 pr-4 text-sm text-[#FFFCF7] placeholder-[#4B5563] outline-none ring-0 focus:border-accent/40 focus:bg-white/8 transition-colors"
          />
        </div>

        {/* Teams grid */}
        <div className="h-72 overflow-y-auto rounded-xl border border-white/5 bg-white/3 p-2 scrollbar-hide">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-[#4B5563]">
              No encontramos ese país
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
              {filtered.map((team) => (
                <button
                  key={team.id}
                  onClick={() => setSelected(team)}
                  className={`flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-all duration-150 cursor-pointer
                    ${selected?.id === team.id
                      ? 'border-accent/60 bg-accent/15 text-[#FFFCF7]'
                      : 'border-transparent bg-white/4 text-[#9CA3AF] hover:border-white/10 hover:bg-white/8 hover:text-[#FFFCF7]'
                    }`}
                >
                  <div className="relative h-6 w-6 shrink-0 overflow-hidden rounded-sm">
                    <Image
                      src={team.crest}
                      alt={team.name}
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                  <span className="truncate text-xs font-medium">{team.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Selected preview */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 overflow-hidden"
            >
              <div className="flex items-center gap-3 rounded-xl border border-accent/20 bg-accent/10 px-4 py-3">
                <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded">
                  <Image src={selected.crest} alt={selected.name} fill className="object-contain" unoptimized />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#FFFCF7]">{selected.name}</p>
                  <p className="text-xs text-accent">Selección confirmada</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div className="mt-4 flex gap-3">
          <button
            onClick={onSkip}
            className="flex-1 rounded-xl border border-white/8 bg-transparent py-3 text-sm text-[#4B5563] transition-colors hover:text-[#9CA3AF] cursor-pointer"
          >
            Ver todo el Mundial
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selected}
            className="flex-[2] rounded-xl bg-accent py-3 text-sm font-semibold text-[#0b0b10] transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-accent-light cursor-pointer"
          >
            {selected ? `Ver ${selected.name}` : 'Selecciona un país'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
