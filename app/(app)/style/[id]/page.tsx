import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { StyleDnaCard } from "@/components/StyleDnaCard";
import { PaletteStrip } from "@/components/PaletteStrip";
import { LookCard } from "@/components/LookCard";
import { Badge, ButtonLink, Callout } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";
import type { LookRow, StyleProfileRow, PaletteJson } from "@/lib/types";

export const metadata: Metadata = { title: "Your looks" };

export default async function StylePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ fresh?: string }>;
}) {
  const { id } = await params;
  const { fresh } = await searchParams;
  const supabase = await createClient();

  const { data: session } = await supabase
    .from("styling_sessions")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!session) notFound();

  const [{ data: looks }, { data: dna }, { data: tier }] = await Promise.all([
    supabase.from("looks").select("*").eq("session_id", id).order("rank"),
    session.style_profile_id
      ? supabase.from("style_profiles").select("*").eq("id", session.style_profile_id).maybeSingle()
      : Promise.resolve({ data: null }),
    supabase.rpc("current_tier"),
  ]);

  const palette = (session.palette ?? {}) as PaletteJson;
  const canTryOn = tier !== "free";
  const created = new Date(session.created_at);

  return (
    <div className="flex flex-col gap-8">
      <header>
        <div className="flex flex-wrap items-center gap-2">
          <p className="eyebrow">
            {created.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
          </p>
          {session.source === "mock" && <Badge tone="neutral">Rule engine</Badge>}
        </div>
        <h1 className="mt-3 max-w-[22ch] font-display text-[clamp(30px,4.6vw,44px)] font-bold leading-[1.05] tracking-[-0.015em] balance">
          {fresh ? "Here's what suits you" : "Your looks"}
        </h1>
        {session.summary && (
          <p className="mt-4 max-w-[62ch] text-[16.5px] leading-relaxed text-ink-2">{session.summary}</p>
        )}
      </header>

      {session.source === "mock" && (
        <Callout tone="brass" title="Running on the rule engine">
          No AI key is connected yet, so these came from the built-in stylist rules
          rather than a live model — matched to your face shape, hair type and every
          answer you gave. Add an OpenAI key and the same screens run on the model
          instead.
        </Callout>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        {dna && <StyleDnaCard dna={dna as StyleProfileRow} />}
        <PaletteStrip palette={palette} full />
      </div>

      <section>
        <div className="mb-5 flex flex-wrap items-baseline justify-between gap-3 border-t-2 border-brass pt-4">
          <h2 className="font-display text-[26px] font-bold tracking-[-0.01em]">
            {looks?.length ?? 0} looks, ranked
          </h2>
          <p className="text-[14px] text-muted">Save the ones you like — they land on your dashboard.</p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {(looks as LookRow[] | null)?.map((look, i) => (
            <LookCard key={look.id} look={look} rank={i + 1} canTryOn={canTryOn} />
          ))}
        </div>
      </section>

      {!canTryOn && (
        <Callout tone="brass" title="Want to see these on your own face?">
          AI try-on is part of Plus and Pro. Everything else here — the looks, the
          reasoning, the barber cards — stays free.{" "}
          <Link href="/billing" className="text-brass-ink underline underline-offset-2">
            Compare the plans
          </Link>
          .
        </Callout>
      )}

      <div className="flex flex-wrap gap-3 border-t border-line pt-6">
        <ButtonLink href="/dashboard" variant="outline">
          Back to dashboard
        </ButtonLink>
        <ButtonLink href="/history" variant="ghost">
          See every session
        </ButtonLink>
      </div>
    </div>
  );
}
