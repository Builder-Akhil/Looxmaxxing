import type { StyleDna, LookRec, BarberCardData, RecommendationSet } from "@/lib/validation";
import { deriveSeason } from "@/lib/palette";

/* ------------------------------------------------------------------
   The engine that runs when there is no OpenAI key.
   It is deterministic (same person, same result) and rule-based rather
   than random — a real stylist's decision tree, written down.
   This keeps every screen in the product usable and honest while the
   key is missing, and doubles as the fallback if a live call fails.
------------------------------------------------------------------- */

function hash(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function pick<T>(arr: readonly T[], seed: string, salt = ""): T {
  return arr[hash(seed + salt) % arr.length];
}

type Answers = Record<string, string | string[]>;

function has(answers: Answers, key: string, value: string): boolean {
  const a = answers[key];
  return Array.isArray(a) ? a.includes(value) : a === value;
}

export function mockStyleDna(seed: string, answers: Answers): StyleDna {
  const faceShapes = ["oval", "square", "round", "heart", "diamond", "oblong"] as const;
  const face = pick(faceShapes, seed, "face");

  const textures = ["straight", "wavy", "curly", "coily"] as const;
  const texture = pick(textures, seed, "tex");
  const typeByTexture: Record<typeof texture, readonly StyleDna["hair_type"][]> = {
    straight: ["1A", "1B", "1C"],
    wavy: ["2A", "2B", "2C"],
    curly: ["3A", "3B", "3C"],
    coily: ["4A", "4B", "4C"],
  };

  // Things they told us beat anything a photo could suggest.
  const thinning = has(answers, "conditions", "thinning");
  const hairFall = has(answers, "conditions", "hair_fall");
  const patchy = has(answers, "conditions", "patchy_beard");

  const undertone = pick(["warm", "cool", "neutral"] as const, seed, "under");
  const contrast = pick(["low", "medium", "high"] as const, seed, "contrast");

  const features: string[] = [];
  if (face === "square" || face === "diamond") features.push("Strong cheekbone line");
  if (face === "oval") features.push("Balanced proportions — most silhouettes will sit well");
  if (face === "round") features.push("Softer jaw transition; height will lengthen the face");
  if (face === "oblong") features.push("Longer face — width at the sides balances it");
  if (texture === "wavy") features.push("Natural wave does texture work for free");
  if (texture === "curly" || texture === "coily") features.push("Shrinkage means cut length is not worn length");
  if (thinning) features.push("Density lower at the temples — shorter sides read as fuller");

  return {
    face_shape: face,
    jawline: pick(["soft", "defined", "angular"] as const, seed, "jaw"),
    forehead: pick(["low", "average", "tall"] as const, seed, "forehead"),
    hair_type: pick(typeByTexture[texture], seed, "htype"),
    hair_density: thinning || hairFall ? "fine" : pick(["fine", "medium", "thick"] as const, seed, "dens"),
    hair_texture: texture,
    hairline: thinning ? "receding" : pick(["straight", "widows_peak", "uneven"] as const, seed, "hline"),
    undertone,
    contrast_level: contrast,
    beard_coverage: patchy ? "patchy" : pick(["none", "moderate", "full"] as const, seed, "beard"),
    brow_shape: pick(["straight", "arched", "rounded", "angular"] as const, seed, "brow"),
    season: deriveSeason(undertone, contrast).key,
    notable_features: features.slice(0, 5),
    confidence: 0.72,
    read_notes:
      `Your ${face} face shape with ${texture} hair gives you more room than most people realise. ` +
      `The looks below lean into that rather than fighting it.`,
  };
}

/* ---------------------------------------------------------------- the look library */

type LibraryLook = Omit<LookRec, "why"> & {
  suitsFaces: readonly StyleDna["face_shape"][];
  suitsTextures: readonly StyleDna["hair_texture"][];
  minSalonWeeksTolerance: number;
  why: (dna: StyleDna) => string;
};

const LIBRARY: LibraryLook[] = [
  {
    name: "Textured French crop",
    category: "hair",
    silhouette: "textured_crop",
    maintenance: "low",
    salon_weeks: 4,
    morning_minutes: 3,
    monthly_cost_inr: 600,
    styling_notes:
      "Towel dry, a pea-sized amount of matte clay through damp hair, push forward with your fingers. Do not comb it.",
    products: ["matte clay", "sea salt spray"],
    suitsFaces: ["oval", "square", "diamond", "heart"],
    suitsTextures: ["straight", "wavy", "curly"],
    minSalonWeeksTolerance: 5,
    why: (d) =>
      `Your ${d.face_shape} face carries a blunt fringe well, and the crop keeps weight off the sides where your ${d.hair_density} density shows most. The texture on top is cut in, so it holds shape without daily product.`,
  },
  {
    name: "Mid fade with a soft pompadour",
    category: "hair",
    silhouette: "mid_fade_pompadour",
    maintenance: "high",
    salon_weeks: 3,
    morning_minutes: 8,
    monthly_cost_inr: 1600,
    styling_notes:
      "Blow dry upward and back with a round brush, then a matte paste to hold. Ten minutes, not five — this is the trade.",
    products: ["matte paste", "pre-styling powder", "medium-hold hairspray"],
    suitsFaces: ["round", "oval", "square"],
    suitsTextures: ["straight", "wavy"],
    minSalonWeeksTolerance: 3,
    why: (d) =>
      `Height on top lengthens a ${d.face_shape} face, and the fade keeps the sides tight so nothing reads as wide. Be honest about the three-week cycle — a grown-out fade loses the whole effect.`,
  },
  {
    name: "Classic side part",
    category: "hair",
    silhouette: "classic_side_part",
    maintenance: "medium",
    salon_weeks: 5,
    morning_minutes: 5,
    monthly_cost_inr: 900,
    styling_notes:
      "Comb the part in while damp, dry it in that direction, then a light cream. The part should be where your hair already wants to split.",
    products: ["styling cream", "fine comb"],
    suitsFaces: ["oval", "round", "heart", "triangle"],
    suitsTextures: ["straight", "wavy"],
    minSalonWeeksTolerance: 6,
    why: (d) =>
      `The most quietly effective cut there is. It suits your ${d.jawline} jawline because the asymmetry of the part stops the whole face reading as symmetrical and flat.`,
  },
  {
    name: "Tapered buzz",
    category: "hair",
    silhouette: "buzz_cut",
    maintenance: "low",
    salon_weeks: 3,
    morning_minutes: 0,
    monthly_cost_inr: 500,
    styling_notes: "None. That is the point. Moisturise your scalp, it will be visible.",
    products: ["scalp moisturiser", "SPF for the scalp"],
    suitsFaces: ["oval", "square", "diamond"],
    suitsTextures: ["straight", "wavy", "curly", "coily"],
    minSalonWeeksTolerance: 4,
    why: (d) =>
      `With a ${d.hairline} hairline this is the honest, confident move — it stops the eye going to the hairline at all and puts it on your jaw instead. Zero morning cost.`,
  },
  {
    name: "Curtain fringe, grown out",
    category: "hair",
    silhouette: "curtain_fringe",
    maintenance: "medium",
    salon_weeks: 8,
    morning_minutes: 6,
    monthly_cost_inr: 700,
    styling_notes:
      "Rough dry with your head tipped forward, then split the fringe with your fingers. Sea salt spray if it falls flat.",
    products: ["sea salt spray", "light cream"],
    suitsFaces: ["oblong", "square", "diamond"],
    suitsTextures: ["straight", "wavy"],
    minSalonWeeksTolerance: 10,
    why: (d) =>
      `Width at the temples balances a longer face, and your ${d.hair_texture} texture is exactly what makes this sit naturally instead of looking styled.`,
  },
  {
    name: "Curly top with a taper",
    category: "hair",
    silhouette: "curly_top_taper",
    maintenance: "medium",
    salon_weeks: 6,
    morning_minutes: 5,
    monthly_cost_inr: 1100,
    styling_notes:
      "Never brush it dry. Curl cream on soaking wet hair, scrunch upward, let it air dry. Diffuse only if you must.",
    products: ["curl cream", "leave-in conditioner", "microfibre towel"],
    suitsFaces: ["oval", "square", "heart", "oblong"],
    suitsTextures: ["curly", "coily"],
    minSalonWeeksTolerance: 8,
    why: (d) =>
      `Your ${d.hair_type} pattern is the whole style — the taper just keeps the outline clean so the curl reads as deliberate rather than overgrown.`,
  },
  {
    name: "Crew cut",
    category: "hair",
    silhouette: "crew_cut",
    maintenance: "low",
    salon_weeks: 4,
    morning_minutes: 2,
    monthly_cost_inr: 550,
    styling_notes: "Fingers and a little clay if you want definition. Otherwise nothing.",
    products: ["light clay"],
    suitsFaces: ["oval", "square", "heart", "diamond", "round"],
    suitsTextures: ["straight", "wavy", "curly"],
    minSalonWeeksTolerance: 5,
    why: (d) =>
      `The safest good haircut in the world. On a ${d.face_shape} face it stays out of the way and lets your ${d.brow_shape} brow and jaw do the work.`,
  },
  {
    name: "Long layers with movement",
    category: "hair",
    silhouette: "long_layers",
    maintenance: "medium",
    salon_weeks: 10,
    morning_minutes: 8,
    monthly_cost_inr: 900,
    styling_notes:
      "Air dry 80%, then a light oil through the mid-lengths only. Never oil the roots.",
    products: ["hair oil", "heat protectant", "wide-tooth comb"],
    suitsFaces: ["round", "square", "heart", "oval"],
    suitsTextures: ["straight", "wavy", "curly"],
    minSalonWeeksTolerance: 12,
    why: (d) =>
      `Layers cut at the jaw open up a ${d.face_shape} face without shortening anything. Low chair time — ten weeks between visits is realistic.`,
  },
  {
    name: "Blunt bob at the jaw",
    category: "hair",
    silhouette: "blunt_bob",
    maintenance: "medium",
    salon_weeks: 7,
    morning_minutes: 7,
    monthly_cost_inr: 1400,
    styling_notes: "Blow dry with a flat brush, ends turned very slightly under. Nothing more.",
    products: ["smoothing serum", "flat brush"],
    suitsFaces: ["oval", "heart", "oblong", "diamond"],
    suitsTextures: ["straight", "wavy"],
    minSalonWeeksTolerance: 8,
    why: (d) =>
      `A hard line at the jaw draws attention straight to your ${d.jawline} jawline. It needs a sharp cut, so keep the seven-week rhythm.`,
  },
  {
    name: "Modern shag",
    category: "hair",
    silhouette: "shag",
    maintenance: "low",
    salon_weeks: 10,
    morning_minutes: 4,
    monthly_cost_inr: 800,
    styling_notes: "Salt spray on damp hair, scrunch, leave it alone. It is meant to look undone.",
    products: ["sea salt spray", "texture paste"],
    suitsFaces: ["oval", "round", "square", "heart"],
    suitsTextures: ["wavy", "curly"],
    minSalonWeeksTolerance: 12,
    why: (d) =>
      `Built for ${d.hair_texture} hair that refuses to sit flat — the shag stops treating that as a problem. Grows out beautifully, which is why the salon gap is so long.`,
  },
  {
    name: "Slicked back, matte finish",
    category: "hair",
    silhouette: "slick_back",
    maintenance: "high",
    salon_weeks: 5,
    morning_minutes: 6,
    monthly_cost_inr: 1200,
    styling_notes: "Matte pomade on damp hair, comb straight back, then break it up with your fingers so it isn't wet-look.",
    products: ["matte pomade", "wide comb"],
    suitsFaces: ["oval", "diamond", "heart"],
    suitsTextures: ["straight", "wavy"],
    minSalonWeeksTolerance: 6,
    why: (d) =>
      `Pulling everything back exposes the full face, which works because of your ${d.forehead} forehead proportion. Matte, never shiny — shine reads as dated now.`,
  },
  {
    name: "Short boxed beard",
    category: "beard",
    silhouette: "short_boxed",
    maintenance: "medium",
    salon_weeks: 3,
    morning_minutes: 3,
    monthly_cost_inr: 400,
    styling_notes:
      "Trim to 6mm with a guard, then define the cheek line one finger-width above the jaw. Oil it after, not before.",
    products: ["beard trimmer", "beard oil"],
    suitsFaces: ["round", "oval", "heart", "diamond"],
    suitsTextures: ["straight", "wavy", "curly", "coily"],
    minSalonWeeksTolerance: 4,
    why: (d) =>
      `With ${d.beard_coverage} coverage, a short boxed shape gives you a defined edge without depending on density you don't have. It squares off a softer jaw.`,
  },
  {
    name: "Light stubble, sharp edges",
    category: "beard",
    silhouette: "light_stubble",
    maintenance: "low",
    salon_weeks: 2,
    morning_minutes: 2,
    monthly_cost_inr: 250,
    styling_notes: "3mm guard every three days. The neckline is the whole job — one finger above the Adam's apple.",
    products: ["stubble trimmer", "aftershave balm"],
    suitsFaces: ["oval", "square", "oblong", "round", "heart", "diamond", "triangle"],
    suitsTextures: ["straight", "wavy", "curly", "coily"],
    minSalonWeeksTolerance: 3,
    why: (d) =>
      `The most forgiving option for ${d.beard_coverage} coverage — at 3mm, patchiness disappears. Costs you two minutes twice a week and nothing else.`,
  },
  {
    name: "Chevron moustache",
    category: "moustache",
    silhouette: "chevron_moustache",
    maintenance: "low",
    salon_weeks: 4,
    morning_minutes: 2,
    monthly_cost_inr: 300,
    styling_notes: "Let it grow past the lip line, then trim the bottom edge straight. Comb it down daily.",
    products: ["moustache wax", "small comb"],
    suitsFaces: ["square", "oblong", "oval", "diamond"],
    suitsTextures: ["straight", "wavy", "curly", "coily"],
    minSalonWeeksTolerance: 6,
    why: (d) =>
      `Full width across the lip adds horizontal line, which is what a ${d.face_shape} face benefits from. A genuine commitment, but a cheap one.`,
  },
];

/* ---------------------------------------------------------------- ranking */

function scoreLook(look: LibraryLook, dna: StyleDna, answers: Answers): number {
  let score = 0;
  if (look.suitsFaces.includes(dna.face_shape)) score += 40;
  if (look.suitsTextures.includes(dna.hair_texture)) score += 30;

  const freq = answers["salon_frequency"];
  const tolerance =
    freq === "2w" ? 3 : freq === "4w" ? 5 : freq === "8w" ? 9 : 20;
  if (look.salon_weeks <= tolerance) score += 20;
  else score -= 25;

  const minutes = Number(answers["morning_minutes"] ?? 5);
  if (look.morning_minutes <= minutes) score += 15;
  else score -= 15;

  // Hard nos are absolute.
  if (has(answers, "off_limits", "no_short") && ["buzz_cut", "crew_cut"].includes(look.silhouette)) return -999;
  if (has(answers, "off_limits", "no_beard") && ["beard", "moustache"].includes(look.category)) return -999;
  if (has(answers, "off_limits", "no_product") && look.products.length > 2) score -= 30;

  const taste = answers["taste"];
  if (taste === "sharp" && ["mid_fade_pompadour", "blunt_bob", "slick_back", "short_boxed"].includes(look.silhouette)) score += 12;
  if (taste === "relaxed" && ["shag", "curtain_fringe", "long_layers", "curly_top_taper"].includes(look.silhouette)) score += 12;
  if (taste === "classic" && ["classic_side_part", "crew_cut", "light_stubble"].includes(look.silhouette)) score += 12;
  if (taste === "bold" && ["buzz_cut", "shag", "chevron_moustache", "slick_back"].includes(look.silhouette)) score += 12;

  if (has(answers, "hair_behaviour", "flat") && look.maintenance === "high") score += 5;
  if (has(answers, "conditions", "thinning") && ["long_layers", "slick_back"].includes(look.silhouette)) score -= 20;
  if (has(answers, "setting", "field") && look.morning_minutes > 5) score -= 10;

  return score;
}

export function mockRecommendations(
  seed: string,
  dna: StyleDna,
  answers: Answers,
  count: number,
): RecommendationSet {
  const ranked = LIBRARY.map((l) => ({ look: l, score: scoreLook(l, dna, answers) }))
    .filter((r) => r.score > -900)
    .sort((a, b) => b.score - a.score);

  const chosen: LibraryLook[] = [];
  // Always include at least one low-maintenance option.
  const lowMaint = ranked.find((r) => r.look.maintenance === "low");
  for (const r of ranked) {
    if (chosen.length >= count) break;
    if (chosen.some((c) => c.silhouette === r.look.silhouette)) continue;
    chosen.push(r.look);
  }
  if (lowMaint && !chosen.some((c) => c.maintenance === "low") && chosen.length) {
    chosen[chosen.length - 1] = lowMaint.look;
  }

  const looks: LookRec[] = chosen.map((l) => ({
    name: l.name,
    category: l.category,
    silhouette: l.silhouette,
    why: l.why(dna),
    maintenance: l.maintenance,
    salon_weeks: l.salon_weeks,
    morning_minutes: l.morning_minutes,
    monthly_cost_inr: l.monthly_cost_inr,
    styling_notes: l.styling_notes,
    products: l.products,
  }));

  const topName = looks[0]?.name ?? "a clean, low-effort cut";
  return {
    summary:
      `These are built around your ${dna.face_shape} face and ${dna.hair_texture} hair, filtered by how much time you actually said you'd spend. ` +
      `Start with the ${topName.toLowerCase()} — it asks the least of you for the most return.`,
    looks,
  };
}

/* ---------------------------------------------------------------- barber card */

const GUARD_BY_SILHOUETTE: Record<string, { sides: string; back: string; top: string }> = {
  textured_crop: { sides: "#2 (6mm)", back: "#1.5 (4.5mm)", top: "Scissor only, 4–5cm" },
  mid_fade_pompadour: { sides: "#0.5 to #3, mid fade", back: "#0.5 at the nape", top: "Scissor only, 7–9cm" },
  classic_side_part: { sides: "#3 (10mm), scissor over comb above", back: "#2 (6mm)", top: "Scissor only, 6–7cm" },
  buzz_cut: { sides: "#1 (3mm), tapered", back: "#0.5 (1.5mm)", top: "#2 (6mm)" },
  crew_cut: { sides: "#2 (6mm)", back: "#1.5 (4.5mm)", top: "Scissor, 3–4cm, graduated" },
  curtain_fringe: { sides: "Scissor only, blended", back: "Scissor only", top: "Leave 10–12cm, centre split" },
  curly_top_taper: { sides: "#2 (6mm) tapered, no hard line", back: "#1.5 (4.5mm)", top: "Scissor on dry curl, 6–8cm" },
  long_layers: { sides: "Scissor only", back: "Scissor only", top: "Layers starting at the jaw" },
  blunt_bob: { sides: "Scissor only", back: "Scissor, one length", top: "One length at the jaw, no layers" },
  shag: { sides: "Scissor, heavily texturised", back: "Scissor only", top: "Layers from the crown, point cut" },
  slick_back: { sides: "#2 (6mm) fading to #4", back: "#2 (6mm)", top: "Scissor only, 8–10cm" },
  short_boxed: { sides: "#2 (6mm) on the beard", back: "n/a", top: "n/a" },
  light_stubble: { sides: "#1 (3mm) all over", back: "n/a", top: "n/a" },
  chevron_moustache: { sides: "n/a", back: "n/a", top: "Scissor trim on the bottom edge only" },
};

export function mockBarberCard(dna: StyleDna, look: LookRec): BarberCardData {
  const guards = GUARD_BY_SILHOUETTE[look.silhouette] ?? {
    sides: "#2 (6mm)",
    back: "#1.5 (4.5mm)",
    top: "Scissor only",
  };
  const isBeard = look.category === "beard" || look.category === "moustache";

  return {
    title: look.name,
    sides: isBeard ? `Beard trimmed to ${guards.sides}, cheek line one finger above the jaw.` : `${guards.sides}, blended upward with no visible line.`,
    top: isBeard ? "Not applicable." : `${guards.top}. Point cut through the ends for texture, not blunt.`,
    back: isBeard ? "Neckline one finger-width above the Adam's apple." : `${guards.back}, following the natural head shape.`,
    neckline: dna.hairline === "receding" ? "Tapered — a blocked neckline draws the eye upward." : "Tapered, natural.",
    parting: look.silhouette === "classic_side_part" ? "Where the hair already splits, usually just left of centre. Soft, not shaved." : "No hard part.",
    technique: `Scissor over comb through the transition. Point cutting on top for movement. ${
      dna.hair_density === "fine" ? "Do not thin it out — fine hair needs the weight." : "Light texturising at the ends only."
    }`,
    guards,
    say_this_en: `${look.name}, please. ${guards.sides} on the sides, ${
      isBeard ? "keep the cheek line natural" : `${guards.top} on top`
    }, tapered at the neck. Texture it, don't thin it.`,
    say_this_hi: `${look.name} चाहिए। साइड्स पर ${guards.sides}, ऊपर ${
      isBeard ? "चीक लाइन नैचुरल रखना" : guards.top
    }, गर्दन पर टेपर करना। थिनिंग मत करना, सिर्फ़ टेक्सचर देना।`,
    avoid: dna.hair_density === "fine"
      ? "No thinning scissors, no razor on the ends, and do not go higher than the temple with the clippers."
      : "No hard lines at the temple, no razor-shaved parting, no over-thinning.",
    beard_notes: isBeard
      ? `Keep the moustache slightly longer than the cheeks. Never square off the corners of the jaw.`
      : dna.beard_coverage === "none"
        ? "Not applicable."
        : `Tidy the cheek line only. Leave the length as it is.`,
  };
}
