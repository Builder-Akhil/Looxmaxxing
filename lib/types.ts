import type { Silhouette } from "./validation";

export type LookRow = {
  id: string;
  name: string;
  category: "hair" | "beard" | "moustache" | "brow";
  rank: number;
  why: string | null;
  maintenance: "low" | "medium" | "high" | null;
  salon_weeks: number | null;
  morning_minutes: number | null;
  monthly_cost_inr: number | null;
  styling_notes: string | null;
  products: string[] | null;
  silhouette: Silhouette;
  saved: boolean;
};

export type StyleProfileRow = {
  id: string;
  face_shape: string | null;
  jawline: string | null;
  forehead: string | null;
  hair_type: string | null;
  hair_density: string | null;
  hair_texture: string | null;
  hairline: string | null;
  undertone: string | null;
  contrast_level: string | null;
  season: string | null;
  beard_coverage: string | null;
  brow_shape: string | null;
  notable_features: string[] | null;
  confidence: number | null;
  source: "ai" | "mock" | "manual";
  created_at: string;
};

export type PaletteJson = {
  season?: string;
  name?: string;
  line?: string;
  metals?: string;
  swatches?: { hex: string; name: string }[];
  avoid?: { hex: string; name: string }[];
};

export const TITLE_CASE: Record<string, string> = {
  widows_peak: "Widow's peak",
  three_quarter: "Three-quarter",
};

export function pretty(value: string | null | undefined): string {
  if (!value) return "—";
  if (TITLE_CASE[value]) return TITLE_CASE[value];
  return value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, " ");
}
