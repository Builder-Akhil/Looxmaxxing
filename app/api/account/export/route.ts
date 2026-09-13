import { createClient } from "@/lib/supabase/server";
import { fail } from "@/lib/api";
import { rateLimit } from "@/lib/ratelimit";

/** Everything we hold about you, as one JSON file. */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return fail(401, "unauthenticated", "Please log in again.");

  const limited = rateLimit(`export:${user.id}`, 3, 60_000);
  if (!limited.ok) return fail(429, "rate_limited", "Give it a minute between exports.");

  const { data, error } = await supabase.rpc("export_my_data");
  if (error) return fail(500, "export_failed", "We couldn't build your export. Try again.");

  await supabase.rpc("log_audit", { p_action: "data_exported", p_detail: {} });

  const stamp = new Date().toISOString().slice(0, 10);
  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="looxmaxxing-export-${stamp}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
