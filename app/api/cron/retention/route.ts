import { createAdminClient, authorisedCron } from "@/lib/supabase/admin";
import { fail, ok } from "@/lib/api";

export const maxDuration = 60;

/**
 * Nightly: permanently remove photos whose retention has run out.
 * Deletes the stored file first, then the row — an orphaned file is the
 * failure mode that matters here.
 */
export async function GET(request: Request) {
  if (!authorisedCron(request)) return fail(401, "unauthorised", "Not for you.");

  const admin = createAdminClient();
  if (!admin) {
    return ok({
      skipped: true,
      reason: "SUPABASE_SERVICE_ROLE_KEY is not set, so the sweep can't run. Users can still delete their own photos instantly from settings.",
    });
  }

  const { data: due, error } = await admin.rpc("photos_due_for_deletion");
  if (error) return fail(500, "query_failed", error.message);

  const rows = (due ?? []) as { id: string; user_id: string; storage_path: string }[];
  if (!rows.length) return ok({ deleted: 0 });

  const { error: storageErr } = await admin.storage
    .from("photos")
    .remove(rows.map((r) => r.storage_path));

  // If the files can't go, don't mark the rows deleted — better to retry tomorrow.
  if (storageErr) return fail(500, "storage_failed", storageErr.message);

  await admin
    .from("photos")
    .update({ deleted_at: new Date().toISOString(), status: "deleted" })
    .in("id", rows.map((r) => r.id));

  await admin.from("audit_log").insert(
    rows.map((r) => ({
      user_id: r.user_id,
      actor: "system",
      action: "photo_retention_swept",
      detail: { photo_id: r.id },
    })),
  );

  return ok({ deleted: rows.length });
}
