import OpenAI from "openai";
import { toFile } from "openai/uploads";
import {
  styleDnaSchema,
  recommendationSchema,
  barberCardSchema,
  type StyleDna,
  type LookRec,
  type BarberCardData,
  type RecommendationSet,
} from "@/lib/validation";
import { mockStyleDna, mockRecommendations, mockBarberCard } from "./mock";
import { textCostInr, imageCostInr } from "./costs";
import {
  ANALYSE_SYSTEM,
  analyseUserPrompt,
  RECOMMEND_SYSTEM,
  recommendUserPrompt,
  BARBER_CARD_SYSTEM,
  barberCardUserPrompt,
  tryonPrompt,
} from "./prompts";

export type AiSource = "ai" | "mock";

export type AiResult<T> = {
  data: T;
  source: AiSource;
  model: string;
  inputTokens: number;
  outputTokens: number;
  costInr: number;
  latencyMs: number;
  /** Present when a live call was attempted and failed. */
  fellBackBecause?: string;
};

const TEXT_MODEL = process.env.OPENAI_TEXT_MODEL || "gpt-4o-mini";
const VISION_MODEL = process.env.OPENAI_VISION_MODEL || "gpt-4o-mini";
const IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL || "gpt-image-1";

export function aiEnabled(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

let cached: OpenAI | null = null;
function client(): OpenAI {
  if (!cached) cached = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
  return cached;
}

/** Strips markdown fences some models add despite being told not to. */
function parseJson(raw: string): unknown {
  const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  return JSON.parse(cleaned);
}

type ChatArgs = {
  system: string;
  user: string;
  model: string;
  imageDataUrl?: string;
  maxTokens?: number;
};

async function chatJson(args: ChatArgs): Promise<{ raw: unknown; inputTokens: number; outputTokens: number }> {
  const content: OpenAI.Chat.Completions.ChatCompletionContentPart[] = [
    { type: "text", text: args.user },
  ];
  if (args.imageDataUrl) {
    content.push({ type: "image_url", image_url: { url: args.imageDataUrl, detail: "low" } });
  }

  const res = await client().chat.completions.create({
    model: args.model,
    temperature: 0.7,
    max_tokens: args.maxTokens ?? 1600,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: args.system },
      { role: "user", content },
    ],
  });

  const text = res.choices[0]?.message?.content ?? "{}";
  return {
    raw: parseJson(text),
    inputTokens: res.usage?.prompt_tokens ?? 0,
    outputTokens: res.usage?.completion_tokens ?? 0,
  };
}

/* ------------------------------------------------------------------ Style DNA */

export async function analyseFace(opts: {
  imageDataUrl?: string;
  brief: string;
  seed: string;
  answers: Record<string, string | string[]>;
}): Promise<AiResult<StyleDna>> {
  const started = Date.now();

  if (!aiEnabled()) {
    return mockResult(mockStyleDna(opts.seed, opts.answers), started);
  }

  try {
    const { raw, inputTokens, outputTokens } = await chatJson({
      system: ANALYSE_SYSTEM,
      user: analyseUserPrompt(opts.brief),
      model: opts.imageDataUrl ? VISION_MODEL : TEXT_MODEL,
      imageDataUrl: opts.imageDataUrl,
      maxTokens: 900,
    });

    const parsed = styleDnaSchema.safeParse(raw);
    if (!parsed.success) throw new Error(`schema mismatch: ${parsed.error.issues[0]?.message}`);

    const model = opts.imageDataUrl ? VISION_MODEL : TEXT_MODEL;
    return {
      data: parsed.data,
      source: "ai",
      model,
      inputTokens,
      outputTokens,
      costInr: textCostInr(model, inputTokens, outputTokens),
      latencyMs: Date.now() - started,
    };
  } catch (err) {
    return mockResult(mockStyleDna(opts.seed, opts.answers), started, msg(err));
  }
}

/* ------------------------------------------------------------------ recommendations */

