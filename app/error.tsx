"use client";

import { useEffect } from "react";
import { Button, ButtonLink } from "@/components/ui";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center">
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-faint">Something broke</p>
      <h1 className="max-w-[20ch] font-display text-[clamp(28px,5vw,44px)] font-bold leading-[1.05] tracking-[-0.015em] balance">
        That didn&rsquo;t work, and it&rsquo;s our fault.
      </h1>
      <p className="max-w-[44ch] text-[16px] leading-relaxed text-ink-2">
        Try again — most of these clear on a second attempt. If it keeps happening,
        the reference below helps us find it.
      </p>
      {error.digest && (
        <code className="rounded-sm bg-surface-2 px-3 py-1.5 font-mono text-[12px] text-muted">
          {error.digest}
        </code>
      )}
      <div className="mt-2 flex flex-wrap justify-center gap-3">
        <Button variant="brass" onClick={reset}>Try again</Button>
        <ButtonLink href="/dashboard" variant="outline">Back to dashboard</ButtonLink>
      </div>
    </div>
  );
}
