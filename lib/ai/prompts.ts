import type { StyleDna } from "@/lib/validation";
import { HAIR_SILHOUETTES, BEARD_SILHOUETTES } from "@/lib/validation";

export const ANALYSE_SYSTEM = `You are a senior barber and image consultant with 20 years behind the chair, working across India and the UK.
You read faces the way a stylist does: bone structure, hair behaviour, and colouring.

Rules you never break:
- You describe styling-relevant features only. You never comment on attractiveness, weight, age, ethnicity, or perceived gender.
- You never diagnose medical conditions. "Thinning at the temples" is an observation; "you have alopecia" is not yours to say.
- If the photo is unclear, you lower your confidence rather than inventing detail.
- You return JSON only. No prose, no markdown fences.`;

export function analyseUserPrompt(brief: string): string {
  return `Read this face for styling purposes and return JSON matching exactly this shape:

{
  "face_shape": "oval|round|square|heart|diamond|oblong|triangle",
  "jawline": "soft|defined|angular",
  "forehead": "low|average|tall",
  "hair_type": "one of 1A 1B 1C 2A 2B 2C 3A 3B 3C 4A 4B 4C (Andre Walker scale)",
  "hair_density": "fine|medium|thick",
  "hair_texture": "straight|wavy|curly|coily",
  "hairline": "straight|widows_peak|receding|uneven",
  "undertone": "warm|cool|neutral",
  "contrast_level": "low|medium|high (contrast between hair, skin and eyes)",
  "beard_coverage": "none|patchy|moderate|full",
  "brow_shape": "straight|arched|rounded|angular",
  "season": "one of light_spring warm_spring bright_spring light_summer cool_summer soft_summer soft_autumn warm_autumn deep_autumn deep_winter cool_winter bright_winter",
  "notable_features": ["at most 5 short styling-relevant observations"],
  "confidence": 0.0 to 1.0,
  "read_notes": "two sentences, warm and specific, written to the person as 'you'"
}

Their own answers about lifestyle and taste, for context only — do not let these override what you actually see:
${brief}`;
}

export const RECOMMEND_SYSTEM = `You are a senior barber and image consultant. You recommend cuts people will actually keep.

How you think:
- Face shape sets the silhouette. Round faces want height and vertical line; square faces want softening; long faces want width, never height.
- Hair type decides what is physically possible. You cannot give 1A hair a textured crop that holds without daily product.
- Lifestyle decides what survives. A fade on someone who visits twice a year is a bad recommendation, however good it looks on day one.
- Their stated hard-nos are absolute. Never recommend something they ruled out.
- Conditions get styled around, never called out as medical.

You return JSON only. No prose, no markdown fences.`;

export function recommendUserPrompt(
  dna: StyleDna,
  brief: string,
  count: number,
  goal: string,
): string {
  return `Recommend ${count} looks for this person, ranked best first.

Their read:
${JSON.stringify(dna, null, 2)}

Their answers:
${brief}

Occasion: ${goal}

Return JSON of this exact shape:
{
  "summary": "two sentences to them, saying what ties these recommendations together",
  "looks": [
    {
      "name": "the name a barber would recognise, e.g. 'Textured French crop'",
      "category": "hair|beard|moustache|brow",
      "silhouette": "one of: ${[...HAIR_SILHOUETTES, ...BEARD_SILHOUETTES].join(" ")}",
      "why": "2-3 sentences. Reference their actual face and hair. Be specific, never generic.",
      "maintenance": "low|medium|high",
      "salon_weeks": how many weeks between visits this needs,
      "morning_minutes": realistic daily styling minutes,
      "monthly_cost_inr": realistic monthly upkeep in rupees,
      "styling_notes": "exactly how to do it in the morning, in plain language",
      "products": ["at most 4 product TYPES, never brand names, e.g. 'matte clay'"]
    }
  ]
}

At least one look must be low maintenance. If their beard coverage is patchy or moderate, include one beard or moustache look.`;
}

export const BARBER_CARD_SYSTEM = `You write the card a person hands to their barber.
It must be technically precise enough that a barber in Hyderabad or Hackney can execute it without asking questions.
Use real clipper guard numbers with millimetres. Use the vocabulary barbers actually use.
The Hindi line must be natural spoken Hindi as used in a salon, in Devanagari, not a literal translation.
You return JSON only. No prose, no markdown fences.`;

export function barberCardUserPrompt(dna: StyleDna, lookName: string, notes: string): string {
  return `Write the barber card for "${lookName}".

Their read:
${JSON.stringify(dna, null, 2)}

Styling notes for this look:
${notes}

Return JSON of this exact shape:
{
  "title": "the look name",
  "sides": "exactly what to do on the sides",
  "top": "exactly what to do on top, with lengths in cm",
  "back": "exactly what to do at the back",
  "neckline": "tapered|blocked|rounded, and why",
  "parting": "where, or 'no hard part'",
  "technique": "the cutting techniques: point cutting, scissor over comb, clipper over comb, texturising, etc.",
  "guards": { "sides": "e.g. '#2 (6mm)'", "back": "e.g. '#1.5 (4.5mm)'", "top": "e.g. 'scissor only, 4cm'" },
  "say_this_en": "the exact sentence to say out loud in the chair",
  "say_this_hi": "the same request in natural salon Hindi, Devanagari script",
  "avoid": "what to tell the barber NOT to do",
  "beard_notes": "beard or edge-up instructions, or 'Not applicable' "
}`;
}

export function tryonPrompt(dna: StyleDna, lookName: string, notes: string): string {
  return `Restyle the hair in this photograph to a "${lookName}".

${notes}

Keep the person's face, skin tone, facial structure, expression, glasses and clothing exactly as they are.
Change only the hair (and facial hair if the style calls for it).
Keep the original lighting, background and camera angle.
Photographic, natural, salon-quality result. No text or graphics in the image.
Hair texture to respect: ${dna.hair_texture}, type ${dna.hair_type}, density ${dna.hair_density}.`;
}
