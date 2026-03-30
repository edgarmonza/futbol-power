'use client';

export default function FutbolPowerLoader({ label = 'Cargando noticias...' }: { label?: string }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-obsidian">
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[200px] rounded-full bg-accent/[0.04] blur-3xl" />

      {/* Infinity SVG */}
      <div className="relative w-full max-w-[280px] aspect-[2/1]">
        <svg viewBox="0 0 200 100" className="w-full h-full" fill="none">
          <defs>
            <linearGradient id="fp-grad" x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#34D399" stopOpacity="0.1" />
              <stop offset="50%" stopColor="#34D399" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#34D399" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          {/* Background path */}
          <path
            d="M 50 50 C 50 20, 80 20, 100 50 C 120 80, 150 80, 150 50 C 150 20, 120 20, 100 50 C 80 80, 50 80, 50 50"
            stroke="rgba(52,211,153,0.08)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Animated worm */}
          <path
            d="M 50 50 C 50 20, 80 20, 100 50 C 120 80, 150 80, 150 50 C 150 20, 120 20, 100 50 C 80 80, 50 80, 50 50"
            stroke="url(#fp-grad)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="40 260"
            className="animate-infinity-worm"
          />
        </svg>
      </div>

      {/* Label */}
      <div className="mt-4 flex flex-col items-center gap-2">
        <p className="text-[13px] font-medium tracking-wide text-accent/70">{label}</p>
        <div className="flex gap-1.5">
          <span className="h-1 w-1 rounded-full bg-accent/60 animate-bounce [animation-delay:0ms]" />
          <span className="h-1 w-1 rounded-full bg-accent/60 animate-bounce [animation-delay:150ms]" />
          <span className="h-1 w-1 rounded-full bg-accent/60 animate-bounce [animation-delay:300ms]" />
        </div>
      </div>

      {/* Bottom branding */}
      <p className="absolute bottom-6 text-[9px] uppercase tracking-[0.3em] text-white/[0.06] font-semibold">
        Futbol Power
      </p>
    </div>
  );
}
