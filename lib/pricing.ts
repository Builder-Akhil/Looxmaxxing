import type { Market } from "./brand";

export type Tier = "free" | "plus" | "pro";
export type Feature = "styling_session" | "tryon" | "barber_card";

export const CURRENCY: Record<Market, { code: "INR" | "GBP"; symbol: string }> = {
  IN: { code: "INR", symbol: "₹" },
  UK: { code: "GBP", symbol: "£" },
};

type Price = { monthly: number; yearly: number };

export type Plan = {
  tier: Tier;
  name: string;
  pitch: string;
  price: Record<Market, Price>;
  limits: Record<Feature, number>;
  highlights: string[];
  missing?: string[];
  featured?: boolean;
};

/**
 * These numbers mirror public.plan_limits in the database.
 * The database is the enforcer; this is what we show on screen.
 */
export const PLANS: Plan[] = [
  {
    tier: "free",
    name: "Free",
    pitch: "Find out what actually suits you.",
    price: { IN: { monthly: 0, yearly: 0 }, UK: { monthly: 0, yearly: 0 } },
    limits: { styling_session: 2, tryon: 0, barber_card: 1 },
    highlights: [
      "Full Style DNA read from your photo",
      "2 styling sessions a month",
      "3 looks per session, with the reasoning",
      "Your core colour swatches",
      "1 barber card a month",
    ],
    missing: ["No AI try-on", "No upkeep reminders"],
  },
  {
    tier: "plus",
    name: "Plus",
    pitch: "For the every-six-weeks crowd.",
    price: { IN: { monthly: 199, yearly: 1799 }, UK: { monthly: 4.99, yearly: 45 } },
    limits: { styling_session: 30, tryon: 3, barber_card: 500 },
    highlights: [
      "Everything in Free",
      "30 styling sessions a month",
      "6 looks per session",
      "Full 12-season colour report",
      "Unlimited barber cards",
      "Upkeep routine and trim reminders",
      "3 AI try-ons a month",
    ],
    featured: true,
  },
  {
    tier: "pro",
    name: "Pro",
    pitch: "See every look on your own face.",
    price: { IN: { monthly: 499, yearly: 4499 }, UK: { monthly: 9.99, yearly: 89 } },
    limits: { styling_session: 60, tryon: 25, barber_card: 500 },
    highlights: [
      "Everything in Plus",
      "25 AI try-ons a month",
      "60 styling sessions a month",
      "Side-by-side look comparison",
      "Priority generation queue",
      "Early access to new stylists",
    ],
  },
];

export const CREDIT_PACK = {
  tryons: 10,
  price: { IN: 149, UK: 1.99 },
};

export function planFor(tier: Tier): Plan {
  return PLANS.find((p) => p.tier === tier) ?? PLANS[0];
}

export function formatPrice(amount: number, market: Market): string {
  const { symbol } = CURRENCY[market];
  if (amount === 0) return "Free";
  const isWhole = Number.isInteger(amount);
  return `${symbol}${isWhole ? amount.toLocaleString("en-IN") : amount.toFixed(2)}`;
}

/** Months-worth of discount baked into the annual price. */
export function yearlySaving(plan: Plan, market: Market): number {
  const { monthly, yearly } = plan.price[market];
  if (!monthly) return 0;
  return Math.round(((monthly * 12 - yearly) / (monthly * 12)) * 100);
}

export const FEATURE_LABEL: Record<Feature, string> = {
  styling_session: "styling sessions",
  tryon: "AI try-ons",
  barber_card: "barber cards",
};
