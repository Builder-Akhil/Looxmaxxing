import { createHash } from "node:crypto";

export type PasswordCheck = { ok: true } | { ok: false; reason: string };

/**
 * Screens a password against Have I Been Pwned using k-anonymity:
 * only the first five characters of the SHA-1 hash ever leave this server,
 * so the password itself is never transmitted.
 * Network failures never block a signup — availability beats this check.
 */
export async function checkPassword(password: string, email: string): Promise<PasswordCheck> {
  if (password.length < 10) {
    return { ok: false, reason: "Use at least 10 characters. Length beats complexity." };
  }
  if (password.length > 200) {
    return { ok: false, reason: "That is longer than we can store safely. Keep it under 200 characters." };
  }
  const local = email.split("@")[0]?.toLowerCase();
  if (local && local.length > 3 && password.toLowerCase().includes(local)) {
    return { ok: false, reason: "Your password contains your email address. Pick something unrelated." };
  }

  try {
    const hash = createHash("sha1").update(password).digest("hex").toUpperCase();
    const prefix = hash.slice(0, 5);
    const suffix = hash.slice(5);

    const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: { "Add-Padding": "true" },
      signal: AbortSignal.timeout(2500),
    });
    if (!res.ok) return { ok: true };

    const body = await res.text();
    for (const line of body.split("\n")) {
      const [suf, countRaw] = line.trim().split(":");
      if (suf === suffix && Number(countRaw) > 0) {
        return {
          ok: false,
          reason:
            "This password has appeared in a known data breach. It is not secret any more — please choose another.",
        };
      }
    }
    return { ok: true };
  } catch {
    // Breach list unreachable. Length and content checks already passed.
    return { ok: true };
  }
}
