import type { Silhouette as SilhouetteKey } from "@/lib/validation";

/* ------------------------------------------------------------------
   Every look card is drawn, not photographed.
   One head, one set of parameters, eighteen silhouettes. Generating the
   paths from numbers keeps them consistent with each other — which is
   what makes a grid of them read as one system.
------------------------------------------------------------------- */

type Fringe = "blunt" | "swept" | "split" | "back" | "round" | "none";
type Texture = "smooth" | "wave" | "curl";

type Spec = {
  volume: number; // how far the hair sits outside the skull
  lift: number; // extra height at the crown
  sideDrop: number; // how far down the sides the hair comes
  fringeY: number; // where the hairline sits on the forehead
  fringe: Fringe;
  texture: Texture;
  /** Hair that continues past the jaw, as a second mass. */
  lengthPast?: number;
  beard?: BeardKey;
};

type BeardKey = "none" | "stubble" | "boxed" | "full" | "goatee" | "moustache";

const HEAD = { cx: 80, top: 38, halfW: 28, jawY: 118 };

const SPECS: Record<SilhouetteKey, Spec> = {
  textured_crop:      { volume: 3, lift: 5,  sideDrop: 78, fringeY: 56, fringe: "blunt",  texture: "wave" },
  mid_fade_pompadour: { volume: 2, lift: 16, sideDrop: 70, fringeY: 46, fringe: "back",   texture: "smooth" },
  classic_side_part:  { volume: 3, lift: 7,  sideDrop: 80, fringeY: 52, fringe: "swept",  texture: "smooth" },
  buzz_cut:           { volume: 1, lift: 1,  sideDrop: 84, fringeY: 54, fringe: "round",  texture: "smooth" },
  crew_cut:           { volume: 2, lift: 4,  sideDrop: 80, fringeY: 53, fringe: "round",  texture: "smooth" },
  curtain_fringe:     { volume: 5, lift: 6,  sideDrop: 96, fringeY: 62, fringe: "split",  texture: "wave" },
  slick_back:         { volume: 3, lift: 10, sideDrop: 82, fringeY: 44, fringe: "back",   texture: "smooth" },
  quiff:              { volume: 3, lift: 18, sideDrop: 76, fringeY: 48, fringe: "back",   texture: "wave" },
  curly_top_taper:    { volume: 9, lift: 12, sideDrop: 74, fringeY: 56, fringe: "round",  texture: "curl" },
  long_layers:        { volume: 6, lift: 5,  sideDrop: 108, fringeY: 58, fringe: "swept", texture: "wave", lengthPast: 26 },
  blunt_bob:          { volume: 6, lift: 4,  sideDrop: 116, fringeY: 54, fringe: "blunt", texture: "smooth" },
  shag:               { volume: 8, lift: 8,  sideDrop: 104, fringeY: 60, fringe: "split", texture: "wave", lengthPast: 16 },

  clean_shave:        { volume: 3, lift: 5,  sideDrop: 78, fringeY: 54, fringe: "round",  texture: "smooth", beard: "none" },
  light_stubble:      { volume: 3, lift: 5,  sideDrop: 78, fringeY: 54, fringe: "round",  texture: "smooth", beard: "stubble" },
  short_boxed:        { volume: 3, lift: 5,  sideDrop: 78, fringeY: 54, fringe: "round",  texture: "smooth", beard: "boxed" },
  full_beard:         { volume: 3, lift: 5,  sideDrop: 78, fringeY: 54, fringe: "round",  texture: "smooth", beard: "full" },
  goatee:             { volume: 3, lift: 5,  sideDrop: 78, fringeY: 54, fringe: "round",  texture: "smooth", beard: "goatee" },
  chevron_moustache:  { volume: 3, lift: 5,  sideDrop: 78, fringeY: 54, fringe: "round",  texture: "smooth", beard: "moustache" },
};

function hairPath(s: Spec): string {
  const L = HEAD.cx - HEAD.halfW - s.volume;
  const R = HEAD.cx + HEAD.halfW + s.volume;
  const top = HEAD.top - s.lift;
  const drop = s.sideDrop;
  const innerL = L + 8;
  const innerR = R - 8;
  const f = s.fringeY;

  // Outer boundary: left side, over the crown, down the right side.
  let d = `M ${L} ${drop} C ${L} ${72} ${L - 1} ${48} ${HEAD.cx} ${top} C ${R + 1} ${48} ${R} ${72} ${R} ${drop} `;

  // Inner boundary, returning right to left across the forehead.
  d += `L ${innerR} ${drop} `;
  switch (s.fringe) {
    case "blunt":
      d += `L ${innerR} ${f} L ${innerL} ${f} `;
      break;
    case "swept":
      d += `L ${innerR} ${f - 6} C ${HEAD.cx + 4} ${f + 10} ${HEAD.cx - 14} ${f + 2} ${innerL} ${f + 8} `;
      break;
    case "split":
      d += `L ${innerR} ${f - 2} C ${HEAD.cx + 10} ${f + 14} ${HEAD.cx + 2} ${f - 12} ${HEAD.cx} ${f - 14} C ${HEAD.cx - 2} ${f - 12} ${HEAD.cx - 10} ${f + 14} ${innerL} ${f - 2} `;
      break;
    case "back":
      d += `L ${innerR} ${f + 2} C ${HEAD.cx + 12} ${f - 8} ${HEAD.cx - 12} ${f - 8} ${innerL} ${f + 2} `;
      break;
    case "round":
    default:
      d += `L ${innerR} ${f - 1} C ${HEAD.cx + 12} ${f + 9} ${HEAD.cx - 12} ${f + 9} ${innerL} ${f - 1} `;
      break;
  }
  d += `L ${innerL} ${drop} Z`;
  return d;
}

