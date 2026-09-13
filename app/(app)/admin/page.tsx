import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Card, Badge, Callout } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";
import { formatInr } from "@/lib/ai/costs";

export const metadata: Metadata = { title: "Admin" };

type Overview = {
  users_total: number;
  users_7d: number;
  sessions_total: number;
  sessions_7d: number;
  tryons_total: number;
  tryons_failed: number;
  cards_total: number;
  photos_held: number;
  spend_today_inr: number;
  spend_30d_inr: number;
  ai_calls_30d: number;
  ai_failures_30d: number;
  by_tier: Record<string, number>;
  ai_enabled: boolean;
  daily_ceiling: number;
};

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: profile } = await supabase.from("profiles").select("is_admin").maybeSingle();
  if (!profile?.is_admin) redirect("/dashboard");

  const [{ data: raw }, { data: calls }] = await Promise.all([
    supabase.rpc("admin_overview"),
    supabase.from("ai_calls").select("*").order("created_at", { ascending: false }).limit(25),
  ]);
  const o = raw as Overview | null;

  if (!o) {
    return <Callout tone="clay">Couldn&rsquo;t load the overview.</Callout>;
  }

  const failureRate = o.ai_calls_30d ? Math.round((o.ai_failures_30d / o.ai_calls_30d) * 100) : 0;
  const ceilingUsed = o.daily_ceiling ? Math.round((o.spend_today_inr / o.daily_ceiling) * 100) : 0;

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Internal</p>
          <h1 className="mt-2 font-display text-[clamp(26px,4vw,36px)] font-bold tracking-[-0.015em]">
            Admin
          </h1>
        </div>
        <div className="flex gap-2">
          <Badge tone={o.ai_enabled ? "sage" : "clay"}>
            AI {o.ai_enabled ? "live" : "paused"}
          </Badge>
          <Badge tone={ceilingUsed > 80 ? "clay" : "neutral"}>
            {ceilingUsed}% of today&rsquo;s ceiling
          </Badge>
        </div>
      </header>

      <div className="grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Users", o.users_total, `+${o.users_7d} this week`],
          ["Styling sessions", o.sessions_total, `+${o.sessions_7d} this week`],
          ["Barber cards", o.cards_total, "lifetime"],
          ["Photos held", o.photos_held, "awaiting deletion sweep"],
          ["Spend today", formatInr(o.spend_today_inr), `ceiling ${formatInr(o.daily_ceiling)}`],
          ["Spend, 30 days", formatInr(o.spend_30d_inr), `${o.ai_calls_30d} calls`],
          ["Try-ons", o.tryons_total, `${o.tryons_failed} refunded`],
          ["AI failure rate", `${failureRate}%`, "last 30 days"],
        ].map(([label, value, sub]) => (
          <div key={String(label)} className="bg-surface p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.11em] text-faint">{label}</p>
            <p className="mt-1.5 font-display text-[28px] font-bold leading-none tnum">{value}</p>
            <p className="mt-1.5 text-[12.5px] text-muted">{sub}</p>
          </div>
        ))}
      </div>

      <Card className="p-6">
        <p className="eyebrow border-b border-line pb-3">Subscribers by tier</p>
        <div className="flex flex-wrap gap-8 pt-4">
          {(["free", "plus", "pro"] as const).map((t) => (
            <div key={t}>
              <p className="font-mono text-[10px] uppercase tracking-[0.11em] text-faint">{t}</p>
              <p className="mt-1 font-display text-[26px] font-bold tnum">{o.by_tier?.[t] ?? 0}</p>
            </div>
          ))}
        </div>
      </Card>

      <section>
        <p className="eyebrow mb-3">Recent AI calls</p>
        <div className="overflow-x-auto border border-line bg-surface">
          <table className="w-full min-w-[680px] text-[13.5px]">
            <thead>
              <tr className="border-b border-line bg-surface-2">
                {["When", "Kind", "Model", "In", "Out", "Img", "ms", "Cost", "OK"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-2.5 text-left font-mono text-[10px] uppercase tracking-[0.1em] font-semibold text-faint"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {calls?.map((c) => (
                <tr key={c.id} className="border-b border-line-soft last:border-0">
                  <td className="px-4 py-2.5 font-mono text-[12px] text-muted">
                    {new Date(c.created_at).toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-4 py-2.5">{c.kind}</td>
                  <td className="px-4 py-2.5 font-mono text-[12px] text-muted">{c.model}</td>
                  <td className="px-4 py-2.5 text-right font-mono tnum">{c.input_tokens}</td>
                  <td className="px-4 py-2.5 text-right font-mono tnum">{c.output_tokens}</td>
                  <td className="px-4 py-2.5 text-right font-mono tnum">{c.images}</td>
                  <td className="px-4 py-2.5 text-right font-mono tnum">{c.latency_ms}</td>
                  <td className="px-4 py-2.5 text-right font-mono tnum">{formatInr(Number(c.cost_inr))}</td>
                  <td className="px-4 py-2.5">
                    {c.ok ? (
                      <span className="text-sage">ok</span>
                    ) : (
                      <span className="text-clay" title={c.error ?? ""}>
                        fail
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {!calls?.length && (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-muted">
                    No AI calls yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[13px] text-muted">
          Every call is logged the moment it happens. This table is how you&rsquo;ll know
          your real gross margin within a week of launch, rather than estimating it.
        </p>
      </section>
    </div>
  );
}
