import { type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/ratelimit";
import { fail, ok, gateMessage } from "@/lib/api";
import { generateTryOn, aiEnabled } from "@/lib/ai/openai";
import { tryonInput } from "@/lib/validation";
import type { StyleDna, LookRec } from "@/lib/validation";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return fail(401, "unauthenticated", "Please log in again.");

  if (!aiEnabled()) {
    return fail(
      503,
      "no_api_key",
      "AI try-on isn't switched on yet — the image key hasn't been added. Everything else works.",
    );
  }

  const limited = rateLimit(`tryon:${user.id}`, 4, 60_000);
  if (!limited.ok) return fail(429, "rate_limited", `Try again in ${limited.retryAfter}s.`);

  let lookId: string;
  try {
    lookId = tryonInput.parse(await request.json()).lookId;
  } catch {
    return fail(400, "bad_request", "That request didn't look right.");
  }

  const { data: look } = await supabase.from("looks").select("*").eq("id", lookId).maybeSingle();
  if (!look) return fail(404, "not_found", "We couldn't find that look.");

  // The most recent photo we still hold.
  const { data: photo } = await supabase
    .from("photos")
    .select("id, storage_path, mime")
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!photo) {
    return fail(
      412,
      "no_photo",
      "We don't have a photo of you any more. Upload one and we can show the look on your own face.",
    );
  }

  /* ---------------------------------------------- gate + job, atomically */
  const { data: started, error: startErr } = await supabase.rpc("start_tryon", {
    p_look_id: lookId,
    p_photo_id: photo.id,
  });
  if (startErr) return fail(500, "gate_failed", "We couldn't start that. Try again.");

  const startResult = started as { ok: boolean; reason?: string; job_id?: string };
  if (!startResult.ok) {
    return fail(402, startResult.reason ?? "denied", gateMessage(startResult.reason ?? "", "try-ons"), {
      gate: startResult,
    });
  }
  const jobId = startResult.job_id!;

  /* ---------------------------------------------- generate */
  try {
    const { data: blob } = await supabase.storage.from("photos").download(photo.storage_path);
    if (!blob) throw new Error("photo_unreadable");

    const { data: dnaRow } = await supabase
      .from("style_profiles")
      .select("raw")
      .eq("user_id", user.id)
      .eq("is_current", true)
      .maybeSingle();

    const lookRec: LookRec = {
      name: look.name,
      category: look.category,
      silhouette: look.silhouette,
      why: look.why ?? "",
      maintenance: look.maintenance ?? "medium",
      salon_weeks: look.salon_weeks ?? 4,
      morning_minutes: look.morning_minutes ?? 5,
      monthly_cost_inr: look.monthly_cost_inr ?? 0,
      styling_notes: look.styling_notes ?? "",
      products: look.products ?? [],
    };

    const result = await generateTryOn({
      photo: Buffer.from(await blob.arrayBuffer()),
      photoMime: photo.mime ?? "image/jpeg",
      dna: (dnaRow?.raw ?? {}) as StyleDna,
      look: lookRec,
    });

    const path = `${user.id}/${jobId}.png`;
    const { error: upErr } = await supabase.storage
      .from("tryons")
      .upload(path, result.bytes, { contentType: result.mime, upsert: true });
    if (upErr) throw new Error(upErr.message);

    await supabase.rpc("log_ai_call", {
      p_kind: "tryon",
      p_model: result.model,
      p_in: 0,
      p_out: 0,
      p_images: 1,
      p_latency: result.latencyMs,
      p_cost: result.costInr,
      p_ok: true,
      p_error: null,
    });

    await supabase.rpc("finish_tryon", {
      p_job: jobId,
      p_path: path,
      p_cost: result.costInr,
      p_error: null,
    });

    const { data: signed } = await supabase.storage.from("tryons").createSignedUrl(path, 60 * 60);

    return ok({ jobId, url: signed?.signedUrl ?? null });
  } catch (e) {
    const message = e instanceof Error ? e.message : "generation_failed";

    // Never charge for an image the person did not get.
    await supabase.rpc("finish_tryon", { p_job: jobId, p_path: null, p_cost: 0, p_error: message });
    await supabase.rpc("log_ai_call", {
      p_kind: "tryon",
      p_model: process.env.OPENAI_IMAGE_MODEL ?? "gpt-image-1",
      p_in: 0,
      p_out: 0,
      p_images: 0,
      p_latency: 0,
      p_cost: 0,
      p_ok: false,
      p_error: message,
    });

    return fail(
      502,
      "generation_failed",
      "The image didn't come out. We've put your credit back — image models refuse faces sometimes. Try a different look or a clearer photo.",
    );
  }
}
