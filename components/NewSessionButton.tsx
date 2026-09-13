"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { Button, Callout } from "./ui";

export function NewSessionButton({
  label = "New styling session",
  variant = "brass",
  goal = "everyday",
}: {
  label?: string;
  variant?: "brass" | "outline" | "primary";
  goal?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/style/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? "That didn't work. Try again.");
        setBusy(false);
        return;
      }
      router.push(`/style/${data.sessionId}?fresh=1`);
    } catch {
      setError("Lost connection. Try again.");
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <Button variant={variant} onClick={run} disabled={busy}>
        <Sparkles className="h-4 w-4" />
        {busy ? "Working…" : label}
      </Button>
      {error && <Callout tone="clay">{error}</Callout>}
    </div>
  );
}
