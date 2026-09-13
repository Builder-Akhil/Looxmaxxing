import type { Metadata } from "next";
import Link from "next/link";
import { recordConsent } from "@/lib/actions/onboarding";
import { Button, Callout } from "@/components/ui";

export const metadata: Metadata = { title: "Before the camera opens" };

export default async function ConsentPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="mx-auto w-full max-w-2xl">
      <p className="eyebrow">Step 2 of 3</p>
      <h1 className="mt-3 font-display text-[clamp(28px,4.4vw,38px)] font-bold leading-[1.08] tracking-[-0.015em] balance">
        Before the camera opens
      </h1>
      <p className="mt-4 max-w-[56ch] text-[16px] leading-relaxed text-ink-2">
        A photo of your face is sensitive data — legally and practically. So here
        is exactly what happens to it, in plain English, before you upload
        anything.
      </p>

      <div className="mt-8 divide-y divide-line border border-line bg-surface">
        {[
          {
            t: "What we read from it",
            d: "Face shape, hairline, hair type and texture, density, skin undertone and contrast, beard coverage, brow shape. Styling features only — never anything about your identity, age or ethnicity.",
          },
          {
            t: "Where it goes",
            d: "Straight into private storage in Mumbai. The link is signed and expires. No other user, no search engine, and no third party can reach it.",
          },
          {
            t: "What we never do",
            d: "We don't sell it. We don't train models on it. We don't show it to anyone. It is never used for advertising.",
          },
          {
            t: "How you undo it",
            d: "One button on your settings page deletes the photo and everything we derived from it. No email, no waiting period.",
          },
        ].map((row) => (
          <div key={row.t} className="grid gap-2 p-5 sm:grid-cols-[150px_1fr] sm:gap-6">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-faint">{row.t}</p>
            <p className="text-[14.5px] leading-relaxed text-ink-2">{row.d}</p>
          </div>
        ))}
      </div>

      {error && (
        <Callout tone="clay" className="mt-6">
          The first box is required — without it we can&rsquo;t read a photo at all.
          You can still continue without a photo and get a reading from your quiz
          answers alone.
        </Callout>
      )}

      <form action={recordConsent} className="mt-8 flex flex-col gap-5">
        <Consent
          name="biometric"
          required
          title="Yes, analyse my photo"
          detail="You may process my photograph to work out my styling features. Required to upload a photo."
        />
        <Consent
          name="retention"
          defaultChecked
          title="Keep my photo for restyles"
          detail="Store it so I don't have to upload again every time. Untick and we delete it within minutes of the reading — you'll just need a fresh photo next time."
        />
        <Consent
          name="marketing"
          title="Send me grooming tips occasionally"
          detail="Optional, and unrelated to your trim reminders. Unsubscribe any time."
        />

        <div className="mt-2 flex flex-wrap items-center gap-3 border-t border-line pt-6">
          <Button type="submit" variant="brass" size="lg">
            Agree and continue
          </Button>
          <Link
            href="/start/analysing?photo=skip"
            className="px-2 text-[14.5px] text-ink-2 underline decoration-line underline-offset-4 hover:text-brass-ink"
          >
            Skip the photo — read me from the quiz only
          </Link>
        </div>
        <p className="text-[13px] leading-relaxed text-muted">
          Recorded with a timestamp and the policy version you agreed to. You can
          see and withdraw every consent from your settings page. Full detail in our{" "}
          <Link href="/privacy" className="text-brass-ink underline underline-offset-2">
            privacy policy
          </Link>
          .
        </p>
      </form>
    </div>
  );
}

function Consent({
  name,
  title,
  detail,
  required,
  defaultChecked,
}: {
  name: string;
  title: string;
  detail: string;
  required?: boolean;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex cursor-pointer gap-3.5 border border-line bg-surface p-4 transition-colors hover:border-brass/50 has-checked:border-brass has-checked:bg-brass-wash">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="mt-1 h-4 w-4 shrink-0 accent-[var(--brass)]"
      />
      <span>
        <span className="flex flex-wrap items-center gap-2 text-[15.5px] font-semibold text-ink">
          {title}
          {required && (
            <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-clay">Required</span>
          )}
        </span>
        <span className="mt-1 block text-[13.5px] leading-relaxed text-muted">{detail}</span>
      </span>
    </label>
  );
}
