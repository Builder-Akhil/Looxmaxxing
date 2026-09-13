/**
 * What every AI call costs us, in rupees.
 * These feed public.ai_calls, which is how we know the real gross margin
 * rather than guessing at it.
 */

export const USD_TO_INR = 88;

type TokenPrice = { inPerM: number; outPerM: number };

const TEXT_PRICES: Record<string, TokenPrice> = {
  "gpt-4o-mini": { inPerM: 0.15, outPerM: 0.6 },
  "gpt-4o": { inPerM: 2.5, outPerM: 10 },
  "gpt-4.1-mini": { inPerM: 0.4, outPerM: 1.6 },
  "gpt-4.1": { inPerM: 2.0, outPerM: 8.0 },
};

/** Per generated image, 1024x1024. */
const IMAGE_PRICES: Record<string, number> = {
  "gpt-image-1": 0.04,
  "dall-e-3": 0.04,
};

export function textCostInr(model: string, inputTokens: number, outputTokens: number): number {
  const p = TEXT_PRICES[model] ?? TEXT_PRICES["gpt-4o-mini"];
  const usd = (inputTokens / 1_000_000) * p.inPerM + (outputTokens / 1_000_000) * p.outPerM;
  return round4(usd * USD_TO_INR);
}

export function imageCostInr(model: string, images = 1): number {
  const usd = (IMAGE_PRICES[model] ?? 0.04) * images;
  return round4(usd * USD_TO_INR);
}

function round4(n: number): number {
  return Math.round(n * 10000) / 10000;
}

export function formatInr(n: number): string {
  if (n < 1) return `₹${n.toFixed(2)}`;
  return `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}
