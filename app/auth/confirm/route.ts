import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Where every emailed link lands: signup confirmation, password reset,
 * email change. Exchanges the one-time token for a session, then sends
 * the user somewhere useful.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  const supabase = await createClient();

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) return NextResponse.redirect(new URL(destination(type, next), origin));
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next || "/start/quiz", origin));
  }

  return NextResponse.redirect(new URL("/login?error=link_expired", origin));
}

function destination(type: EmailOtpType, next: string | null): string {
  if (next?.startsWith("/")) return next;
  if (type === "recovery") return "/reset-password";
  return "/start/quiz";
}
