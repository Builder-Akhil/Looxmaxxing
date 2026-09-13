"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  lookId: z.string().uuid().nullable(),
  intervalWeeks: z.number().int().min(1).max(26),
  lastTrimOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  remindersEnabled: z.boolean(),
});

function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export async function saveRoutine(formData: FormData): Promise<void> {
  const parsed = schema.safeParse({
    lookId: (formData.get("lookId") as string) || null,
    intervalWeeks: Number(formData.get("intervalWeeks") ?? 4),
    lastTrimOn: String(formData.get("lastTrimOn") ?? new Date().toISOString().slice(0, 10)),
    remindersEnabled: formData.get("reminders") === "on",
  });
  if (!parsed.success) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { lookId, intervalWeeks, lastTrimOn, remindersEnabled } = parsed.data;
  const nextTrim = addDays(lastTrimOn, intervalWeeks * 7);

  const { data: routine } = await supabase
    .from("routines")
    .update({
      look_id: lookId,
      trim_interval_weeks: intervalWeeks,
      last_trim_on: lastTrimOn,
      next_trim_on: nextTrim,
      reminders_enabled: remindersEnabled,
    })
    .eq("user_id", user.id)
    .select("id")
    .single();

  if (!routine) return;

  // Rebuild the schedule from scratch — simpler than reconciling, and the
  // schedule is small.
  await supabase.from("routine_events").delete().eq("routine_id", routine.id).eq("done", false);

  const events = [
    {
      kind: "trim" as const,
      due_on: nextTrim,
      title: "Trim due",
      detail: `You're on a ${intervalWeeks}-week rhythm. Book a couple of days ahead.`,
    },
    {
      kind: "beard_checkpoint" as const,
      due_on: addDays(lastTrimOn, 14),
      title: "Two-week check",
      detail: "Tidy the neckline and cheek line. This is what keeps a cut looking fresh.",
    },
    {
      kind: "product" as const,
      due_on: addDays(lastTrimOn, intervalWeeks * 7 - 7),
      title: "A week to go",
      detail: "Shape is starting to drop. Slightly more product this week, or book early.",
    },
  ];

  await supabase.from("routine_events").insert(
    events.map((e) => ({ ...e, user_id: user.id, routine_id: routine.id })),
  );

  await supabase.rpc("log_audit", {
    p_action: "routine_saved",
    p_detail: { interval_weeks: intervalWeeks, next_trim_on: nextTrim },
  });

  revalidatePath("/routine");
  revalidatePath("/dashboard");
}

export async function markEventDone(formData: FormData): Promise<void> {
  const id = String(formData.get("eventId") ?? "");
  if (!z.string().uuid().safeParse(id).success) return;

  const supabase = await createClient();
  await supabase.from("routine_events").update({ done: true }).eq("id", id);
  revalidatePath("/routine");
}
