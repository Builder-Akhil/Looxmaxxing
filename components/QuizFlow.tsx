"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { QUIZ, isComplete, optionLabel, type QuizAnswers } from "@/lib/quiz";
import type { Market } from "@/lib/brand";
import { Button, Callout } from "@/components/ui";
import { QuizIcon } from "@/components/QuizIcon";
import { saveQuiz } from "@/lib/actions/onboarding";

export function QuizFlow({
  market,
  initial,
}: {
  market: Market;
  initial: QuizAnswers;
}) {
  const router = useRouter();
  const [answers, setAnswers] = useState<QuizAnswers>(initial);
  const [index, setIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const q = QUIZ[index];
  const isLast = index === QUIZ.length - 1;
  const current = answers[q.id];
  const answered = q.type === "multi" ? Array.isArray(current) && current.length > 0 : Boolean(current);

  function choose(value: string) {
    setError(null);
    setAnswers((prev) => {
      if (q.type === "single") return { ...prev, [q.id]: value };

      const existing = Array.isArray(prev[q.id]) ? (prev[q.id] as string[]) : [];
      // "None of these" and "Nothing's off limits" clear everything else.
      const exclusive = ["none", "open", "fine"];
      if (exclusive.includes(value)) return { ...prev, [q.id]: [value] };

      const withoutExclusive = existing.filter((v) => !exclusive.includes(v));
      const next = withoutExclusive.includes(value)
        ? withoutExclusive.filter((v) => v !== value)
        : [...withoutExclusive, value];
      return { ...prev, [q.id]: next };
    });

    if (q.type === "single" && !isLast) {
      window.setTimeout(() => setIndex((i) => Math.min(i + 1, QUIZ.length - 1)), 180);
    }
  }

  function next() {
    if (!answered) {
      setError("Pick at least one — there's no wrong answer here.");
      return;
    }
    if (!isLast) {
      setIndex((i) => i + 1);
      return;
    }
    if (!isComplete(answers)) {
      const missing = QUIZ.findIndex((qq) => {
        const a = answers[qq.id];
        return qq.type === "multi" ? !Array.isArray(a) || !a.length : !a;
      });
      setIndex(Math.max(missing, 0));
      setError("One question still needs an answer.");
      return;
    }

    startTransition(async () => {
      const res = await saveQuiz(answers);
      if (!res.ok) {
        setError(res.error ?? "Something went wrong. Try again.");
        return;
      }
      router.push("/start/consent");
    });
  }

  const progress = Math.round(((index + (answered ? 1 : 0)) / QUIZ.length) * 100);

  return (
    <div className="mx-auto w-full max-w-2xl">
      {/* progress */}
      <div className="mb-10">
        <div className="mb-2 flex items-baseline justify-between">
          <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-faint">
            Question {index + 1} of {QUIZ.length}
          </span>
          <span className="font-mono text-[11px] tnum text-faint">{progress}%</span>
        </div>
        <div className="h-[3px] w-full overflow-hidden bg-surface-3">
          <div
            className="h-full bg-brass transition-[width] duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div key={q.id} className="rise">
        <h1 className="font-display text-[clamp(26px,4.2vw,36px)] font-bold leading-[1.1] tracking-[-0.015em] balance">
          {q.question}
        </h1>
        <p className="mt-3 max-w-[52ch] text-[15px] leading-relaxed text-muted">{q.why}</p>
        {q.type === "multi" && (
          <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.1em] text-faint">
            Choose as many as apply
          </p>
        )}

        <div className="mt-8 grid gap-2.5 sm:grid-cols-2">
          {q.options.map((o) => {
            const selected =
              q.type === "multi"
                ? Array.isArray(current) && current.includes(o.value)
                : current === o.value;
            return (
              <button
                key={o.value}
                type="button"
                onClick={() => choose(o.value)}
                aria-pressed={selected}
                className={clsx(
                  "group flex items-start gap-3.5 border p-4 text-left transition-colors",
                  selected
                    ? "border-brass bg-brass-wash"
                    : "border-line bg-surface hover:border-brass/50 hover:bg-surface-2",
                )}
              >
                <span className={clsx("mt-0.5 shrink-0", selected ? "text-brass-ink" : "text-muted")}>
                  <QuizIcon name={o.icon} className="h-5 w-5" />
                </span>
                <span>
                  <span className={clsx("block text-[15.5px] font-medium leading-snug", selected ? "text-ink" : "text-ink")}>
                    {optionLabel(o, market)}
                  </span>
                  {o.hint && <span className="mt-0.5 block text-[13px] leading-snug text-muted">{o.hint}</span>}
                </span>
              </button>
            );
          })}
        </div>

        {q.footnote && (
          <Callout tone="sage" className="mt-5">
            {q.footnote}
          </Callout>
        )}
        {error && (
          <Callout tone="clay" className="mt-5">
            {error}
          </Callout>
        )}
      </div>

      <div className="mt-9 flex items-center justify-between gap-4 border-t border-line pt-6">
        <Button
          variant="ghost"
          onClick={() => {
            setError(null);
            setIndex((i) => Math.max(i - 1, 0));
          }}
          disabled={index === 0}
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <Button variant="brass" onClick={next} disabled={pending}>
          {pending ? "Saving…" : isLast ? "Done — next step" : "Next"}
          {!pending && <ArrowRight className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
