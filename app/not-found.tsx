import { ButtonLink } from "@/components/ui";
import { Logo } from "@/components/Logo";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center">
      <Logo size="sm" />
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-faint">Error 404</p>
      <h1 className="max-w-[18ch] font-display text-[clamp(32px,6vw,52px)] font-bold leading-[1.03] tracking-[-0.015em] balance">
        Nothing here. Not even a bad haircut.
      </h1>
      <p className="max-w-[42ch] text-[16px] leading-relaxed text-ink-2">
        The page you were after has moved, expired, or never existed.
      </p>
      <div className="mt-2 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/" variant="brass">Back to the start</ButtonLink>
        <ButtonLink href="/dashboard" variant="outline">My dashboard</ButtonLink>
      </div>
    </div>
  );
}
