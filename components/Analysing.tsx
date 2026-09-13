"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Callout, Button } from "@/components/ui";

const STAGES = [
  "Reading bone structure",
  "Measuring hairline and density",
  "Matching your hair to the 1A–4C scale",
  "Finding your undertone and contrast",
  "Ruling out what you said you'd never do",
  "Costing the upkeep, honestly",
];

export function Analysing({ photoId }: { photoId: string | null }) {
  const router = useRouter();
  const [stage, setStage] = useState(0);
  const [error, setError] = useState<{ message: string; upgrade?: boolean } | null>(null);
  const fired = useRef(false);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setStage((s) => (s < STAGES.length - 1 ? s + 1 : s));
    }, 2600);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    (async () => {
      try {
        const res = await fetch("/api/style/run", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ photoId, goal: "everyday" }),
        });
        const data = await res.json();

        if (!res.ok) {
          setError({
            message: data.message ?? "Something went wrong. Try again.",
            upgrade: res.status === 402,
          });
          return;
        }
        router.replace(`/style/${data.sessionId}?fresh=1`);
      } catch {
        setError({ message: "We lost the connection. Check your network and try again." });
      }
    })();
  }, [photoId, router]);

  if (error) {
    return (
      <div className="mx-auto w-full max-w-xl">
        <h1 className="font-display text-[30px] font-bold leading-tight tracking-[-0.015em]">
          That didn&rsquo;t finish
        </h1>
        <Callout tone="clay" className="mt-5">
          {error.message}
        </Callout>
        <div className="mt-6 flex flex-wrap gap-3">
          {error.upgrade ? (
            <Link href="/billing">
              <Button variant="brass">See plans</Button>
            </Link>
          ) : (
            <Button variant="brass" onClick={() => window.location.reload()}>
              Try again
            </Button>
          )}
          <Link href="/dashboard">
            <Button variant="ghost">Back to dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center py-12 text-center">
      <div className="relative h-1 w-56 overflow-hidden bg-surface-3 sweep" />

      <h1 className="mt-10 font-display text-[clamp(28px,4.4vw,36px)] font-bold leading-[1.1] tracking-[-0.015em] balance">
        Reading your face
      </h1>
      <p className="mt-3 text-[15px] text-muted">About twenty seconds. Worth the wait.</p>

      <ol className="mt-10 w-full space-y-2.5 text-left">
        {STAGES.map((s, i) => (
          <li
            key={s}
            className={`flex items-center gap-3 border-l-2 py-1.5 pl-4 text-[15px] transition-colors ${
              i < stage
                ? "border-l-sage text-muted"
                : i === stage
                  ? "border-l-brass text-ink"
                  : "border-l-line text-faint"
            }`}
          >
            <span className="font-mono text-[11px] tnum">{String(i + 1).padStart(2, "0")}</span>
            {s}
            {i < stage && <span className="ml-auto font-mono text-[11px] text-sage">done</span>}
          </li>
        ))}
      </ol>
    </div>
  );
}
