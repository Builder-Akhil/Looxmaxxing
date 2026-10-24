import Link from "next/link";
import clsx from "clsx";
import type { ComponentProps, ReactNode } from "react";

/* ---------------------------------------------------------------- buttons */

const BASE =
  "inline-flex items-center justify-center gap-2 font-semibold transition-colors " +
  "disabled:opacity-45 disabled:pointer-events-none select-none";

const VARIANTS = {
  primary: "bg-brass text-on-brass hover:bg-brass-bright",
  brass: "bg-brass text-on-brass hover:bg-brass-bright",
  outline: "border border-line bg-surface text-ink hover:border-brass hover:text-brass-ink",
  ghost: "text-ink-2 hover:text-brass-ink hover:bg-brass-wash",
  danger: "border border-clay text-clay hover:bg-clay-wash",
} as const;

const SIZES = {
  sm: "h-8 px-3 text-[13px] rounded-[3px]",
  md: "h-10 px-5 text-[14.5px] rounded-[3px]",
  lg: "h-12 px-7 text-[15.5px] rounded-[3px]",
} as const;

type ButtonStyle = { variant?: keyof typeof VARIANTS; size?: keyof typeof SIZES };

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ComponentProps<"button"> & ButtonStyle) {
  return <button className={clsx(BASE, VARIANTS[variant], SIZES[size], className)} {...props} />;
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ComponentProps<typeof Link> & ButtonStyle) {
  return <Link className={clsx(BASE, VARIANTS[variant], SIZES[size], className)} {...props} />;
}

/* ---------------------------------------------------------------- surfaces */

export function Card({
  className,
  children,
  lift = false,
}: {
  className?: string;
  children: ReactNode;
  lift?: boolean;
}) {
  return (
    <div
      className={clsx(
        "border border-line bg-surface",
        lift && "shadow-[var(--shadow)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function SectionHead({
  eyebrow,
  title,
  lead,
  className,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  className?: string;
}) {
  return (
    <div className={clsx("max-w-[62ch]", className)}>
      {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
      <h2 className="font-display text-[clamp(26px,3.6vw,38px)] leading-[1.08] tracking-[-0.01em] balance">
        {title}
      </h2>
      {lead && <p className="mt-3 text-[16.5px] leading-relaxed text-ink-2">{lead}</p>}
    </div>
  );
}

/* ---------------------------------------------------------------- badges + callouts */

const TONES = {
  neutral: "border-line text-muted bg-surface-2",
  brass: "border-brass/40 text-brass-ink bg-brass-wash",
  sage: "border-sage/40 text-sage bg-sage-wash",
  clay: "border-clay/40 text-clay bg-clay-wash",
} as const;

export function Badge({
  tone = "neutral",
  children,
  className,
}: {
  tone?: keyof typeof TONES;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-[3px] border px-2 py-0.5 font-mono text-[10.5px] uppercase tracking-[0.09em]",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Callout({
  tone = "sage",
  title,
  children,
  className,
}: {
  tone?: "sage" | "clay" | "brass";
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  const border =
    tone === "clay" ? "border-l-clay bg-clay-wash" : tone === "brass" ? "border-l-brass bg-brass-wash" : "border-l-sage bg-sage-wash";
  return (
    <div className={clsx("border-l-[3px] px-5 py-4 text-[14.5px] leading-relaxed text-ink-2", border, className)}>
      {title && <p className="mb-1 font-semibold text-ink">{title}</p>}
      {children}
    </div>
  );
}

/* ---------------------------------------------------------------- forms */

export function Field({
  label,
  hint,
  error,
  children,
  htmlFor,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  htmlFor?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-[13.5px] font-semibold text-ink">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-[13px] text-clay">{error}</p>
      ) : hint ? (
        <p className="text-[13px] text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

export function Input({ className, ...props }: ComponentProps<"input">) {
  return (
    <input
      className={clsx(
        "h-11 w-full rounded-[3px] border border-line bg-surface px-3.5 text-[15px] text-ink",
        "placeholder:text-faint focus:border-brass focus:outline-none",
        className,
      )}
      {...props}
    />
  );
}

/* ---------------------------------------------------------------- feedback */

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={clsx("inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent", className)}
      aria-hidden="true"
    />
  );
}

export function Meter({
  used,
  limit,
  label,
  tone = "brass",
}: {
  used: number;
  limit: number;
  label: string;
  tone?: "brass" | "sage" | "clay";
}) {
  const pct = limit <= 0 ? 100 : Math.min(100, Math.round((used / limit) * 100));
  const bar = tone === "clay" ? "bg-clay" : tone === "sage" ? "bg-sage" : "bg-brass";
  const exhausted = limit > 0 && used >= limit;
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <span className="text-[13.5px] text-ink-2">{label}</span>
        <span className={clsx("font-mono text-[12.5px] tnum", exhausted ? "text-clay" : "text-muted")}>
          {used} / {limit === 0 ? "—" : limit}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-3">
        <div className={clsx("h-full rounded-full transition-[width]", exhausted ? "bg-clay" : bar)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  children,
  action,
}: {
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 border border-dashed border-line bg-surface-2/50 px-6 py-14 text-center">
      <p className="font-display text-[21px] text-ink">{title}</p>
      {children && <p className="max-w-[46ch] text-[14.5px] leading-relaxed text-muted">{children}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