function pastJawPath(s: Spec): string | null {
  if (!s.lengthPast) return null;
  const L = HEAD.cx - HEAD.halfW - s.volume;
  const R = HEAD.cx + HEAD.halfW + s.volume;
  const startY = s.sideDrop - 10;
  const endY = s.sideDrop + s.lengthPast;
  return (
    `M ${L} ${startY} C ${L - 4} ${startY + 18} ${L - 2} ${endY - 6} ${L + 6} ${endY} ` +
    `L ${L + 13} ${endY - 4} L ${L + 13} ${startY} Z ` +
    `M ${R} ${startY} C ${R + 4} ${startY + 18} ${R + 2} ${endY - 6} ${R - 6} ${endY} ` +
    `L ${R - 13} ${endY - 4} L ${R - 13} ${startY} Z`
  );
}

function beardPath(kind: BeardKey): string | null {
  const { cx, jawY } = HEAD;
  switch (kind) {
    case "boxed":
      return `M 54 84 C 54 110 64 ${jawY + 4} ${cx} ${jawY + 5} C 96 ${jawY + 4} 106 110 106 84 C 100 96 92 100 ${cx} 100 C 68 100 60 96 54 84 Z`;
    case "full":
      return `M 51 76 C 49 112 64 ${jawY + 10} ${cx} ${jawY + 12} C 96 ${jawY + 10} 111 112 109 76 C 102 94 92 99 ${cx} 99 C 68 99 58 94 51 76 Z`;
    case "goatee":
      return `M 68 100 C 70 112 74 ${jawY + 3} ${cx} ${jawY + 4} C 86 ${jawY + 3} 90 112 92 100 C 88 106 72 106 68 100 Z`;
    case "moustache":
      return `M 66 96 C 72 92 76 94 ${cx} 94 C 84 94 88 92 94 96 C 88 101 84 100 ${cx} 100 C 76 100 72 101 66 96 Z`;
    default:
      return null;
  }
}

function textureMarks(s: Spec): [number, number, number, number][] {
  if (s.texture === "smooth") return [];
  const marks: [number, number, number, number][] = [];
  const rows = s.texture === "curl" ? 3 : 2;
  for (let r = 0; r < rows; r++) {
    const y = HEAD.top - s.lift + 10 + r * 9;
    for (let i = -2; i <= 2; i++) {
      const x = HEAD.cx + i * 11;
      marks.push([x - 3, y, x + 3, y + (s.texture === "curl" ? 3 : 1)]);
    }
  }
  return marks;
}

export function Silhouette({
  look,
  className = "",
  showFace = true,
}: {
  look: SilhouetteKey;
  className?: string;
  showFace?: boolean;
}) {
  const spec = SPECS[look] ?? SPECS.textured_crop;
  const past = pastJawPath(spec);
  const beard = beardPath(spec.beard ?? "none");
  const stubble = spec.beard === "stubble";

  return (
    <svg
      viewBox="0 0 160 190"
      className={className}
      role="img"
      aria-label={`Illustration of the ${look.replace(/_/g, " ")} silhouette`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* shoulders */}
      <path
        d="M 34 190 C 34 158 54 142 80 142 C 106 142 126 158 126 190"
        stroke="currentColor"
        strokeOpacity="0.32"
        strokeWidth="1.6"
      />
      {/* neck */}
      <path d="M 69 112 L 69 138 M 91 112 L 91 138" stroke="currentColor" strokeOpacity="0.32" strokeWidth="1.6" />
      {/* face */}
      <path
        d="M 52 72 C 52 48 62 38 80 38 C 98 38 108 48 108 72 C 108 98 96 118 80 118 C 64 118 52 98 52 72 Z"
        fill="var(--surface)"
        stroke="currentColor"
        strokeOpacity="0.42"
        strokeWidth="1.6"
      />
      {/* ears */}
      <path d="M 52 70 C 47 68 46 78 51 82" stroke="currentColor" strokeOpacity="0.32" strokeWidth="1.5" />
      <path d="M 108 70 C 113 68 114 78 109 82" stroke="currentColor" strokeOpacity="0.32" strokeWidth="1.5" />

      {showFace && (
        <g stroke="currentColor" strokeOpacity="0.4" strokeWidth="1.5" strokeLinecap="round">
          <path d="M 64 74 L 72 74" />
          <path d="M 88 74 L 96 74" />
          <path d="M 80 78 L 80 90 L 84 92" strokeOpacity="0.28" />
          <path d="M 74 101 C 77 103 83 103 86 101" strokeOpacity="0.32" />
        </g>
      )}

      {/* stubble is drawn as density, not a shape */}
      {stubble && (
        <g fill="currentColor" opacity="0.28">
          {Array.from({ length: 46 }).map((_, i) => {
            const a = (i / 46) * Math.PI;
            const rx = 26 - (i % 5) * 2.4;
            const ry = 30 - (i % 3) * 3;
            const x = 80 + Math.cos(a + 3.14) * rx;
            const y = 88 + Math.sin(a) * ry * 0.62;
            return <circle key={i} cx={x} cy={y} r="0.9" />;
          })}
        </g>
      )}

      {beard && <path d={beard} fill="currentColor" fillOpacity="0.82" />}

      {past && <path d={past} fill="currentColor" fillOpacity="0.9" />}
      <path d={hairPath(spec)} fill="currentColor" fillOpacity="0.92" />

      <g stroke="var(--surface)" strokeOpacity="0.5" strokeWidth="1.2" strokeLinecap="round">
        {textureMarks(spec).map(([x1, y1, x2, y2], i) => (
          <path key={i} d={`M ${x1} ${y1} Q ${(x1 + x2) / 2} ${y1 - 2.5} ${x2} ${y2}`} />
        ))}
      </g>
    </svg>
  );
}
