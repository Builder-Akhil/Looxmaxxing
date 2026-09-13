import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PhotoUploader } from "@/components/PhotoUploader";
import { getUser } from "@/lib/supabase/server";
import { hasBiometricConsent } from "@/lib/actions/onboarding";

export const metadata: Metadata = { title: "Your photo" };

export default async function PhotoPage() {
  const user = await getUser();
  if (!user) redirect("/login?next=/start/photo");

  const consented = await hasBiometricConsent();
  if (!consented) redirect("/start/consent");

  return (
    <div className="mx-auto w-full max-w-4xl">
      <p className="eyebrow">Step 3 of 3</p>
      <h1 className="mt-3 font-display text-[clamp(28px,4.4vw,38px)] font-bold leading-[1.08] tracking-[-0.015em] balance">
        One photo, straight on
      </h1>
      <p className="mt-4 max-w-[54ch] text-[16px] leading-relaxed text-ink-2">
        This is the part that makes the reading yours rather than generic. Twenty
        seconds and it&rsquo;s done.
      </p>
      <div className="mt-9">
        <PhotoUploader userId={user.id} />
      </div>
    </div>
  );
}
