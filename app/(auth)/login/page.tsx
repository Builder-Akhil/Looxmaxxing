import Link from "next/link";
import type { Metadata } from "next";
import { LoginForm } from "@/components/AuthForm";
import { logIn } from "@/lib/actions/auth";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return (
    <div>
      <h1 className="font-display text-[32px] font-bold leading-tight tracking-[-0.015em]">Welcome back</h1>
      <p className="mt-2 mb-7 text-[15px] text-muted">Your Style DNA is where you left it.</p>
      <LoginForm action={logIn} next={next} />
      <div className="mt-6 flex flex-col gap-2 text-[14px] text-muted">
        <Link href="/forgot-password" className="text-brass-ink underline underline-offset-4">
          Forgot your password?
        </Link>
        <p>
          No account yet?{" "}
          <Link href="/signup" className="text-brass-ink underline underline-offset-4">
            Create one free
          </Link>
        </p>
      </div>
    </div>
  );
}
