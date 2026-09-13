import Link from "next/link";
import type { Metadata } from "next";
import { SimpleEmailForm } from "@/components/AuthForm";
import { requestPasswordReset } from "@/lib/actions/auth";

export const metadata: Metadata = { title: "Reset your password" };

export default function ForgotPasswordPage() {
  return (
    <div>
      <h1 className="font-display text-[32px] font-bold leading-tight tracking-[-0.015em]">
        Reset your password
      </h1>
      <p className="mt-2 mb-7 text-[15px] text-muted">
        We&rsquo;ll email you a link. It works once and expires in an hour.
      </p>
      <SimpleEmailForm action={requestPasswordReset} label="Send the link" pendingLabel="Sending…" />
      <p className="mt-6 text-[14px] text-muted">
        <Link href="/login" className="text-brass-ink underline underline-offset-4">
          Back to log in
        </Link>
      </p>
    </div>
  );
}
