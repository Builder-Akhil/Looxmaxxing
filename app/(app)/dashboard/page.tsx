import type { Metadata } from "next";
import Link from "next/link";
import { CalendarClock, ScrollText } from "lucide-react";
import { StyleDnaCard } from "@/components/StyleDnaCard";
import { NewSessionButton } from "@/components/NewSessionButton";
import { Silhouette } from "@/components/Silhouette";
import { Card, ButtonLink, EmptyState, Meter, Badge, Callout } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";
import { planFor, type Tier, FEATURE_LABEL } from "@/lib/pricing";
import type { LookRow, StyleProfileRow } from "@/lib/types";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const period = new Date().toISOString().slice(0, 7);

  const [
    { data: profile },
    { data: dna },
    { data: saved },
    { data: lastSession },
    { data: routine },
    { data: usage },
    { data: tierRaw },
    { data: credits },
  ] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", user!.id).maybeSingle(),
    supabase.from("style_profiles").select("*").eq("is_current", true).maybeSingle(),
    supabase.from("looks").select("*").eq("saved", true).order("created_at", { ascending: false }).limit(4),
    supabase.from("styling_sessions").select("id, created_at, summary").order("created_at", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("routines").select("*").maybeSingle(),
    supabase.from("usage_counters").select("feature, used").eq("period", period),
    supabase.rpc("current_tier"),
    supabase.rpc("my_credit_balance"),
  ]);

  const tier = (tierRaw as Tier) ?? "free";
  const plan = planFor(tier);
  const firstName = profile?.full_name?.split(" ")[0];
  const usedFor = (f: string) => usage?.find((u) => u.feature === f)?.used ?? 0;

  const nextTrim = routine?.next_trim_on ? new Date(routine.next_trim_on) : null;
  const daysToTrim = nextTrim
    ? Math.ceil((nextTrim.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  if (!dna) {
    return (
      <div className="mx-auto max-w-2xl py-10">
        <h1 className="font-display text-[clamp(28px,4.4vw,40px)] font-bold leading-tight tracking-[-0.015em]">
          {firstName ? `Right then, ${firstName}.` : "Right then."}
        </h1>
        <p className="mt-3 text-[16.5px] leading-relaxed text-ink-2">
          Nothing here yet — because we haven&rsquo;t read your face. Nine questions
          and one photo, about three minutes.
        </p>
        <div className="mt-8">
          <EmptyState title="No Style DNA yet" action={<ButtonLink href="/start/quiz" variant="brass" size="lg">Start my reading</ButtonLink>}>
            Your face shape, hair type, density, undertone and contrast — with the
            looks that follow from them.
          </EmptyState>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Your dashboard</p>
          <h1 className="mt-2 font-display text-[clamp(28px,4.2vw,40px)] font-bold leading-tight tracking-[-0.015em]">
            {firstName ? `Hello, ${firstName}` : "Hello"}
          </h1>
        </div>
        <NewSessionButton />
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <StyleDnaCard dna={dna as StyleProfileRow} />

        <div className="flex flex-col gap-6">
          {/* next trim */}
          <Card className="p-5">
            <div className="flex items-center gap-2 border-b border-line pb-3">
              <CalendarClock className="h-4 w-4 text-brass" />
              <p className="eyebrow">Next trim</p>
            </div>
            {daysToTrim !== null ? (
              <div className="pt-4">
                <p className="font-display text-[36px] font-bold leading-none tnum">
                  {daysToTrim > 0 ? daysToTrim : 0}
                  <span className="ml-2 font-sans text-[15px] font-normal text-muted">
                    {daysToTrim === 1 ? "day" : "days"}
                  </span>
                </p>
                <p className="mt-2 text-[14px] text-muted">
                  {daysToTrim <= 0
                    ? "Overdue. Book it."
                    : nextTrim!.toLocaleDateString("en-GB", { day: "numeric", month: "long" })}
                </p>
              </div>
            ) : (
              <div className="pt-4">
                <p className="text-[14.5px] leading-relaxed text-muted">
                  Not set yet. Pick the look you went with and we&rsquo;ll work out the rhythm.
                </p>
                <Link href="/routine" className="mt-3 inline-block text-[14px] text-brass-ink underline underline-offset-4">
                  Set up my routine
                </Link>
              </div>
            )}
          </Card>

          {/* plan + usage */}
          <Card className="p-5">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <p className="eyebrow">This month</p>
              <Badge tone={tier === "free" ? "neutral" : "brass"}>{plan.name}</Badge>
            </div>
            <div className="flex flex-col gap-4 pt-4">
              {(["styling_session", "tryon", "barber_card"] as const).map((f) => (
                <Meter key={f} label={FEATURE_LABEL[f]} used={usedFor(f)} limit={plan.limits[f]} />
              ))}
            </div>
            {typeof credits === "number" && credits > 0 && (
              <p className="mt-4 border-t border-line pt-3 font-mono text-[12px] text-muted">
                + {credits} top-up try-on credits
              </p>
            )}
            <Link href="/billing" className="mt-4 inline-block text-[14px] text-brass-ink underline underline-offset-4">
              {tier === "free" ? "See what Plus adds" : "Manage plan"}
            </Link>
          </Card>
        </div>
      </div>

      {/* saved looks */}
      <section>
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3 border-t-2 border-brass pt-4">
          <h2 className="font-display text-[24px] font-bold tracking-[-0.01em]">Saved looks</h2>
          {lastSession && (
            <Link href={`/style/${lastSession.id}`} className="text-[14px] text-brass-ink underline underline-offset-4">
              Open your latest session
            </Link>
          )}
        </div>

        {saved && saved.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {(saved as LookRow[]).map((look) => (
              <Card key={look.id} className="flex flex-col p-4">
                <div className="mx-auto w-[80px] text-ink">
                  <Silhouette look={look.silhouette} className="h-[96px] w-full" />
                </div>
                <h3 className="mt-2 text-center font-display text-[17px] font-bold leading-tight">{look.name}</h3>
                <p className="mt-1 text-center font-mono text-[11px] text-faint">
                  {look.salon_weeks}w · {look.morning_minutes} min
                </p>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Nothing saved yet"
            action={lastSession ? <ButtonLink href={`/style/${lastSession.id}`} variant="outline">Open your looks</ButtonLink> : undefined}
          >
            Tap the bookmark on any look and it lands here, ready for the chair.
          </EmptyState>
        )}
      </section>

      {saved && saved.length > 0 && (
        <Callout tone="sage" title="Next step">
          <span className="inline-flex items-center gap-1.5">
            <ScrollText className="h-3.5 w-3.5" />
            Make a barber card for the one you&rsquo;ve chosen — guard numbers, technique
            and the exact words, in English and Hindi.
          </span>
        </Callout>
      )}
    </div>
  );
}
