import type { Metadata } from "next";
import { CheckCircle2, Circle } from "lucide-react";
import { Card, Button, Badge, EmptyState, ButtonLink, Callout } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";
import { saveRoutine, markEventDone } from "@/lib/actions/routine";
import type { LookRow } from "@/lib/types";

export const metadata: Metadata = { title: "Your routine" };

export default async function RoutinePage() {
  const supabase = await createClient();

  const [{ data: routine }, { data: looks }, { data: events }] = await Promise.all([
    supabase.from("routines").select("*").maybeSingle(),
    supabase.from("looks").select("*").eq("saved", true).order("created_at", { ascending: false }),
    supabase.from("routine_events").select("*").order("due_on"),
  ]);

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="flex flex-col gap-8">
      <header>
        <p className="eyebrow">Upkeep</p>
        <h1 className="mt-2 font-display text-[clamp(28px,4.2vw,40px)] font-bold leading-tight tracking-[-0.015em]">
          Your routine
        </h1>
        <p className="mt-3 max-w-[58ch] text-[16px] leading-relaxed text-ink-2">
          A cut is a subscription, not a purchase. Tell us when you last sat in the
          chair and we&rsquo;ll keep the rhythm for you.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <Card className="p-6">
          <p className="eyebrow border-b border-line pb-3">Set the rhythm</p>
          <form action={saveRoutine} className="flex flex-col gap-5 pt-5">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="lookId" className="text-[13.5px] font-semibold">
                Which look did you go with?
              </label>
              <select
                id="lookId"
                name="lookId"
                defaultValue={routine?.look_id ?? ""}
                className="h-11 w-full rounded-sm border border-line bg-surface px-3 text-[15px] focus:border-brass focus:outline-none"
              >
                <option value="">Not decided yet</option>
                {(looks as LookRow[] | null)?.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
              {(!looks || looks.length === 0) && (
                <p className="text-[13px] text-muted">
                  Save a look first and it&rsquo;ll appear here.
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="lastTrimOn" className="text-[13.5px] font-semibold">
                When was your last cut?
              </label>
              <input
                id="lastTrimOn"
                name="lastTrimOn"
                type="date"
                max={today}
                defaultValue={routine?.last_trim_on ?? today}
                className="h-11 w-full rounded-sm border border-line bg-surface px-3 text-[15px] focus:border-brass focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="intervalWeeks" className="text-[13.5px] font-semibold">
                How often do you go?
              </label>
              <select
                id="intervalWeeks"
                name="intervalWeeks"
                defaultValue={String(routine?.trim_interval_weeks ?? 4)}
                className="h-11 w-full rounded-sm border border-line bg-surface px-3 text-[15px] focus:border-brass focus:outline-none"
              >
                {[2, 3, 4, 5, 6, 8, 10, 12].map((w) => (
                  <option key={w} value={w}>
                    Every {w} weeks
                  </option>
                ))}
              </select>
            </div>

            <label className="flex cursor-pointer items-start gap-3 border border-line p-3.5 has-checked:border-brass has-checked:bg-brass-wash">
              <input
                type="checkbox"
                name="reminders"
                defaultChecked={routine?.reminders_enabled ?? true}
                className="mt-0.5 h-4 w-4 accent-[var(--brass)]"
              />
              <span>
                <span className="block text-[14.5px] font-semibold">Remind me by email</span>
                <span className="mt-0.5 block text-[13px] text-muted">
                  One message when a trim is due. Nothing else.
                </span>
              </span>
            </label>

            <Button type="submit" variant="brass">
              Save my routine
            </Button>
          </form>
        </Card>

        <div className="flex flex-col gap-5">
          {routine?.next_trim_on && (
            <Card className="p-6">
              <p className="eyebrow">Coming up</p>
              <p className="mt-3 font-display text-[28px] font-bold leading-tight">
                {new Date(routine.next_trim_on).toLocaleDateString("en-GB", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </p>
              <p className="mt-1 text-[14.5px] text-muted">
                Every {routine.trim_interval_weeks} weeks keeps this shape honest.
              </p>
            </Card>
          )}

          <div>
            <p className="eyebrow mb-3">Checkpoints</p>
            {events && events.length > 0 ? (
              <ul className="divide-y divide-line border border-line bg-surface">
                {events.map((e) => {
                  const overdue = !e.done && e.due_on < today;
                  return (
                    <li key={e.id} className="flex items-start gap-3 p-4">
                      <form action={markEventDone}>
                        <input type="hidden" name="eventId" value={e.id} />
                        <button
                          type="submit"
                          disabled={e.done}
                          aria-label={e.done ? "Already done" : `Mark "${e.title}" done`}
                          className={e.done ? "text-sage" : "text-faint hover:text-brass"}
                        >
                          {e.done ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                        </button>
                      </form>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`text-[15px] font-semibold ${e.done ? "text-muted line-through" : "text-ink"}`}>
                            {e.title}
                          </span>
                          {overdue && <Badge tone="clay">overdue</Badge>}
                        </div>
                        <p className="mt-0.5 text-[13.5px] leading-snug text-muted">{e.detail}</p>
                        <p className="mt-1 font-mono text-[11px] text-faint">
                          {new Date(e.due_on).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <EmptyState title="No checkpoints yet">
                Set the rhythm on the left and we&rsquo;ll build the schedule around it.
              </EmptyState>
            )}
          </div>

          {(!looks || looks.length === 0) && (
            <Callout tone="brass" title="Save a look first">
              The routine works best when it&rsquo;s tied to the cut you actually got.{" "}
              <ButtonLink href="/dashboard" size="sm" variant="outline" className="mt-3">
                Go to dashboard
              </ButtonLink>
            </Callout>
          )}
        </div>
      </div>
    </div>
  );
}
