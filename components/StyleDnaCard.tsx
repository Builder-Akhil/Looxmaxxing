import { Card, Badge } from "@/components/ui";
import { pretty, type StyleProfileRow } from "@/lib/types";
import { seasonByKey } from "@/lib/palette";

export function StyleDnaCard({ dna, compact = false }: { dna: StyleProfileRow; compact?: boolean }) {
  const season = seasonByKey(dna.season);

  const rows: [string, string][] = [
    ["Face shape", pretty(dna.face_shape)],
    ["Jawline", pretty(dna.jawline)],
    ["Hair type", dna.hair_type ?? "—"],
    ["Texture", pretty(dna.hair_texture)],
    ["Density", pretty(dna.hair_density)],
    ["Hairline", pretty(dna.hairline)],
    ["Undertone", pretty(dna.undertone)],
    ["Contrast", pretty(dna.contrast_level)],
    ["Season", season.name],
  ];
  const shown = compact ? rows.slice(0, 6) : rows;

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
        <p className="eyebrow">Your Style DNA</p>
        <div className="flex items-center gap-2">
          {dna.source === "mock" && <Badge tone="neutral">Rule engine</Badge>}
          {dna.confidence !== null && (
            <span className="font-mono text-[11px] tnum text-faint">
              {Math.round(dna.confidence * 100)}% confidence
            </span>
          )}
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-x-6 gap-y-4 py-5 sm:grid-cols-3">
        {shown.map(([k, v]) => (
          <div key={k}>
            <dt className="font-mono text-[10px] uppercase tracking-[0.11em] text-faint">{k}</dt>
            <dd className="mt-0.5 text-[15.5px] font-semibold leading-tight text-ink">{v}</dd>
          </div>
        ))}
      </dl>

      {!compact && dna.notable_features && dna.notable_features.length > 0 && (
        <div className="border-t border-line pt-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.11em] text-faint">What stands out</p>
          <ul className="mt-2 space-y-1.5">
            {dna.notable_features.map((f) => (
              <li key={f} className="flex gap-2.5 text-[14.5px] leading-snug text-ink-2">
                <span className="mt-2.5 h-px w-3 shrink-0 bg-brass" />
                {f}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
