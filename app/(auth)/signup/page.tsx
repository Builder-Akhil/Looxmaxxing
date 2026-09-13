import Link from "next/link";
import type { Metadata } from "next";
import { SignupForm } from "@/components/AuthForm";
import { signUp } from "@/lib/actions/auth";

export const metadata: Metadata = { title: "Create your account" };

export default function SignupPage() {
  return (
    <div>
      <h1 className="font-display text-[32px] font-bold leading-tight tracking-[-0.015em]">
        Find out what suits you
      </h1>
      <p className="mt-2 mb-7 text-[15px] text-muted">
        Two full readings a month, free. No card, no trial countdown.
      </p>
      <SignupForm action={signUp} />
      <p className="mt-6 text-[14px] text-muted">
        Already have an account?{" "}
        <Link href="/login" className="text-brass-ink underline underline-offset-4">
          Log in
        </Link>
      </p>
    </div>
  );
}
