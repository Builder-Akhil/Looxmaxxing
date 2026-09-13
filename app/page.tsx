import Link from "next/link";
import { MarketingNav } from "@/components/MarketingNav";
import { Footer } from "@/components/Footer";
import { Silhouette } from "@/components/Silhouette";
import { ButtonLink, Badge, Card } from "@/components/ui";
import { getUser } from "@/lib/supabase/server";
import { seasonByKey } from "@/lib/palette";
import { brand } from "@/lib/brand";

export default async function LandingPage() {
  const user = await getUser();
  const autumn = seasonByKey("warm_autumn");

  return (
    <>
      <MarketingNav signedIn={Boolean(user)} />

      {/* ---------------------------------------------------- hero */}
      <section className="border-b border-line">
        <div className="mx-auto grid w-full max-w-6xl gap-14 px-6 py-16 md:py-24 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <Badge tone="brass">Hair · Beard · Colour</Badge>
            <h1 className="mt-6 font-display text-[clamp(38px,6.4vw,68px)] font-bold leading-[0.98] tracking-[-0.018em] balance">
              Nobody can describe the haircut they want.
            </h1>
            <p className="mt-6 max-w-[46ch] text-[18px] leading-relaxed text-ink-2">
              You point at a photo. Your barber nods. You leave with something else.{" "}
              {brand.name} reads your face, learns your taste, and writes the
              instructions down — <span className="text-ink">to the guard number.</span>
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <ButtonLink href={user ? "/dashboard" : "/signup"} size="lg" variant="brass">
                {user ? "Open my dashboard" : "Find my look — free"}
              </ButtonLink>
              <Link
                href="/how-it-works"
                className="px-2 text-[15px] text-ink-2 underline decoration-line underline-offset-4 transition-colors hover:text-brass-ink"
              >
                See how it works
              </Link>
            </div>

            <p className="mt-5 font-mono text-[11.5px] uppercase tracking-[0.1em] text-faint">
              No card needed · 2 free readings a month · Delete your photo any time
            </p>
          </div>

          {/* the product, shown rather than described */}
          <div className="relative">
            <Card lift className="p-6">
              <div className="flex items-baseline justify-between border-b border-line pb-3">
                <p className="eyebrow">Your Style DNA</p>
                <span className="font-mono text-[11px] text-faint">read in 20s</span>
              </div>

              <dl className="grid grid-cols-2 gap-x-6 gap-y-3 py-4 sm:grid-cols-3">
                {[
                  ["Face", "Oval"],
                  ["Hair", "2B wavy"],
                  ["Density", "Medium"],
                  ["Undertone", "Warm"],
                  ["Contrast", "Medium"],
                  ["Season", "True Autumn"],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt className="font-mono text-[10px] uppercase tracking-[0.11em] text-faint">{k}</dt>
                    <dd className="text-[15px] font-semibold text-ink">{v}</dd>
                  </div>
                ))}
              </dl>

              <div className="grid grid-cols-3 gap-3 border-t border-line pt-4">
                {(["textured_crop", "classic_side_part", "short_boxed"] as const).map((s, i) => (
                  <div key={s} className="flex flex-col items-center gap-2">
                    <div className="w-full bg-surface-2 px-2 pt-3 text-ink">
                      <Silhouette look={s} className="h-24 w-full" />
                    </div>
                    <p className="text-center text-[11.5px] leading-tight text-muted">
                      {["Textured crop", "Side part", "Boxed beard"][i]}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap gap-1.5 border-t border-line pt-4">
                {autumn.swatches.slice(0, 8).map((sw) => (
                  <span
                    key={sw.hex}
                    className="h-6 w-6 rounded-full border border-line"
                    style={{ background: sw.hex }}
                    title={sw.name}
                  />
                ))}
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- the barber card */}
      <section className="border-b border-line bg-surface-2/40">
        <div className="mx-auto grid w-full max-w-6xl gap-12 px-6 py-16 md:py-20 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="eyebrow">The part nobody else does</p>
            <h2 className="mt-3 font-display text-[clamp(28px,4vw,42px)] font-bold leading-[1.05] tracking-[-0.012em] balance">
              A card you hand to your barber.
            </h2>
            <p className="mt-5 max-w-[44ch] text-[16.5px] leading-relaxed text-ink-2">
              Not a mood board. The actual technical instruction — guard numbers,
              millimetres, the techniques by name, and the exact sentence to say
              out loud. In English and Hindi.
            </p>
            <p className="mt-4 max-w-[44ch] text-[15px] leading-relaxed text-muted">
              This is the difference between showing a picture and being understood.
            </p>
          </div>

          <Card lift className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-line bg-ink px-5 py-3">
              <span className="font-display text-[17px] font-bold text-paper">Textured French crop</span>
              <span className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-paper/60">Barber card</span>
            </div>
            <dl className="divide-y divide-line-soft">
              {[
                ["Sides", "#2 guard (6 mm), blended upward, no visible line"],
                ["Top", "Scissor only, 4–5 cm. Point cut, not blunt"],
                ["Back", "#1.5 (4.5 mm), following the head shape"],
                ["Neckline", "Tapered, natural"],
                ["Avoid", "No thinning scissors. Fine hair needs the weight"],
              ].map(([k, v]) => (
                <div key={k} className="grid grid-cols-[88px_1fr] gap-4 px-5 py-3">
                  <dt className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-faint">{k}</dt>
                  <dd className="text-[14.5px] leading-snug text-ink-2">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="border-t border-line bg-brass-wash px-5 py-4">
              <p className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-brass-ink">Say this</p>
              <p className="mt-1.5 text-[14.5px] leading-snug text-ink">
                &ldquo;Textured French crop, please. Number two on the sides, four
                centimetres on top, tapered at the neck. Texture it, don&rsquo;t thin it.&rdquo;
              </p>
              <p className="mt-2 text-[14.5px] leading-snug text-ink-2">
                &ldquo;टेक्सचर्ड फ्रेंच क्रॉप चाहिए। साइड्स पर नंबर दो, ऊपर चार सेंटीमीटर,
                गर्दन पर टेपर। थिनिंग मत करना।&rdquo;
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* ---------------------------------------------------- how it works */}
      <section className="border-b border-line">
        <div className="mx-auto w-full max-w-6xl px-6 py-16 md:py-20">
          <p className="eyebrow">Four steps, about three minutes</p>
          <h2 className="mt-3 max-w-[20ch] font-display text-[clamp(28px,4vw,42px)] font-bold leading-[1.05] tracking-[-0.012em] balance">
            A camera can&rsquo;t tell us everything. So we ask.
          </h2>

          <ol className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                n: "01",
                t: "Nine questions",
                d: "How long you actually spend in the morning. What you'd never do. What your hair does that annoys you. The things a photo can't show.",
              },
              {
                n: "02",
                t: "One photo",
                d: "You decide whether we keep it. Delete it any time, and everything built from it goes too.",
              },
              {
                n: "03",
                t: "Your Style DNA",
                d: "Face shape, hair type on the 1A–4C scale, density, undertone, contrast. Words for things you've never had words for.",
              },
              {
                n: "04",
                t: "Looks that survive contact",
                d: "Each one costed, timed, and matched to how often you'll realistically sit in the chair. No fades for twice-a-year people.",
              },
            ].map((s) => (
              <li key={s.n}>
                <p className="font-mono text-[12px] font-semibold tracking-[0.08em] text-brass">{s.n}</p>
                <h3 className="mt-2 text-[17.5px] font-bold tracking-[-0.01em]">{s.t}</h3>
                <p className="mt-2 text-[14.5px] leading-relaxed text-muted">{s.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------------------------------------------------- privacy */}
      <section className="border-b border-line bg-surface-2/40">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-16 md:grid-cols-[1fr_1fr] md:items-center">
          <div>
            <p className="eyebrow">On your photo</p>
            <h2 className="mt-3 font-display text-[clamp(24px,3.2vw,34px)] font-bold leading-[1.08] tracking-[-0.012em] balance">
              Your face is not our business model.
            </h2>
          </div>
          <ul className="space-y-3 text-[15px] leading-relaxed text-ink-2">
            {[
              "We ask before the camera opens, in plain English — not buried in terms.",
              "Your photo is stored privately. No other user, and no search engine, can reach it.",
              "One button deletes it, and everything we built from it, permanently.",
              "We never sell it, train on it, or show it to anyone.",
            ].map((l) => (
              <li key={l} className="flex gap-3">
                <span className="mt-2 h-px w-4 shrink-0 bg-brass" />
                {l}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------------------------------------------------- cta */}
      <section>
        <div className="mx-auto w-full max-w-6xl px-6 py-20 text-center">
          <h2 className="mx-auto max-w-[18ch] font-display text-[clamp(30px,5vw,52px)] font-bold leading-[1.02] tracking-[-0.015em] balance">
            Stop pointing at photos.
          </h2>
          <p className="mx-auto mt-5 max-w-[44ch] text-[16.5px] leading-relaxed text-ink-2">
            Two full readings a month, free, no card. If it tells you something you
            didn&rsquo;t know about your own face, it worked.
          </p>
          <div className="mt-8 flex justify-center">
            <ButtonLink href={user ? "/dashboard" : "/signup"} size="lg" variant="brass">
              {user ? "Open my dashboard" : "Find my look"}
            </ButtonLink>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
