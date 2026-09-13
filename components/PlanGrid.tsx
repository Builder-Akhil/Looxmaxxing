import clsx from "clsx";
import { Check, Minus } from "lucide-react";
import { Badge, ButtonLink, Card } from "./ui";
import { PLANS, CREDIT_PACK, formatPrice, yearlySaving, type Tier } from "@/lib/pricing";
import type { Market } from "@/lib/brand";
import { setTier } from "@/lib/actions/account";

export function PlanGrid({
  market,
  currentTier,
  inApp = false,
}: {
  market: Market;
  currentTier?: Tier;
  inApp?: boolean;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-5 lg:grid-cols-3">
        {PLANS.map((plan) => {
          const price = plan.price[market];
          const current = currentTier === plan.tier;
          const saving = yearlySaving(plan, market);

          return (
            <Card
              key={plan.tier}
              lift={plan.featured}
              className={clsx(
                "flex flex-col p-6",
                plan.featured && "border-brass",
                current && "ring-1 ring-brass",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-display text-[24px] font-bold tracking-[-0.01em]">{plan.name}</h3>
                {current ? (
                  <Badge tone="sage">Your plan</Badge>
                ) : plan.featured ? (
                  <Badge tone="brass">Most people</Badge>
                ) : null}
              </div>
              <p className="mt-1.5 text-[14.5px] text-muted">{plan.pitch}</p>

              <div className="mt-5 flex items-baseline gap-1.5">
                <span className="font-display text-[38px] font-bold leading-none tnum">
                  {formatPrice(price.monthly, market)}
                </span>
                {price.monthly > 0 && <span className="text-[14px] text-muted">/month</span>}
              </div>
              {price.yearly > 0 && (
                <p className="mt-1.5 font-mono text-[11.5px] text-faint">
                  or {formatPrice(price.yearly, market)}/year — {saving}% off
                </p>
              )}

              <ul className="mt-6 flex flex-1 flex-col gap-2.5">
                {plan.highlights.map((h) => (
                  <li key={h} className="flex gap-2.5 text-[14.5px] leading-snug text-ink-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-sage" strokeWidth={2.2} />
                    {h}
                  </li>
                ))}
                {plan.missing?.map((m) => (
                  <li key={m} className="flex gap-2.5 text-[14.5px] leading-snug text-faint">
                    <Minus className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2.2} />
                    {m}
                  </li>
                ))}
              </ul>

              <div className="mt-7">
                {inApp ? (
                  current ? (
                    <div className="flex h-10 items-center justify-center border border-line text-[14px] text-muted">
                      Current plan
                    </div>
                  ) : (
                    <form action={setTier}>
                      <input type="hidden" name="tier" value={plan.tier} />
                      <button
                        type="submit"
                        className={clsx(
                          "h-10 w-full rounded-sm text-[14.5px] font-medium transition-colors",
                          plan.featured
                            ? "bg-brass text-on-brass hover:bg-brass-bright"
                            : "border border-line bg-surface hover:border-brass hover:text-brass-ink",
                        )}
                      >
                        {plan.tier === "free" ? "Move to Free" : `Switch to ${plan.name}`}
                      </button>
                    </form>
                  )
                ) : (
                  <ButtonLink
                    href="/signup"
                    variant={plan.featured ? "brass" : "outline"}
                    className="w-full"
                  >
                    {plan.tier === "free" ? "Start free" : `Get ${plan.name}`}
                  </ButtonLink>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <p className="text-[15.5px] font-semibold text-ink">
            Top-up credits — {CREDIT_PACK.tryons} AI try-ons for{" "}
            {formatPrice(CREDIT_PACK.price[market], market)}
          </p>
          <p className="mt-1 text-[14px] text-muted">
            Works on any plan, including Free. Never expires. Only spent when an
            image actually arrives.
          </p>
        </div>
        <Badge tone="neutral">Coming with payments</Badge>
      </Card>
    </div>
  );
}