export async function recommendLooks(opts: {
  dna: StyleDna;
  brief: string;
  count: number;
  goal: string;
  seed: string;
  answers: Record<string, string | string[]>;
}): Promise<AiResult<RecommendationSet>> {
  const started = Date.now();

  if (!aiEnabled()) {
    return mockResult(mockRecommendations(opts.seed, opts.dna, opts.answers, opts.count), started);
  }

  try {
    const { raw, inputTokens, outputTokens } = await chatJson({
      system: RECOMMEND_SYSTEM,
      user: recommendUserPrompt(opts.dna, opts.brief, opts.count, opts.goal),
      model: TEXT_MODEL,
      maxTokens: 2400,
    });

    const parsed = recommendationSchema.safeParse(raw);
    if (!parsed.success) throw new Error(`schema mismatch: ${parsed.error.issues[0]?.message}`);

    return {
      data: parsed.data,
      source: "ai",
      model: TEXT_MODEL,
      inputTokens,
      outputTokens,
      costInr: textCostInr(TEXT_MODEL, inputTokens, outputTokens),
      latencyMs: Date.now() - started,
    };
  } catch (err) {
    return mockResult(
      mockRecommendations(opts.seed, opts.dna, opts.answers, opts.count),
      started,
      msg(err),
    );
  }
}

/* ------------------------------------------------------------------ barber card */

export async function writeBarberCard(opts: {
  dna: StyleDna;
  look: LookRec;
}): Promise<AiResult<BarberCardData>> {
  const started = Date.now();

  if (!aiEnabled()) {
    return mockResult(mockBarberCard(opts.dna, opts.look), started);
  }

  try {
    const { raw, inputTokens, outputTokens } = await chatJson({
      system: BARBER_CARD_SYSTEM,
      user: barberCardUserPrompt(opts.dna, opts.look.name, opts.look.styling_notes),
      model: TEXT_MODEL,
      maxTokens: 1200,
    });

    const parsed = barberCardSchema.safeParse(raw);
    if (!parsed.success) throw new Error(`schema mismatch: ${parsed.error.issues[0]?.message}`);

    return {
      data: parsed.data,
      source: "ai",
      model: TEXT_MODEL,
      inputTokens,
      outputTokens,
      costInr: textCostInr(TEXT_MODEL, inputTokens, outputTokens),
      latencyMs: Date.now() - started,
    };
  } catch (err) {
    return mockResult(mockBarberCard(opts.dna, opts.look), started, msg(err));
  }
}

/* ------------------------------------------------------------------ try-on */

export type TryOnResult = {
  bytes: Buffer;
  mime: string;
  model: string;
  costInr: number;
  latencyMs: number;
};

/**
 * The only genuinely expensive call in the product.
 * Throws on failure — the caller refunds the credit.
 */
export async function generateTryOn(opts: {
  photo: Buffer;
  photoMime: string;
  dna: StyleDna;
  look: LookRec;
}): Promise<TryOnResult> {
  if (!aiEnabled()) {
    throw new Error("no_api_key");
  }

  const started = Date.now();
  const ext = opts.photoMime.includes("png") ? "png" : "jpg";
  const file = await toFile(opts.photo, `source.${ext}`, { type: opts.photoMime });

  const res = await client().images.edit({
    model: IMAGE_MODEL,
    image: file,
    prompt: tryonPrompt(opts.dna, opts.look.name, opts.look.styling_notes),
    size: "1024x1024",
    n: 1,
  });

  const b64 = res.data?.[0]?.b64_json;
  if (!b64) throw new Error("no_image_returned");

  return {
    bytes: Buffer.from(b64, "base64"),
    mime: "image/png",
    model: IMAGE_MODEL,
    costInr: imageCostInr(IMAGE_MODEL, 1),
    latencyMs: Date.now() - started,
  };
}

/* ------------------------------------------------------------------ helpers */

function mockResult<T>(data: T, started: number, fellBackBecause?: string): AiResult<T> {
  return {
    data,
    source: "mock",
    model: "rule-engine",
    inputTokens: 0,
    outputTokens: 0,
    costInr: 0,
    latencyMs: Date.now() - started,
    fellBackBecause,
  };
}

function msg(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}
