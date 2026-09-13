"use client";

import {
  Scissors, Sparkles, Building2, Palette, Camera, HardHat, Check, Wind,
  Droplets, Waves, Sun, ArrowUpRight, TrendingDown, CircleDashed, Ban,
  Square, Feather, Landmark, Flame, ShieldAlert, Layers, Slash, Zap,
} from "lucide-react";

/** Scalar answers get a four-step gauge rather than four identical icons. */
const SCALES: Record<string, number> = {
  clock1: 1, clock2: 2, clock3: 3, clock4: 4,
  cal1: 4, cal2: 3, cal3: 2, cal4: 1,
  coin1: 1, coin2: 2, coin3: 3, coin4: 4,
};

const ICONS: Record<string, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  scissors: Scissors,
  beard: Feather,
  tie: Landmark,
  sparkle: Sparkles,
  building: Building2,
  palette: Palette,
  camera: Camera,
  helmet: HardHat,
  check: Check,
  flat: TrendingDown,
  frizz: Waves,
  hold: Wind,
  grease: Droplets,
  dry: Sun,
  cowlick: ArrowUpRight,
  scalp: CircleDashed,
  sensitive: ShieldAlert,
  thinning: Layers,
  patchy: CircleDashed,
  fall: TrendingDown,
  sharp: Square,
  relaxed: Waves,
  classic: Landmark,
  bold: Flame,
  noshort: Ban,
  nobeard: Slash,
  nocolour: Ban,
  noproduct: Zap,
};

export function QuizIcon({ name, className = "" }: { name: string; className?: string }) {
  const level = SCALES[name];
  if (level) {
    return (
      <span className={`flex items-end gap-[3px] ${className}`} aria-hidden="true">
        {[1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className="w-[4px] rounded-[1px] transition-colors"
            style={{
              height: `${5 + i * 4}px`,
              background: i <= level ? "currentColor" : "var(--line)",
            }}
          />
        ))}
      </span>
    );
  }
  const Icon = ICONS[name] ?? Sparkles;
  return <Icon className={className} strokeWidth={1.6} />;
}
