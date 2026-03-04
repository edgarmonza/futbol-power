'use client';

import { motion } from 'framer-motion';

interface HeaderProps {
  activeCountry: string;
  onCountryChange: (country: string) => void;
  totalArticles: number;
}

const COUNTRIES = [
  { key: 'all', label: 'Todo', flag: '🌍' },
  { key: 'es', label: 'España', flag: '🇪🇸' },
  { key: 'ar', label: 'Argentina', flag: '🇦🇷' },
  { key: 'int', label: 'Global', flag: '🌐' },
];

export default function Header({ activeCountry, onCountryChange, totalArticles }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 h-16 shrink-0 border-b border-[var(--color-border)] bg-obsidian/80 backdrop-blur-xl">
      <div className="flex h-full items-center justify-between px-6">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-accent font-bold text-black text-sm">
            FP
            <div className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-accent ring-2 ring-obsidian animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-bone">
              Futbol Power
            </h1>
            <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-deep-gray">
              El portal del fútbol
            </p>
          </div>
        </div>

        {/* Country Filters — pill selector */}
        <nav className="flex items-center gap-1 rounded-xl bg-[var(--color-surface)] p-1">
          {COUNTRIES.map(({ key, label, flag }) => (
            <button
              key={key}
              onClick={() => onCountryChange(key)}
              className={`relative rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                activeCountry === key
                  ? 'text-black'
                  : 'text-cool-gray hover:text-bone'
              }`}
            >
              {activeCountry === key && (
                <motion.div
                  layoutId="countryPill"
                  className="absolute inset-0 rounded-lg bg-accent"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <span>{flag}</span>
                <span className="hidden sm:inline">{label}</span>
              </span>
            </button>
          ))}
        </nav>

        {/* Live Stats */}
        <div className="hidden lg:flex items-center gap-4">
          <div className="flex items-center gap-2 rounded-lg bg-[var(--color-surface)] px-3 py-1.5">
            <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
            <span className="text-xs font-semibold tabular-nums text-bone">
              {totalArticles}
            </span>
            <span className="text-xs text-deep-gray">noticias</span>
          </div>
        </div>
      </div>
    </header>
  );
}
