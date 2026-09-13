import { z } from "zod";

/* ------------------------------------------------------------------
   Shapes the model must return, and shapes our API accepts.
   One definition drives both: OpenAI structured output and input checks.
------------------------------------------------------------------- */

export const HAIR_SILHOUETTES = [
  "textured_crop",
  "mid_fade_pompadour",
  "classic_side_part",
  "buzz_cut",
  "crew_cut",
  "curtain_fringe",
  "slick_back",
  "quiff",
  "curly_top_taper",
  "long_layers",
  "blunt_bob",
  "shag",
] as const;

export const BEARD_SILHOUETTES = [
  "clean_shave",
  "light_stubble",
  "short_boxed",
  "full_beard",
  "goatee",
  "chevron_moustache",
] as const;

export const SILHOUETTES = [...HAIR_SILHOUETTES, ...BEARD_SILHOUETTES] as const;
export type Silhouette = (typeof SILHOUETTES)[number];

export const styleDnaSchema = z.object({
  face_shape: z.enum(["oval", "round", "square", "heart", "diamond", "oblong", "triangle"]),
  jawline: z.enum(["soft", "defined", "angular"]),
  forehead: z.enum(["low", "average", "tall"]),
  hair_type: z.enum(["1A","1B","1C","2A","2B","2C","3A","3B","3C","4A","4B","4C"]),
  hair_density: z.enum(["fine", "medium", "thick"]),
  hair_texture: z.enum(["straight", "wavy", "curly", "coily"]),
  hairline: z.enum(["straight", "widows_peak", "receding", "uneven"]),
  undertone: z.enum(["warm", "cool", "neutral"]),
  contrast_level: z.enum(["low", "medium", "high"]),
  beard_coverage: z.enum(["none", "patchy", "moderate", "full"]),
  brow_shape: z.enum(["straight", "arched", "rounded", "angular"]),
  season: z.string(),
  notable_features: z.array(z.string()).max(5),
  confidence: z.number().min(0).max(1),
  read_notes: z.string().max(400),
});
export type StyleDna = z.infer<typeof styleDnaSchema>;

export const lookSchema = z.object({
  name: z.string().min(2).max(60),
  category: z.enum(["hair", "beard", "moustache", "brow"]),
  silhouette: z.enum(SILHOUETTES),
  why: z.string().max(400),
  maintenance: z.enum(["low", "medium", "high"]),
  salon_weeks: z.number().int().min(1).max(52),
  morning_minutes: z.number().int().min(0).max(45),
  monthly_cost_inr: z.number().int().min(0).max(20000),
  styling_notes: z.string().max(400),
  products: z.array(z.string()).max(4),
});
export type LookRec = z.infer<typeof lookSchema>;

export const barberCardSchema = z.object({
  title: z.string().max(80),
  sides: z.string().max(200),
  top: z.string().max(200),
  back: z.string().max(200),
  neckline: z.string().max(120),
  parting: z.string().max(120),
  technique: z.string().max(300),
  guards: z.object({
    sides: z.string().max(40),
    back: z.string().max(40),
    top: z.string().max(40),
  }),
  say_this_en: z.string().max(400),
  say_this_hi: z.string().max(400),
  avoid: z.string().max(300),
  beard_notes: z.string().max(300),
});
export type BarberCardData = z.infer<typeof barberCardSchema>;

export const recommendationSchema = z.object({
  summary: z.string().max(400),
  looks: z.array(lookSchema).min(1).max(6),
});
export type RecommendationSet = z.infer<typeof recommendationSchema>;

/* ------------------------------------------------------------------
   API input schemas
------------------------------------------------------------------- */

export const analyseInput = z.object({
  photoId: z.string().uuid().optional(),
  answers: z.record(z.string(), z.union([z.string(), z.array(z.string())])),
});

export const recommendInput = z.object({
  goal: z.enum(["everyday", "wedding", "interview", "camera", "reset"]).default("everyday"),
  count: z.number().int().min(1).max(6).default(3),
});

export const tryonInput = z.object({
  lookId: z.string().uuid(),
});

export const barberCardInput = z.object({
  lookId: z.string().uuid(),
});

export const photoSignInput = z.object({
  angle: z.enum(["front", "three_quarter", "profile"]).default("front"),
  mime: z.enum(["image/jpeg", "image/png", "image/webp", "image/heic"]),
  bytes: z.number().int().min(1).max(8 * 1024 * 1024),
});

export const consentInput = z.object({
  biometric_processing: z.literal(true),
  photo_retention: z.boolean(),
  marketing: z.boolean().default(false),
});

export const MAX_PHOTO_BYTES = 8 * 1024 * 1024;
