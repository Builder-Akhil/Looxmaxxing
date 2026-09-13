import { type NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/ratelimit";
import { fail, ok, gateMessage } from "@/lib/api";
import { analyseFace, recommendLooks } from "@/lib/ai/openai";
import { answersToBrief, type QuizAnswers } from "@/lib/quiz";
import { seasonByKey } from "@/lib/palette";
import { planFor, type Tier } from "@/lib/pricing";
import type { Market } from "@/lib/brand";
import type { StyleDna } from "@/lib/validation";

export const maxDuration = 60;

const body = z.object({
  photoId: z.string().uuid().nullable().optional(),
  goal: z.enum(["everyday", "wedding", "interview", "camera", "reset"]).default("everyday"),
  reanalyse: z.boolean().default(false),
});

/**
 * One styling session: read the face (if we need to), then recommend looks.
 * This is the unit the plan meters, so it passes through the entitlement gate
 * exactly once.
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return fail(401, "unauthenticated", "Please log in again.");

  const limited = rateLimit(`style:${user.id}`, 6, 60_000);
  if (!limited.ok) {
    return fail(429, "rate_limited", `Slow down a moment — try again in ${limited.retryAfter}s.`);
  }

  let input: z.infer<typeof body>;
  try {
    input = body.parse(await request.json());
  } catch {
    return fail(400, "bad_request", "That request didn't look right.");
  }

  /* ------------------------------------------------ the gate */
  const { data: gate, error: gateErr } = await supabase.rpc("consume_entitlement", {
    feature_key: "styling_session",
  });
  if (gateErr) return fail(500, "gate_failed", "We couldn't check your plan. Try again.");

  const allowed = (gate as { allowed: boolean; reason?: string; tier?: string })?.allowed;
  if (!allowed) {
    const reason = (gate as { reason: string }).reason;
    return fail(402, reason, gateMessage(reason, "styling sessions"), { gate });
  }

  /* ------------------------------------------------ context */
  const [{ data: profile }, { data: quiz }, { data: currentDna }] = await Promise.all([
    supabase.from("profiles").select("market").eq("id", user.id).maybeSingle(),
    supabase.from("quiz_responses").select("answers").eq("user_id", user.id).maybeSingle(),
    supabase
      .from("style_profiles")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_current", true)
      .maybeSingle(),
  ]);

  const market = (profile?.market as Market) ?? "IN";
  const answers = (quiz?.answers as QuizAnswers) ?? {};
  const brief = answersToBrief(answers, market);
  const tier = ((gate as { tier?: string }).tier ?? "free") as Tier;
  const count = tier === "free" ? 3 : 6;

  /* ------------------------------------------------ style DNA */
  let dna: StyleDna;
  let styleProfileId: string | null = currentDna?.id ?? null;
  let dnaSource: "ai" | "mock" = (currentDna?.source as "ai" | "mock") ?? "mock";

  const needsRead = input.reanalyse || !currentDna || Boolean(input.photoId);

  if (needsRead) {
    let imageDataUrl: string | undefined;

    if (input.photoId) {
      const { data: photo } = await supabase
        .from("photos")
        .select("storage_path, mime")
        .eq("id", input.photoId)
        .is("deleted_at", null)
        .maybeSingle();

      if (photo) {
        const { data: blob } = await supabase.storage.from("photos").download(photo.storage_path);
        if (blob) {
          const buf = Buffer.from(await blob.arrayBuffer());
          imageDataUrl = `data:${photo.mime ?? "image/jpeg"};base64,${buf.toString("base64")}`;
        }
      }
    }

    const read = await analyseFace({
      imageDataUrl,
      brief,
      seed: user.id,
      answers,
    });
    dna = read.data;
    dnaSource = read.source;

    await supabase.rpc("log_ai_call", {
      p_kind: "style_dna",
      p_model: read.model,
      p_in: read.inputTokens,
      p_out: read.outputTokens,
      p_images: 0,
      p_latency: read.latencyMs,
      p_cost: read.costInr,
      p_ok: true,
      p_error: read.fellBackBecause ?? null,
    });

    // Only one current read per person.
    await supabase.from("style_profiles").update({ is_current: false }).eq("user_id", user.id).eq("is_current", true);

    const { data: inserted, error: insertErr } = await supabase
      .from("style_profiles")
      .insert({
        user_id: user.id,
        photo_id: input.photoId ?? null,
        face_shape: dna.face_shape,
        jawline: dna.jawline,
        forehead: dna.forehead,
        hair_type: dna.hair_type,
        hair_density: dna.hair_density,
        hair_texture: dna.hair_texture,
        hairline: dna.hairline,
        undertone: dna.undertone,
        contrast_level: dna.contrast_level,
        season: dna.season,
        beard_coverage: dna.beard_coverage,
        brow_shape: dna.brow_shape,
        notable_features: dna.notable_features,
        confidence: dna.confidence,
        raw: dna,
        source: read.source,
        is_current: true,
      })
      .select("id")
      .single();

    if (insertErr || !inserted) return fail(500, "save_failed", "We read your face but couldn't save it. Try again.");
    styleProfileId = inserted.id;

    if (input.photoId) {
      await supabase.from("photos").update({ status: "analysed" }).eq("id", input.photoId);
    }
  } else {
    dna = (currentDna.raw as StyleDna) ?? (currentDna as unknown as StyleDna);
  }

  /* ------------------------------------------------ recommendations */
  const recs = await recommendLooks({
    dna,
    brief,
    count,
    goal: input.goal,
    seed: `${user.id}:${Date.now() >> 20}`,
    answers,
  });

  await supabase.rpc("log_ai_call", {
    p_kind: "recommendation",
    p_model: recs.model,
    p_in: recs.inputTokens,
    p_out: recs.outputTokens,
    p_images: 0,
    p_latency: recs.latencyMs,
    p_cost: recs.costInr,
    p_ok: true,
    p_error: recs.fellBackBecause ?? null,
  });

  const season = seasonByKey(dna.season);

  const { data: session, error: sessionErr } = await supabase
    .from("styling_sessions")
    .insert({
      user_id: user.id,
      style_profile_id: styleProfileId,
      goal: input.goal,
      status: "complete",
      summary: recs.data.summary,
      source: recs.source,
      palette: {
        season: season.key,
        name: season.name,
        line: season.line,
        metals: season.metals,
        swatches: season.swatches,
        avoid: season.avoid,
      },
    })
    .select("id")
    .single();

  if (sessionErr || !session) return fail(500, "save_failed", "We picked your looks but couldn't save them. Try again.");

  const rows = recs.data.looks.map((l, i) => ({
    session_id: session.id,
    user_id: user.id,
    category: l.category,
    name: l.name,
    rank: i + 1,
    why: l.why,
    maintenance: l.maintenance,
    salon_weeks: l.salon_weeks,
    morning_minutes: l.morning_minutes,
    monthly_cost_inr: l.monthly_cost_inr,
    styling_notes: l.styling_notes,
    products: l.products,
    silhouette: l.silhouette,
  }));

  const { error: looksErr } = await supabase.from("looks").insert(rows);
  if (looksErr) return fail(500, "save_failed", "We picked your looks but couldn't save them. Try again.");

  await supabase.from("profiles").update({ onboarding_completed_at: new Date().toISOString() }).eq("id", user.id);

  return ok({
    sessionId: session.id,
    source: recs.source === "ai" && dnaSource === "ai" ? "ai" : "mock",
    looks: rows.length,
    plan: planFor(tier).name,
  });
}
