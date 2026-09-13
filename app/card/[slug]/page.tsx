import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Card } from "@/components/ui";
import { PrintButton } from "@/components/PrintButton";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Barber card",
  robots: { index: false, follow: false },
};

type CardRow = {
  title: string;
  sides: string | null;
  top: string | null;
  back: string | null;
  neckline: string | null;
  parting: string | null;
  technique: string | null;
  guards: Record<string, string>;
  say_this_en: string | null;
  say_this_hi: string | null;
  avoid: string | null;
  beard_notes: string | null;
  created_at: string;
};

export default async function BarberCardPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data } = await supabase.rpc("barber_card_by_slug", { slug });
  const card = (Array.isArray(data) ? data[0] : data) as CardRow | undefined;
  if (!card) notFound();

  const rows: [string, string | null][] = [
    ["Sides", card.sides],
    ["Top", card.top],
    ["Back", card.back],
    ["Neckline", card.neckline],
    ["Parting", card.parting],
    ["Technique", card.technique],
    ["Beard", card.beard_notes],
    ["Do not", card.avoid],
  ];

  return (
    <div className="min-h-dvh bg-paper">
      <header className="no-print border-b border-line">
        <div className="mx-auto flex h-16 w-full max-w-3xl items-center justify-between px-6">
          <Logo size="sm" />
          <PrintButton />
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-6 py-10">
        <Card lift className="print-sheet overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-ink px-6 py-4">
            <div>
              <p className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-paper/55">Barber card</p>
              <h1 className="mt-1 font-display text-[26px] font-bold leading-tight text-paper">{card.title}</h1>
            </div>
            <div className="flex gap-5">
              {(["sides", "back", "top"] as const).map((k) =>
                card.guards?.[k] ? (
                  <div key={k}>
                    <p className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-paper/50">{k}</p>
                    <p className="mt-0.5 font-mono text-[13px] font-semibold text-paper">{card.guards[k]}</p>
                  </div>
                ) : null,
              )}
            </div>
          </div>

          <dl className="divide-y divide-line-soft">
            {rows.map(([k, v]) =>
              v ? (
                <div key={k} className="grid gap-1 px-6 py-4 sm:grid-cols-[110px_1fr] sm:gap-6">
                  <dt className="font-mono text-[10.5px] uppercase tracking-[0.11em] text-faint">{k}</dt>
                  <dd className="text-[15px] leading-relaxed text-ink-2">{v}</dd>
                </div>
              ) : null,
            )}
          </dl>

          {(card.say_this_en || card.say_this_hi) && (
            <div className="border-t border-line bg-brass-wash px-6 py-5">
              <p className="font-mono text-[10.5px] uppercase tracking-[0.11em] text-brass-ink">Say this</p>
              {card.say_this_en && (
                <p className="mt-2 text-[15.5px] leading-snug text-ink">&ldquo;{card.say_this_en}&rdquo;</p>
              )}
              {card.say_this_hi && (
                <p className="mt-2.5 text-[15.5px] leading-snug text-ink-2">&ldquo;{card.say_this_hi}&rdquo;</p>
              )}
            </div>
          )}
        </Card>

        <p className="no-print mt-6 text-center text-[13.5px] text-muted">
          Anyone with this link can see the card — and nothing else about you.{" "}
          <Link href="/dashboard" className="text-brass-ink underline underline-offset-4">
            Back to your dashboard
          </Link>
        </p>
      </main>
    </div>
  );
}
