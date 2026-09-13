import type { Metadata } from "next";
import Link from "next/link";
import { Card, Badge, EmptyState, ButtonLink } from "@/components/ui";
import { Silhouette } from "@/components/Silhouette";
import { createClient } from "@/lib/supabase/server";
import type { PaletteJson } from "@/lib/types";
import type { Silhouette as SilhouetteKey } from "@/lib/validation";

export const metadata: Metadata = { title: "History" };

type SessionRow = {
  id: string;
  created_at: string;
  goal: string;
  summary: string | null;
  source: "ai" | "mock";
  palette: PaletteJson;
};

export default async function HistoryPage() {
  const supabase = await createClient();

  const { data: sessions } = await supabase
    .from("styling_sessions")
    .select("id, created_at, goal, summary, source, palette")
    .order("created_at", { ascending: false })
    .limit(50);

  const ids = (sessions ?? []).map((s) => s.id);
  const { data: looks } = ids.length
    ? await supabase.from("looks").select("id, session_id, name, silhouette, rank").in("session_id", ids).order("rank")
    : { data: [] };

  const bySession = new Map<string, { id: string; name: string; silhouette: SilhouetteKey }[]>();
  for (const l of looks ?? []) {
    const list = bySession.get(l.session_id) ?? [];
    list.push({ id: l.id, name: l.name, silhouette: l.silhouette as SilhouetteKey });
    bySession.set(l.session_id, list);
  }

  return (
    <div className="flex flex-col gap-8">
      <header>
        <p className="eyebrow">Everything you&rsquo;ve been given</p>
        <h1 className="mt-2 font-display text-[clamp(28px,4.2vw,40px)] font-bold leading-tight tracking-[-0.015em]">
          Your history
        </h1>
      </header>

      {sessions && sessions.length > 0 ? (
        <ol className="flex flex-col gap-4">
          {(sessions as SessionRow[]).map((s) => {
            const sessionLooks = bySession.get(s.id) ?? [];
            const date = new Date(s.created_at);
            return (
              <li key={s.id}>
                <Card className="grid gap-5 p-5 md:grid-cols-[190px_1fr] md:items-start">
                  <div>
                    <p className="font-mono text-[11.5px] uppercase tracking-[0.09em] text-faint">
                      {date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                    <p className="mt-1 font-mono text-[11.5px] text-faint">
                      {date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <Badge tone="neutral">{s.goal}</Badge>
                      {s.source === "mock" && <Badge tone="neutral">rules</Badge>}
                      {s.palette?.name && <Badge tone="brass">{s.palette.name}</Badge>}
                    </div>
                  </div>

                  <div className="min-w-0">
                    {s.summary && (
                      <p className="text-[15px] leading-relaxed text-ink-2">{s.summary}</p>
                    )}
                    <div className="mt-4 flex flex-wrap items-center gap-4">
                      {sessionLooks.slice(0, 6).map((l) => (
                        <div key={l.id} className="flex w-[62px] flex-col items-center gap-1">
                          <div className="w-full text-ink">
                            <Silhouette look={l.silhouette} className="h-[64px] w-full" showFace={false} />
                          </div>
                          <span className="text-center text-[10.5px] leading-tight text-muted">{l.name}</span>
                        </div>
                      ))}
                    </div>
                    <Link
                      href={`/style/${s.id}`}
                      className="mt-4 inline-block text-[14px] text-brass-ink underline underline-offset-4"
                    >
                      Open this session
                    </Link>
                  </div>
                </Card>
              </li>
            );
          })}
        </ol>
      ) : (
        <EmptyState
          title="Nothing here yet"
          action={<ButtonLink href="/start/quiz" variant="brass">Start your first reading</ButtonLink>}
        >
          Every styling session lands here, with the looks you were given and the
          colours that went with them.
        </EmptyState>
      )}
    </div>
  );
}
