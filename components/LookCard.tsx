"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bookmark, BookmarkCheck, ScrollText, Sparkles, X } from "lucide-react";
import clsx from "clsx";
import { Silhouette } from "./Silhouette";
import { Badge, Button, Callout, Card } from "./ui";
import { createClient } from "@/lib/supabase/client";
import type { LookRow } from "@/lib/types";

const MAINT_TONE = { low: "sage", medium: "brass", high: "clay" } as const;

export function LookCard({
  look,
  rank,
  canTryOn,
}: {
  look: LookRow;
  rank: number;
  canTryOn: boolean;
}) {
  const router = useRouter();
  const [saved, setSaved] = useState(look.saved);
  const [busy, setBusy] = useState<null | "card" | "tryon">(null);
  const [error, setError] = useState<string | null>(null);
  const [tryOnUrl, setTryOnUrl] = useState<string | null>(null);

  async function toggleSave() {
    const next = !saved;
    setSaved(next);
    const supabase = createClient();
    const { error: err } = await supabase.from("looks").update({ saved: next }).eq("id", look.id);
    if (err) setSaved(!next);
  }

  async function makeCard() {
    setBusy("card");
    setError(null);
    try {
      const res = await fetch("/api/barber-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lookId: look.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? "Couldn't write the card.");
        setBusy(null);
        return;
      }
      router.push(`/card/${data.slug}`);
    } catch {
      setError("Lost connection. Try again.");
      setBusy(null);
    }
  }

  async function tryOn() {
    setBusy("tryon");
    setError(null);
    try {
      const res = await fetch("/api/tryon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lookId: look.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? "That didn't work.");
      } else {
        setTryOnUrl(data.url);
      }
    } catch {
      setError("Lost connection. Try again.");
    }
    setBusy(null);
  }

  return (
    <Card className="flex flex-col overflow-hidden">
      <div className="flex items-start gap-5 border-b border-line bg-surface-2/50 p-5">
        <div className="w-[84px] shrink-0 text-ink">
          <Silhouette look={look.silhouette} className="h-[100px] w-full" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] font-semibold text-brass">
              {String(rank).padStart(2, "0")}
            </span>
            {look.category !== "hair" && <Badge tone="neutral">{look.category}</Badge>}
          </div>
          <h3 className="mt-1.5 font-display text-[21px] font-bold leading-tight tracking-[-0.01em]">
            {look.name}
          </h3>
          {look.maintenance && (
            <div className="mt-2.5">
              <Badge tone={MAINT_TONE[look.maintenance]}>{look.maintenance} upkeep</Badge>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={toggleSave}
          aria-label={saved ? "Remove from saved" : "Save this look"}
          aria-pressed={saved}
          className={clsx(
            "shrink-0 rounded-sm p-1.5 transition-colors",
            saved ? "text-brass" : "text-faint hover:text-brass-ink",
          )}
        >
          {saved ? <BookmarkCheck className="h-5 w-5" /> : <Bookmark className="h-5 w-5" />}
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        {look.why && <p className="text-[14.5px] leading-relaxed text-ink-2">{look.why}</p>}

        <dl className="grid grid-cols-3 gap-3 border-y border-line-soft py-3.5">
          <Stat label="Salon" value={look.salon_weeks ? `${look.salon_weeks}w` : "—"} />
          <Stat label="Mornings" value={look.morning_minutes !== null ? `${look.morning_minutes} min` : "—"} />
          <Stat label="Upkeep" value={look.monthly_cost_inr ? `₹${look.monthly_cost_inr}/mo` : "—"} />
        </dl>

        {look.styling_notes && (
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.11em] text-faint">How to style it</p>
            <p className="mt-1.5 text-[14px] leading-relaxed text-ink-2">{look.styling_notes}</p>
          </div>
        )}

        {look.products && look.products.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {look.products.map((p) => (
              <Badge key={p} tone="neutral">
                {p}
              </Badge>
            ))}
          </div>
        )}

        {error && <Callout tone="clay">{error}</Callout>}

        {tryOnUrl && (
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={tryOnUrl} alt={`AI preview of ${look.name} on your photo`} className="w-full rounded-sm border border-line" />
            <button
              type="button"
              onClick={() => setTryOnUrl(null)}
              className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full border border-line bg-surface text-muted"
              aria-label="Close preview"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            <p className="mt-2 font-mono text-[10.5px] uppercase tracking-[0.09em] text-faint">
              AI preview · not a photograph
            </p>
          </div>
        )}

        <div className="mt-auto flex flex-wrap gap-2 pt-1">
          <Button size="sm" variant="outline" onClick={makeCard} disabled={busy !== null}>
            <ScrollText className="h-3.5 w-3.5" />
            {busy === "card" ? "Writing…" : "Barber card"}
          </Button>
          <Button size="sm" variant={canTryOn ? "brass" : "ghost"} onClick={tryOn} disabled={busy !== null}>
            <Sparkles className="h-3.5 w-3.5" />
            {busy === "tryon" ? "Generating…" : "See it on me"}
          </Button>
        </div>
      </div>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-mono text-[10px] uppercase tracking-[0.1em] text-faint">{label}</dt>
      <dd className="mt-0.5 text-[14.5px] font-semibold tnum text-ink">{value}</dd>
    </div>
  );
}
