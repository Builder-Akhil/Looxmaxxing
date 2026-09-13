/**
 * Twelve-season colour analysis.
 * Season is derived from three axes the vision model reads off a face:
 * undertone (warm / cool / neutral), value (light / deep) and chroma (soft / bright).
 */

export type Swatch = { hex: string; name: string };

export type Season = {
  key: string;
  name: string;
  family: "Spring" | "Summer" | "Autumn" | "Winter";
  undertone: "warm" | "cool" | "neutral";
  contrast: "low" | "medium" | "high";
  line: string;
  metals: string;
  swatches: Swatch[];
  avoid: Swatch[];
};

export const SEASONS: Season[] = [
  {
    key: "light_spring",
    name: "Light Spring",
    family: "Spring",
    undertone: "warm",
    contrast: "low",
    line: "Warm, delicate and clear. Your colours are sunlit rather than saturated.",
    metals: "Light gold, rose gold. Skip heavy antique brass.",
    swatches: [
      { hex: "#F7D9C4", name: "Peach cream" },
      { hex: "#F2B880", name: "Apricot" },
      { hex: "#C9DDA4", name: "New leaf" },
      { hex: "#8ECAD1", name: "Shallow water" },
      { hex: "#F6E7A1", name: "Butter" },
      { hex: "#E9927C", name: "Coral clay" },
      { hex: "#B9A8D6", name: "Soft iris" },
      { hex: "#FAF5EC", name: "Warm ivory" },
    ],
    avoid: [
      { hex: "#000000", name: "True black" },
      { hex: "#4A0E2E", name: "Blackened plum" },
      { hex: "#2B2B2B", name: "Charcoal" },
    ],
  },
  {
    key: "warm_spring",
    name: "True Spring",
    family: "Spring",
    undertone: "warm",
    contrast: "medium",
    line: "Golden and lively. Warmth is the constant; brightness is the trick.",
    metals: "Yellow gold, polished brass.",
    swatches: [
      { hex: "#F2A03D", name: "Marigold" },
      { hex: "#E4572E", name: "Chilli" },
      { hex: "#7FB069", name: "Grass" },
      { hex: "#3CAEA3", name: "Turquoise" },
      { hex: "#F6C445", name: "Saffron" },
      { hex: "#D96C3F", name: "Terracotta" },
      { hex: "#8C6239", name: "Toffee" },
      { hex: "#FFF3DC", name: "Cream" },
    ],
    avoid: [
      { hex: "#5E6E7F", name: "Dusty slate" },
      { hex: "#000000", name: "True black" },
      { hex: "#B7AEC4", name: "Cool mauve" },
    ],
  },
  {
    key: "bright_spring",
    name: "Bright Spring",
    family: "Spring",
    undertone: "warm",
    contrast: "high",
    line: "Warm but high-voltage. Muted shades will flatten you.",
    metals: "Bright gold, mirror-polished.",
    swatches: [
      { hex: "#FF6B35", name: "Flame" },
      { hex: "#00A6A6", name: "Peacock" },
      { hex: "#F7C325", name: "Citron" },
      { hex: "#E8175D", name: "Watermelon" },
      { hex: "#3BB273", name: "Emerald grass" },
      { hex: "#2B7FD1", name: "Clear blue" },
      { hex: "#F4F1DE", name: "Bright ivory" },
      { hex: "#2E2A25", name: "Soft espresso" },
    ],
    avoid: [
      { hex: "#9A9187", name: "Mushroom" },
      { hex: "#6E7B6B", name: "Dusty olive" },
      { hex: "#B0A8B9", name: "Grey lilac" },
    ],
  },
  {
    key: "light_summer",
    name: "Light Summer",
    family: "Summer",
    undertone: "cool",
    contrast: "low",
    line: "Cool and airy. Think early morning, not midday.",
    metals: "White gold, brushed silver.",
    swatches: [
      { hex: "#BFD7EA", name: "Powder blue" },
      { hex: "#E7C6D4", name: "Rose quartz" },
      { hex: "#A8C3A0", name: "Sea glass" },
      { hex: "#C5C6D0", name: "Pearl grey" },
      { hex: "#9BB7D4", name: "Cornflower" },
      { hex: "#D8BFD8", name: "Thistle" },
      { hex: "#6E85A8", name: "Denim" },
      { hex: "#F5F7FA", name: "Cool white" },
    ],
    avoid: [
      { hex: "#000000", name: "True black" },
      { hex: "#8C3B00", name: "Burnt orange" },
      { hex: "#C79A00", name: "Mustard" },
    ],
  },
  {
    key: "cool_summer",
    name: "True Summer",
    family: "Summer",
    undertone: "cool",
    contrast: "medium",
    line: "Cool, slightly muted, never harsh. Grey is your friend, not your enemy.",
    metals: "Silver, platinum.",
    swatches: [
      { hex: "#5B7C99", name: "Storm blue" },
      { hex: "#A84E68", name: "Raspberry" },
      { hex: "#7D8CA3", name: "Slate" },
      { hex: "#89A69B", name: "Eucalyptus" },
      { hex: "#4C5C77", name: "Navy haze" },
      { hex: "#C9A9C0", name: "Orchid" },
      { hex: "#6B6F7D", name: "Graphite" },
      { hex: "#EEF1F4", name: "Soft white" },
    ],
    avoid: [
      { hex: "#FF6B35", name: "Flame orange" },
      { hex: "#F7C325", name: "Citron" },
      { hex: "#000000", name: "True black" },
    ],
  },
  {
    key: "soft_summer",
    name: "Soft Summer",
    family: "Summer",
    undertone: "neutral",
    contrast: "low",
    line: "Everything a half-step muted. Saturation is what ages you, not age.",
    metals: "Brushed silver, matte pewter.",
    swatches: [
      { hex: "#8A9A9A", name: "Sea fog" },
      { hex: "#9D7E8E", name: "Dusty plum" },
      { hex: "#7C8B6F", name: "Sage" },
      { hex: "#5F6B7A", name: "Blue steel" },
      { hex: "#B79E9A", name: "Rosewood ash" },
      { hex: "#4E5A63", name: "Deep slate" },
      { hex: "#C4C3BB", name: "Stone" },
      { hex: "#EDEDE8", name: "Chalk" },
    ],
    avoid: [
      { hex: "#FF0040", name: "Hot red" },
      { hex: "#00E5FF", name: "Electric cyan" },
      { hex: "#000000", name: "True black" },
    ],
  },
  {
    key: "soft_autumn",
    name: "Soft Autumn",
    family: "Autumn",
    undertone: "neutral",
    contrast: "low",
    line: "Warm and dusty. Earth tones with the volume turned down.",
    metals: "Antique gold, aged brass.",
    swatches: [
      { hex: "#A68A64", name: "Camel" },
      { hex: "#8C7B6B", name: "Driftwood" },
      { hex: "#7D8471", name: "Moss" },
      { hex: "#B5735B", name: "Clay" },
      { hex: "#6B7B8C", name: "Denim dust" },
      { hex: "#C7B299", name: "Oat" },
      { hex: "#5E5145", name: "Bark" },
      { hex: "#F3EDE1", name: "Parchment" },
    ],
    avoid: [
      { hex: "#000000", name: "True black" },
      { hex: "#FF2D95", name: "Shocking pink" },
      { hex: "#FFFFFF", name: "Optic white" },
    ],
  },
  {
    key: "warm_autumn",
    name: "True Autumn",
    family: "Autumn",
    undertone: "warm",
    contrast: "medium",
    line: "Rich, warm and grounded. Spice rack, not sweet shop.",
    metals: "Yellow gold, copper, bronze.",
    swatches: [
      { hex: "#A6521C", name: "Rust" },
      { hex: "#6B7B2E", name: "Olive" },
      { hex: "#C08A2E", name: "Ochre" },
      { hex: "#7A3B2E", name: "Brick" },
      { hex: "#3F5E4C", name: "Forest" },
      { hex: "#8E6B3F", name: "Bronze" },
      { hex: "#4A3B2A", name: "Espresso" },
      { hex: "#F0E6D2", name: "Sand" },
    ],
    avoid: [
      { hex: "#FF69B4", name: "Bubblegum" },
      { hex: "#C0C6CC", name: "Icy grey" },
      { hex: "#000000", name: "True black" },
    ],
  },
  {
    key: "deep_autumn",
    name: "Deep Autumn",
    family: "Autumn",
    undertone: "warm",
    contrast: "high",
    line: "Warm and deep. You can carry weight that washes other people out.",
    metals: "Dark gold, oxidised bronze.",
    swatches: [
      { hex: "#5C1F1B", name: "Oxblood" },
      { hex: "#2F3E2E", name: "Pine" },
      { hex: "#8A4B1F", name: "Cinnamon" },
      { hex: "#3B3129", name: "Dark walnut" },
      { hex: "#1F3B46", name: "Teal ink" },
      { hex: "#A8762B", name: "Old gold" },
      { hex: "#6B2C39", name: "Mulberry" },
      { hex: "#EDE2CC", name: "Bone" },
    ],
    avoid: [
      { hex: "#BFD7EA", name: "Powder blue" },
      { hex: "#F7D9C4", name: "Peach cream" },
      { hex: "#C5C6D0", name: "Pearl grey" },
    ],
  },
  {
    key: "deep_winter",
    name: "Deep Winter",
    family: "Winter",
    undertone: "cool",
    contrast: "high",
    line: "Cool and dramatic. Black actually works on you — it does not on most people.",
    metals: "Silver, gunmetal, white gold.",
    swatches: [
      { hex: "#1A1A1A", name: "True black" },
      { hex: "#2C1B47", name: "Aubergine" },
      { hex: "#13315C", name: "Ink navy" },
      { hex: "#7A0B2E", name: "Deep cherry" },
      { hex: "#1F4D3D", name: "Bottle green" },
      { hex: "#4A4E69", name: "Iron violet" },
      { hex: "#B0B7C3", name: "Cold steel" },
      { hex: "#FFFFFF", name: "Optic white" },
    ],
    avoid: [
      { hex: "#C7B299", name: "Oat" },
      { hex: "#A68A64", name: "Camel" },
      { hex: "#E9927C", name: "Coral clay" },
    ],
  },
  {
    key: "cool_winter",
    name: "True Winter",
    family: "Winter",
    undertone: "cool",
    contrast: "high",
    line: "Icy and exact. Anything warm or dusty reads as dirt against your skin.",
    metals: "Polished silver, platinum.",
    swatches: [
      { hex: "#00304E", name: "Prussian" },
      { hex: "#B00A3E", name: "True red" },
      { hex: "#005F60", name: "Deep teal" },
      { hex: "#5F2E7E", name: "Royal purple" },
      { hex: "#0E0E0E", name: "Jet" },
      { hex: "#D8E2EA", name: "Ice blue" },
      { hex: "#8E9BAA", name: "Cool grey" },
      { hex: "#FFFFFF", name: "Optic white" },
    ],
    avoid: [
      { hex: "#C08A2E", name: "Ochre" },
      { hex: "#A6521C", name: "Rust" },
      { hex: "#7D8471", name: "Moss" },
    ],
  },
  {
    key: "bright_winter",
    name: "Bright Winter",
    family: "Winter",
    undertone: "cool",
    contrast: "high",
    line: "Cool, clear and loud. Muted is the only thing that fails you.",
    metals: "Bright silver, chrome.",
    swatches: [
      { hex: "#E6004C", name: "Fuchsia red" },
      { hex: "#0057D9", name: "Electric blue" },
      { hex: "#00A878", name: "Jade" },
      { hex: "#7B2FF7", name: "Violet" },
      { hex: "#111111", name: "Jet" },
      { hex: "#00C2D1", name: "Cyan" },
      { hex: "#FFD166", name: "Icy gold" },
      { hex: "#FFFFFF", name: "Optic white" },
    ],
    avoid: [
      { hex: "#8C7B6B", name: "Driftwood" },
      { hex: "#9A9187", name: "Mushroom" },
      { hex: "#B79E9A", name: "Rosewood ash" },
    ],
  },
];

export function seasonByKey(key?: string | null): Season {
  return SEASONS.find((s) => s.key === key) ?? SEASONS[7]; // True Autumn is the safe default
}

/** Fallback derivation when the model gives us axes but no season name. */
export function deriveSeason(
  undertone?: string | null,
  contrast?: string | null,
): Season {
  const u = (undertone ?? "neutral").toLowerCase();
  const c = (contrast ?? "medium").toLowerCase();
  const table: Record<string, string> = {
    "warm|low": "soft_autumn",
    "warm|medium": "warm_autumn",
    "warm|high": "deep_autumn",
    "cool|low": "light_summer",
    "cool|medium": "cool_summer",
    "cool|high": "cool_winter",
    "neutral|low": "soft_summer",
    "neutral|medium": "soft_autumn",
    "neutral|high": "deep_winter",
  };
  return seasonByKey(table[`${u}|${c}`]);
}
