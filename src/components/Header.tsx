'use client';

import { motion } from 'framer-motion';
import { Filter, Rss, Trophy } from 'lucide-react';

interface SourceOption {
  name: string;
  label: string;
  country: string;
  articleCount: number;
}

interface LeagueOption {
  name: string;
  label: string;
  country: string;
}

interface HeaderProps {
  activeCountry: string;
  onCountryChange: (country: string) => void;
  totalArticles: number;
  // Filter props
  leagues: LeagueOption[];
  sources: SourceOption[];
  activeLeague: string | null;
  onLeagueChange: (league: string | null) => void;
  activeSource: string | null;
  onSourceChange: (source: string | null) => void;
}

const COUNTRIES = [
  { key: 'all', label: 'Todo', icon: '⚽' },
  { key: 'es', label: 'España', icon: '🇪🇸' },
  { key: 'ar', label: 'Argentina', icon: '🇦🇷' },
  { key: 'int', label: 'Global', icon: '🌐' },
];

function countryFlag(country: string): string {
  switch (country) {
    case 'es': return '🇪🇸';
    case 'ar': return '🇦🇷';
    default: return '🌐';
  }
}

export default function Header({
  activeCountry,
  onCountryChange,
  totalArticles,
  leagues,
  sources,
  activeLeague,
  onLeagueChange,
  activeSource,
  onSourceChange,
}: HeaderProps) {
  const filteredLeagues = leagues.filter(
    (l) => activeCountry === 'all' || l.country === activeCountry
  );
  const filteredSources = sources.filter(
    (s) => activeCountry === 'all' || s.country === activeCountry
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[rgba(11,11,16,0.85)] backdrop-blur-xl">
      {/* Row 1: Logo + Country + Stats */}
      <div className="flex h-14 items-center justify-between px-6">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10 border border-accent/20">
            <span className="text-base font-extrabold text-accent">FP</span>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-[14px] font-bold tracking-tight text-bone leading-none">
              Futbol Power
            </h1>
            <p className="text-[8px] font-medium tracking-[0.25em] uppercase text-white/20 mt-0.5">
              El portal del fútbol
            </p>
          </div>
        </div>

        {/* Country Pills */}
        <nav className="flex items-center gap-0.5 rounded-full bg-white/[0.03] p-0.5 border border-white/5">
          {COUNTRIES.map((c) => (
            <button
              key={c.key}
              onClick={() => onCountryChange(c.key)}
              className="relative px-2.5 py-1 rounded-full text-[10px] font-semibold transition-colors"
            >
              {activeCountry === c.key && (
                <motion.div
                  layoutId="countryPill"
                  className="absolute inset-0 rounded-full bg-accent/15 border border-accent/25"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span
                className={`relative z-10 flex items-center gap-1 ${
                  activeCountry === c.key
                    ? 'text-accent'
                    : 'text-[#6B7280] hover:text-[#9CA3AF]'
                }`}
              >
                <span className="text-xs leading-none">{c.icon}</span>
                <span className="hidden sm:inline">{c.label}</span>
              </span>
            </button>
          ))}
        </nav>

        {/* Live Stats */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-full bg-white/[0.03] px-3 py-1 border border-white/5">
            <div className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
            </div>
            <span className="text-[10px] font-bold tabular-nums text-bone">
              {totalArticles}
            </span>
            <span className="hidden sm:inline text-[9px] text-[#6B7280]">
              noticias
            </span>
          </div>
        </div>
      </div>

      {/* Row 2: League + Source Filters */}
      <div className="flex items-center gap-3 px-6 py-1.5 border-t border-white/[0.03] bg-white/[0.01]">
        {/* League filters */}
        <div className="flex items-center gap-1.5 min-w-0">
          <Trophy className="h-3 w-3 text-accent shrink-0" />
          <div className="flex items-center gap-0.5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => onLeagueChange(null)}
              className={`shrink-0 px-2 py-0.5 rounded-md text-[9px] font-semibold transition-all ${
                !activeLeague
                  ? 'bg-accent/15 text-accent border border-accent/25'
                  : 'text-[#6B7280] hover:text-[#9CA3AF] border border-transparent'
              }`}
            >
              Todas
            </button>
            {filteredLeagues.map((l) => (
              <button
                key={l.name}
                onClick={() => onLeagueChange(activeLeague === l.name ? null : l.name)}
                className={`shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-semibold transition-all ${
                  activeLeague === l.name
                    ? 'bg-accent/15 text-accent border border-accent/25'
                    : 'text-[#6B7280] hover:text-[#9CA3AF] border border-transparent'
                }`}
              >
                <span className="text-[8px]">{countryFlag(l.country)}</span>
                {l.label.length > 20 ? l.name.replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase()).slice(0, 12) : l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="h-3 w-px bg-white/10 shrink-0" />

        {/* Source filters */}
        <div className="flex items-center gap-1.5 min-w-0">
          <Rss className="h-3 w-3 text-accent shrink-0" />
          <div className="flex items-center gap-0.5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => onSourceChange(null)}
              className={`shrink-0 px-2 py-0.5 rounded-md text-[9px] font-semibold transition-all ${
                !activeSource
                  ? 'bg-accent/15 text-accent border border-accent/25'
                  : 'text-[#6B7280] hover:text-[#9CA3AF] border border-transparent'
              }`}
            >
              Todas
            </button>
            {filteredSources.map((s) => (
              <button
                key={s.name}
                onClick={() => onSourceChange(activeSource === s.name ? null : s.name)}
                className={`shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-semibold transition-all ${
                  activeSource === s.name
                    ? 'bg-accent/15 text-accent border border-accent/25'
                    : 'text-[#6B7280] hover:text-[#9CA3AF] border border-transparent'
                }`}
              >
                {s.label}
                {s.articleCount > 0 && (
                  <span className="text-[7px] font-mono text-[#4B5563]">{s.articleCount}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Active filter indicator */}
        {(activeLeague || activeSource) && (
          <button
            onClick={() => { onLeagueChange(null); onSourceChange(null); }}
            className="shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-500/10 text-red-400 text-[9px] font-semibold border border-red-500/20 hover:bg-red-500/20 transition-colors"
          >
            <Filter className="h-2.5 w-2.5" />
            Limpiar
          </button>
        )}
      </div>
    </header>
  );
}
