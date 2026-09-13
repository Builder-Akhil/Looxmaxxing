import type { Metadata } from "next";
import { PlanGrid } from "@/components/PlanGrid";
import { Card, Meter, Callout, Badge } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";
import { planFor, FEATURE_LABEL, type Tier } from "@/lib/pricing";
import type { Market } from "@/lib/brand";

export const metadata: Metadata = { title: "Your plan" };

export default async function BillingPage() {
  const supabase = await createClient();
  const period = new Date().toISOString().slice(0, 7);

  const [{ data: profile }, { data: tierRaw }, { data: usage }, { data: credits }, { data: sub }] =
    await Promise.all([
      supabase.from("profiles").select("market").maybeSingle(),
      supabase.rpc("current_tier"),
      supabase.from("usage_counters").select("feature, used").eq("period", period),
      supabase.rpc("my_credit_balance"),
      supabase.from("subscriptions").select("*").maybeSingle(),
    ]);

  const market = (profile?.market as Market) ?? "IN";
  const tier = (tierRaw as Tier) ?? "free";
  const plan = planFor(tier);
  const usedFor = (f: string) => usage?.find((u) => u.feature === f)?.used ?? 0;

  return (
    <div className="flex flex-col gap-8">
      <header>
        <p className="eyebrow">Billing</p>
        <h1 className="mt-2 font-display text-[clamp(28px,4.2vw,40px)] font-bold leading-tight tracking-[-0.015em]">
          Your plan
        </h1>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <Card className="p-6">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <p className="eyebrow">This month</p>
            <Badge tone={tier === "free" ? "neutral" : "brass"}>{plan.name}</Badge>
          </div>
          <div className="flex flex-col gap-4 pt-5">
            {(["styling_session", "tryon", "barber_card"] as const).map((f) => (
              <Meter key={f} label={FEATURE_LABEL[f]} used={usedFor(f)} limit={plan.limits[f]} />
            ))}
          </div>
          <dl className="mt-5 space-y-2 border-t border-line pt-4 font-mono text-[12px] text-muted">
            <div className="flex justify-between">
              <dt>Top-up credits</dt>
              <dd className="tnum text-ink">{typeof credits === "number" ? credits : 0}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Counters reset</dt>
              <dd className="text-ink">1st of the month</dd>
            </div>
            {sub?.current_period_end && (
              <div className="flex justify-between">
                <dt>Renews</dt>
                <dd className="text-ink">
                  {new Date(sub.current_period_end).toLocaleDateString("en-GB")}
                </dd>
              </div>
            )}
          </dl>
        </Card>

        <Callout tone="brass" title="Payments aren't connected yet">
          <p>
            Switching plans below works immediately so you can test every tier — the
            limits you see are enforced by the database, not by the interface.
          </p>
          <p className="mt-2">
            Before launch this gets wired to Razorpay for India and Stripe for the
            UK, and self-service switching turns off. That&rsquo;s a single flag in the
            database: <span className="font-mono text-[13px]">allow_self_upgrade</span>.
          </p>
        </Callout>
      </div>

      <PlanGrid market={market} currentTier={tier} inApp />
    </div>
  );
}
