/**
 * The one place the product is named.
 * Change NAME here and the entire app, its metadata and its emails follow.
 */
export const brand = {
  name: "Looxmaxxing",
  shortName: "Loox",
  tagline: "AI grooming that speaks fluent barber.",
  description:
    "AI grooming and styling for your face. Get a hairstyle, beard and colour palette that actually suit you — plus a card your barber can follow.",
  domain: "looxmaxxing.com",
  supportEmail: "hello@looxmaxxing.com",
  /** Markets we operate in. First one is the default. */
  markets: ["IN", "UK"] as const,
} as const;

export type Market = (typeof brand.markets)[number];
