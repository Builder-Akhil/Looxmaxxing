import { NextResponse } from "next/server";

export function fail(status: number, code: string, message: string, extra?: Record<string, unknown>) {
  return NextResponse.json({ ok: false, code, message, ...extra }, { status });
}

export function ok<T extends Record<string, unknown>>(data: T) {
  return NextResponse.json({ ok: true, ...data });
}

/** Turns an entitlement refusal into words a person can act on. */
export function gateMessage(reason: string, feature: string): string {
  switch (reason) {
    case "limit_reached":
      return `You've used all your ${feature} for this month. Upgrade your plan or wait for the reset on the 1st.`;
    case "ai_paused":
      return "Styling is paused for maintenance right now. Try again shortly.";
    case "daily_ceiling":
      return "We've hit today's safety limit on AI spend. This resets at midnight — sorry about that.";
    case "not_authenticated":
      return "Please log in again.";
    default:
      return "We couldn't start that just now. Try again in a moment.";
  }
}
