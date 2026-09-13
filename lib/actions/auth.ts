"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { checkPassword } from "@/lib/password";

export type AuthState = { error?: string; notice?: string };

const credentials = z.object({
  email: z.string().email("That does not look like an email address."),
  password: z.string().min(1, "Enter your password."),
});

async function siteUrl(): Promise<string> {
  const env = process.env.NEXT_PUBLIC_SITE_URL;
  if (env) return env.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export async function signUp(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = credentials.safeParse({
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    password: String(formData.get("password") ?? ""),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }
  const { email, password } = parsed.data;
  const fullName = String(formData.get("full_name") ?? "").trim();
  const market = String(formData.get("market") ?? "IN") === "UK" ? "UK" : "IN";

  const strength = await checkPassword(password, email);
  if (!strength.ok) return { error: strength.reason };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${await siteUrl()}/auth/confirm`,
      data: { full_name: fullName || null, market },
    },
  });

  if (error) {
    return { error: friendly(error.message) };
  }

  // Supabase returns a user with no identities when the address is already taken.
  if (data.user && data.user.identities?.length === 0) {
    return { error: "An account with that email already exists. Try logging in instead." };
  }

  if (data.session) redirect("/start/quiz");
  redirect(`/verify-email?email=${encodeURIComponent(email)}`);
}

export async function logIn(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = credentials.safeParse({
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    password: String(formData.get("password") ?? ""),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const next = String(formData.get("next") ?? "") || "/dashboard";
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) return { error: friendly(error.message) };
  redirect(next.startsWith("/") ? next : "/dashboard");
}

export async function requestPasswordReset(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!z.string().email().safeParse(email).success) {
    return { error: "That does not look like an email address." };
  }

  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${await siteUrl()}/auth/confirm?next=/reset-password`,
  });

  // Always the same answer, so this cannot be used to discover who has an account.
  return {
    notice: "If that address has an account, a reset link is on its way. Check your spam folder too.",
  };
}

export async function updatePassword(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const password = String(formData.get("password") ?? "");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "That reset link has expired. Request a new one." };

  const strength = await checkPassword(password, user.email ?? "");
  if (!strength.ok) return { error: strength.reason };

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: friendly(error.message) };

  await supabase.rpc("log_audit", { p_action: "password_changed", p_detail: {} });
  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function resendVerification(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const supabase = await createClient();
  await supabase.auth.resend({
    type: "signup",
    email,
    options: { emailRedirectTo: `${await siteUrl()}/auth/confirm` },
  });
  return { notice: "Sent again. It can take a minute to arrive." };
}

function friendly(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) {
    return "That email and password don't match. Check both, or reset your password.";
  }
  if (m.includes("email not confirmed")) {
    return "Please confirm your email first — check your inbox for the link.";
  }
  if (m.includes("already registered") || m.includes("already been registered")) {
    return "An account with that email already exists. Try logging in instead.";
  }
  if (m.includes("rate limit") || m.includes("too many")) {
    return "Too many attempts. Wait a minute and try again.";
  }
  if (m.includes("password")) return message;
  return "Something went wrong on our side. Try again in a moment.";
}
