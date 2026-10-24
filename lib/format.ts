/** Formats a price in minor units (paise/pence) for display. */
export function formatPrice(minor: number, currency: "INR" | "GBP"): string {
  return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-GB", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(minor / 100);
}
