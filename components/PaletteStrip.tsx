import { Card } from "@/components/ui";
import type { PaletteJson } from "@/lib/types";

export function PaletteStrip({ palette, full = false }: { palette: PaletteJson; full?: boolean }) {
  const swatches = palette.swatches ?? [];
  if (!swatches.length) return null;

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line pb-3">
        <p className="eyebrow">Your colours</p>
        <span className="font-display text-[17px] font-bold text-ink">{palette.name}</span>
      </div>

      {palette.line && <p className="mt-4 text-[15px] leading-relaxed text-ink-2">{palette.line}</p>}

      <div className="mt-5 grid grid-cols-4 gap-2 sm:grid-cols-8">
        {swatches.map((s) => (
          <div key={s.hex} className="flex flex-col items-center gap-1.5">
            <span
              className="aspect-square w-full rounded-sm border border-line"
              style={{ background: s.hex }}
            />
            {full && (
              <span className="text-center text-[10.5px] leading-tight text-muted">{s.name}</span>
            )}
          </div>
        ))}
      </div>

      {full && (
        <div className="mt-6 grid gap-5 border-t border-line pt-5 sm:grid-cols-2">
          {palette.avoid && palette.avoid.length > 0 && (
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.11em] text-faint">Colours to avoid</p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {palette.avoid.map((a) => (
                  <span key={a.hex} className="flex items-center gap-1.5 text-[13px] text-ink-2">
                    <span className="h-4 w-4 rounded-full border border-line" style={{ background: a.hex }} />
                    {a.name}
                  </span>
                ))}
              </div>
            </div>
          )}
          {palette.metals && (
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.11em] text-faint">Metals</p>
              <p className="mt-2.5 text-[14px] leading-relaxed text-ink-2">{palette.metals}</p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
