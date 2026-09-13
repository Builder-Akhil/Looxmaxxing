import type { Metadata } from "next";
import { MarketingNav } from "@/components/MarketingNav";
import { Footer } from "@/components/Footer";
import { Silhouette } from "@/components/Silhouette";
import { ButtonLink, Card, Callout } from "@/components/ui";
import { getUser } from "@/lib/supabase/server";
import { SEASONS } from "@/lib/palette";

export const metadata: Metadata = {
  title: "How it works",
  description: "Nine questions, one photo, and a card your barber can actually follow.",
};

export default async function HowItWorksPage() {
  const user = await getUser();
  const showcase = ["textured_crop", "mid_fade_pompadour", "curtain_fringe", "curly_top_taper", "blunt_bob", "short_boxed"] as const;

  return (
    <>
      <MarketingNav signedIn={Boolean(user)} />
      <main className="mx-auto w-full max-w-6xl px-6 py-16">
        <div className="max-w-[54ch]">
          <p className="eyebrow">How it works</p>
          <h1 className="mt-3 font-display text-[clamp(32px,5vw,54px)] font-bold leading-[1.03] tracking-[-0.015em] balance">
            Two inputs. One of them isn&rsquo;t a photo.
          </h1>
          <p className="mt-5 text-[17px] leading-relaxed text-ink-2">
            Every styling app reads a face. Almost none of them ask how long you
            actually spend in the morning, what you&rsquo;d never do, or how often
            you&rsquo;ll realistically sit in a chair. That&rsquo;s why their suggestions
            look good and last three weeks.
          </p>
        </div>

        {/* ------------------------------------------------ the two inputs */}
        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          <Card className="p-7">
            <p className="eyebrow">Input one</p>
            <h2 className="mt-2 font-display text-[26px] font-bold tracking-[-0.01em]">What the camera sees</h2>
            <ul className="mt-5 space-y-2.5 text-[15px] leading-relaxed text-ink-2">
              {[
                "Face shape — oval, square, round, heart, diamond, oblong or triangle",
                "Jawline and forehead proportion",
                "Hairline: straight, widow's peak, receding or uneven",
                "Hair type on the Andre Walker scale, 1A through 4C",
                "Density and texture",
                "Skin undertone and overall contrast level",
                "Beard coverage and brow shape",
              ].map((l) => (
                <li key={l} className="flex gap-3">
                  <span className="mt-2.5 h-px w-3.5 shrink-0 bg-brass" />
                  {l}
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-7">
            <p className="eyebrow">Input two</p>
            <h2 className="mt-2 font-display text-[26px] font-bold tracking-[-0.01em]">What it never could</h2>
            <ul className="mt-5 space-y-2.5 text-[15px] leading-relaxed text-ink-2">
              {[
                "How many minutes you'll genuinely spend, not aspirationally",
                "Whether your work is client-facing, on camera, or under a helmet",
                "How often you'll actually book — a fade needs every three weeks",
                "What you pay for a cut, because technique costs chair time",
                "What your hair does that annoys you: flat, frizzy, greasy, cowlicked",
                "Scalp or skin conditions to style around",
                "The things you will never do, whatever we suggest",
              ].map((l) => (
                <li key={l} className="flex gap-3">
                  <span className="mt-2.5 h-px w-3.5 shrink-0 bg-sage" />
                  {l}
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* ------------------------------------------------ looks */}
        <section className="mt-20">
          <div className="max-w-[54ch]">
            <p className="eyebrow">The output</p>
            <h2 className="mt-3 font-display text-[clamp(26px,3.6vw,38px)] font-bold leading-[1.06] tracking-[-0.012em] balance">
              Looks drawn, not photographed.
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-ink-2">
              A stock photo of a model with your haircut tells you nothing — it tells
              you how the cut sits on <em>them</em>. We draw the silhouette instead, and
              spend the words on why it works for your face and what it costs you
              every morning.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {showcase.map((s) => (
              <div key={s} className="flex flex-col items-center gap-2 border border-line bg-surface p-4">
                <div className="w-full text-ink">
                  <Silhouette look={s} className="h-[110px] w-full" />
                </div>
                <p className="text-center text-[12px] leading-tight text-muted">
                  {s.replace(/_/g, " ")}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ------------------------------------------------ colour */}
        <section className="mt-20">
          <div className="max-w-[54ch]">
            <p className="eyebrow">Colour</p>
            <h2 className="mt-3 font-display text-[clamp(26px,3.6vw,38px)] font-bold leading-[1.06] tracking-[-0.012em] balance">
              Twelve seasons, one of them yours.
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-ink-2">
              Your undertone, value and contrast put you in one of twelve palettes.
              You get the hex values, the names, the metals that suit you, and the
              colours that quietly wash you out.
            </p>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {SEASONS.slice(0, 8).map((s) => (
              <div key={s.key} className="border border-line bg-surface p-4">
                <p className="font-display text-[16px] font-bold">{s.name}</p>
                <div className="mt-3 flex gap-1">
                  {s.swatches.slice(0, 6).map((sw) => (
                    <span
                      key={sw.hex}
                      className="h-7 flex-1 rounded-[2px] border border-line"
                      style={{ background: sw.hex }}
                      title={sw.name}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 font-mono text-[11.5px] uppercase tracking-[0.09em] text-faint">
            8 of 12 shown
          </p>
        </section>

        {/* ------------------------------------------------ honesty */}
        <section className="mt-20 max-w-[62ch]">
          <h2 className="font-display text-[clamp(24px,3.2vw,32px)] font-bold tracking-[-0.012em]">
            What this isn&rsquo;t
          </h2>
          <div className="mt-6 flex flex-col gap-5">
            <Callout tone="clay" title="Not a guarantee">
              AI try-on generates a prediction of your face with a different cut.
              Image models are inconsistent with real faces — sometimes it&rsquo;s
              uncanny, sometimes it&rsquo;s clearly not you. We label every one as a
              preview and never charge for a failed generation.
            </Callout>
            <Callout tone="clay" title="Not medical advice">
              We style around thinning, flaking and sensitivity. We don&rsquo;t diagnose
              or treat any of them. For anything persistent, see a dermatologist or
              trichologist.
            </Callout>
            <Callout tone="sage" title="Not a data business">
              Your photo is stored privately, never sold, never trained on, and
              deletable in one click. If that changed, this would be a different
              company.
            </Callout>
          </div>
        </section>

        <div className="mt-16 flex flex-wrap gap-3 border-t border-line pt-10">
          <ButtonLink href={user ? "/dashboard" : "/signup"} variant="brass" size="lg">
            {user ? "Open my dashboard" : "Find my look — free"}
          </ButtonLink>
          <ButtonLink href="/pricing" variant="outline" size="lg">
            See pricing
          </ButtonLink>
        </div>
      </main>
      <Footer />
    </>
  );
}
