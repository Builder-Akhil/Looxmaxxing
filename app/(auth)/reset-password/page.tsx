import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { NewPasswordForm } from "@/components/AuthForm";
import { updatePassword } from "@/lib/actions/auth";
import { getUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Choose a new password" };

export default async function ResetPasswordPage() {
  const user = await getUser();
  if (!user) redirect("/forgot-password");

  return (
    <div>
      <h1 className="font-display text-[32px] font-bold leading-tight tracking-[-0.015em]">
        Choose a new password
      </h1>
      <p className="mt-2 mb-7 text-[15px] text-muted">
        Signed in as {user.email}. This replaces your old password everywhere.
      </p>
      <NewPasswordForm action={updatePassword} />
    </div>
  );
}
