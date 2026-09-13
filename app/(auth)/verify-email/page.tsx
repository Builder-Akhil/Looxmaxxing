import type { Metadata } from "next";
import Link from "next/link";
import { SimpleEmailForm } from "@/components/AuthForm";
import { resendVerification } from "@/lib/actions/auth";

export const metadata: Metadata = { title: "Confirm your email" };

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;
  return (
    <div>
      <h1 className="font-display text-[32px] font-bold leading-tight tracking-[-0.015em]">
        Check your inbox
      </h1>
      <p className="mt-2 text-[15px] leading-relaxed text-muted">
        We sent a confirmation link{email ? ` to ${email}` : ""}. Click it and
        you&rsquo;re in. We ask for this before running anything on your photo —
        it keeps junk accounts from burning through the AI budget.
      </p>
      <div className="mt-8 border-t border-line pt-7">
        <p className="mb-4 text-[14px] text-ink-2">Didn&rsquo;t arrive? Send it again.</p>
        <SimpleEmailForm
          action={resendVerification}
          label="Resend the link"
          pendingLabel="Sending…"
          defaultEmail={email}
        />
      </div>
      <p className="mt-6 text-[14px] text-muted">
        <Link href="/login" className="text-brass-ink underline underline-offset-4">
          Back to log in
        </Link>
      </p>
    </div>
  );
}
