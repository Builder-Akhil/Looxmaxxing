import { createAdminClient, authorisedCron } from "@/lib/supabase/admin";
import { fail, ok } from "@/lib/api";

export const maxDuration = 60;

/**
 * Daily: find routine checkpoints that are due and mark them notified.
 * Sending the actual email needs a mail provider; until one is connected this
 * records what would have gone out, so nothing is silently lost.
 */
export async function GET(request: Request) {
  if (!authorisedCron(request)) return fail(401, "unauthorised", "Not for you.");

  const admin = createAdminClient();
  if (!admin) {
    return ok({
      skipped: true,
      reason: "SUPABASE_SERVICE_ROLE_KEY is not set, so reminders can't be gathered.",
    });
  }

  const today = new Date().toISOString().slice(0, 10);

  const { data: due, error } = await admin
    .from("routine_events")
    .select("id, user_id, kind, title, detail, due_on, routines!inner(reminders_enabled)")
    .lte("due_on", today)
    .eq("done", false)
    .is("notified_at", null)
    .limit(200);

  if (error) return fail(500, "query_failed", error.message);

  const rows = (due ?? []).filter(
    (r) => (r as unknown as { routines: { reminders_enabled: boolean } }).routines?.reminders_enabled,
  );
  if (!rows.length) return ok({ notified: 0 });

  // TODO: hand these to a mail provider. Until then they're marked so the same
  // reminder is never queued twice.
  await admin
    .from("routine_events")
    .update({ notified_at: new Date().toISOString() })
    .in("id", rows.map((r) => r.id));

  return ok({
    notified: rows.length,
    delivered: false,
    note: "No mail provider connected yet — these are marked so they don't queue twice.",
  });
}
