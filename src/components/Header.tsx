'use client';

import { motion } from 'framer-motion';

interface HeaderProps {
  activeCountry: string;
  onCountryChange: (country: string) => void;
  totalArticles: number;
}

const COUNTRIES = [
  { key: 'all', label: 'Todo', icon: '⚽' },
  { key: 'es', label: 'España', icon: '🇪🇸' },
  { key: 'ar', label: 'Argentina', icon: '🇦🇷' },
  { key: 'int', label: 'Global', icon: '🌐' },
];

export default function Header({ activeCountry, onCountryChange, totalArticles }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-20 border-b border-white/5 bg-[rgba(11,11,16,0.85)] backdrop-blur-xl">
      <div className="flex h-full items-center justify-between px-6">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 border border-accent/20">
            <span className="text-lg font-extrabold text-accent">FP</span>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-[15px] font-bold tracking-tight text-bone">
              Futbol Power
            </h1>
            <p className="text-[9px] font-medium tracking-[0.25em] uppercase text-white/20">
              El portal del fútbol
            </p>
          </div>
        </div>

        {/* Country Pills */}
        <nav className="flex items-center gap-1 rounded-full bg-white/[0.03] p-1 border border-white/5">
          {COUNTRIES.map((c) => (
            <button
              key={c.key}
              onClick={() => onCountryChange(c.key)}
              className="relative px-3 py-1.5 rounded-full text-[11px] font-semibold transition-colors"
            >
              {activeCountry === c.key && (
                <motion.div
                  layoutId="countryPill"
                  className="absolute inset-0 rounded-full bg-accent/15 border border-accent/25"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span
                className={`relative z-10 flex items-center gap-1.5 ${
                  activeCountry === c.key
                    ? 'text-accent'
                    : 'text-[#6B7280] hover:text-[#9CA3AF]'
                }`}
              >
                <span className="text-sm leading-none">{c.icon}</span>
                <span className="hidden sm:inline">{c.label}</span>
              </span>
            </button>
          ))}
        </nav>

        {/* Live Stats */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full bg-white/[0.03] px-3 py-1.5 border border-white/5">
            <div className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </div>
            <span className="text-[11px] font-bold tabular-nums text-bone">
              {totalArticles}
            </span>
            <span className="hidden sm:inline text-[10px] text-[#6B7280]">
              artículos
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
