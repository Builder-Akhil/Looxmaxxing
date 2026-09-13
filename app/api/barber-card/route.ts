import { type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/ratelimit";
import { fail, ok, gateMessage } from "@/lib/api";
import { writeBarberCard } from "@/lib/ai/openai";
import { barberCardInput } from "@/lib/validation";
import type { StyleDna, LookRec } from "@/lib/validation";

export const maxDuration = 45;

function slug(): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 12);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return fail(401, "unauthenticated", "Please log in again.");

  const limited = rateLimit(`card:${user.id}`, 10, 60_000);
  if (!limited.ok) return fail(429, "rate_limited", `Try again in ${limited.retryAfter}s.`);

  let lookId: string;
  try {
    lookId = barberCardInput.parse(await request.json()).lookId;
  } catch {
    return fail(400, "bad_request", "That request didn't look right.");
  }

  // Already made one for this look? Hand back the same card rather than charging again.
  const { data: existing } = await supabase
    .from("barber_cards")
    .select("share_slug")
    .eq("look_id", lookId)
    .maybeSingle();
  if (existing) return ok({ slug: existing.share_slug, reused: true });

  const { data: look } = await supabase
    .from("looks")
    .select("*")
    .eq("id", lookId)
    .maybeSingle();
  if (!look) return fail(404, "not_found", "We couldn't find that look.");

  const { data: gate, error: gateErr } = await supabase.rpc("consume_entitlement", {
    feature_key: "barber_card",
  });
  if (gateErr) return fail(500, "gate_failed", "We couldn't check your plan. Try again.");
  if (!(gate as { allowed: boolean }).allowed) {
    const reason = (gate as { reason: string }).reason;
    return fail(402, reason, gateMessage(reason, "barber cards"), { gate });
  }

  const { data: dnaRow } = await supabase
    .from("style_profiles")
    .select("raw")
    .eq("user_id", user.id)
    .eq("is_current", true)
    .maybeSingle();

  const dna = (dnaRow?.raw ?? {}) as StyleDna;
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

  const written = await writeBarberCard({ dna, look: lookRec });

  await supabase.rpc("log_ai_call", {
    p_kind: "barber_card",
    p_model: written.model,
    p_in: written.inputTokens,
    p_out: written.outputTokens,
    p_images: 0,
    p_latency: written.latencyMs,
    p_cost: written.costInr,
    p_ok: true,
    p_error: written.fellBackBecause ?? null,
  });

  const card = written.data;
  const shareSlug = slug();

  const { error: insertErr } = await supabase.from("barber_cards").insert({
    user_id: user.id,
    look_id: lookId,
    share_slug: shareSlug,
    title: card.title,
    sides: card.sides,
    top: card.top,
    back: card.back,
    neckline: card.neckline,
    parting: card.parting,
    technique: card.technique,
    guards: card.guards,
    say_this_en: card.say_this_en,
    say_this_hi: card.say_this_hi,
    avoid: card.avoid,
    beard_notes: card.beard_notes,
  });
  if (insertErr) return fail(500, "save_failed", "We wrote the card but couldn't save it. Try again.");

  return ok({ slug: shareSlug, reused: false });
}
