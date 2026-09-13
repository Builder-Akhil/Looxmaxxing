"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { consentInput } from "@/lib/validation";
import { QUIZ } from "@/lib/quiz";

const answersSchema = z.record(z.string(), z.union([z.string(), z.array(z.string())]));

export async function saveQuiz(answers: unknown): Promise<{ ok: boolean; error?: string }> {
  const parsed = answersSchema.safeParse(answers);
  if (!parsed.success) return { ok: false, error: "Those answers didn't look right. Try again." };

  // Only keep values the quiz actually offers. Never trust the client.
  const clean: Record<string, string | string[]> = {};
  for (const q of QUIZ) {
    const raw = parsed.data[q.id];
    if (raw === undefined) continue;
    const valid = new Set(q.options.map((o) => o.value));
    if (Array.isArray(raw)) {
      const kept = raw.filter((v) => valid.has(v));
      if (kept.length) clean[q.id] = kept;
    } else if (valid.has(raw)) {
      clean[q.id] = raw;
    }
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Please log in again." };

  const { error } = await supabase.from("quiz_responses").upsert(
    {
      user_id: user.id,
      quiz_version: "v1",
      answers: clean,
      completed_at: new Date().toISOString(),
    },
    { onConflict: "user_id,quiz_version" },
  );

  if (error) return { ok: false, error: "We couldn't save that. Try once more." };
  return { ok: true };
}

export async function recordConsent(formData: FormData) {
  const parsed = consentInput.safeParse({
    biometric_processing: formData.get("biometric") === "on" ? true : undefined,
    photo_retention: formData.get("retention") === "on",
    marketing: formData.get("marketing") === "on",
  });

  if (!parsed.success) {
    redirect("/start/consent?error=required");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  const ua = h.get("user-agent") ?? null;

  const rows = (
    [
      ["biometric_processing", parsed.data.biometric_processing],
      ["photo_retention", parsed.data.photo_retention],
      ["marketing", parsed.data.marketing],
    ] as const
  ).map(([kind, granted]) => ({
    user_id: user.id,
    kind,
    policy_version: "v1",
    granted,
    ip,
    user_agent: ua,
  }));

  await supabase.from("consents").insert(rows);
  await supabase.rpc("log_audit", {
    p_action: "consent_recorded",
    p_detail: { retention: parsed.data.photo_retention, marketing: parsed.data.marketing },
  });

  redirect("/start/photo");
}

/** Has this user given us the one consent that is not optional? */
export async function hasBiometricConsent(): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("consents")
    .select("granted")
    .eq("kind", "biometric_processing")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return Boolean(data?.granted);
}
