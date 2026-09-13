import type { Metadata } from "next";
import { MarketingNav } from "@/components/MarketingNav";
import { Footer } from "@/components/Footer";
import { PlanGrid } from "@/components/PlanGrid";
import { getUser } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Two free readings a month. Plus from ₹199. Pro from ₹499.",
};

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{ m?: string }>;
}) {
  const user = await getUser();
  const { m } = await searchParams;
  const market = m === "UK" ? "UK" : "IN";

  return (
    <>
      <MarketingNav signedIn={Boolean(user)} />
      <main className="mx-auto w-full max-w-6xl px-6 py-16">
        <div className="max-w-[52ch]">
          <p className="eyebrow">Pricing</p>
          <h1 className="mt-3 font-display text-[clamp(32px,5vw,52px)] font-bold leading-[1.03] tracking-[-0.015em] balance">
            Reading your face is free. Drawing it isn&rsquo;t.
          </h1>
          <p className="mt-5 text-[17px] leading-relaxed text-ink-2">
            Working out what suits you costs us almost nothing, so it stays free.
            Generating an image of your face costs real money every single time —
            that&rsquo;s the only thing behind a paywall.
          </p>
        </div>

        <div className="mt-8 inline-flex border border-line">
          {(["IN", "UK"] as const).map((code) => (
            <a
              key={code}
              href={`/pricing?m=${code}`}
              className={`px-4 py-2 text-[14px] transition-colors ${
                market === code ? "bg-ink text-paper" : "text-muted hover:text-brass-ink"
              }`}
            >
              {code === "IN" ? "India ₹" : "UK £"}
            </a>
          ))}
        </div>

        <div className="mt-10">
          <PlanGrid market={market} />
        </div>

        <section className="mt-20 max-w-[62ch]">
          <h2 className="font-display text-[28px] font-bold tracking-[-0.01em]">Questions people actually ask</h2>
          <dl className="mt-7 divide-y divide-line border-y border-line">
            {[
              [
                "What counts as a styling session?",
                "One run: reading your face, then a ranked set of looks with the reasoning and your colour palette. Re-running it with a new photo or a different occasion is another session.",
              ],
              [
                "Why is AI try-on limited even on Pro?",
                "Because every generated image costs us around ₹6. The caps are what let us promise the plan price never moves. Run out and you can top up with credits.",
              ],
              [
                "What if the try-on looks nothing like me?",
                "It happens — image models are inconsistent with real faces. You are never charged for a failed generation, and the credit goes straight back.",
              ],
              [
                "Do you delete my photo if I cancel?",
                "You can delete it at any point, on any plan, from settings. Cancelling doesn't delete it automatically — that stays your decision, not ours.",
              ],
              [
                "Is this medical advice?",
                "No. We style around scalp and skin conditions rather than treating them. For anything persistent, see a dermatologist or trichologist.",
              ],
            ].map(([q, a]) => (
              <div key={q} className="py-5">
                <dt className="text-[16px] font-semibold text-ink">{q}</dt>
                <dd className="mt-2 text-[15px] leading-relaxed text-ink-2">{a}</dd>
              </div>
            ))}
          </dl>
        </section>
      </main>
      <Footer />
    </>
  );
}
