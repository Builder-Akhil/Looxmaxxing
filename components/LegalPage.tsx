import { MarketingNav } from "./MarketingNav";
import { Footer } from "./Footer";
import { Callout } from "./ui";

export function LegalPage({
  title,
  updated,
  draftNotice,
  children,
}: {
  title: string;
  updated: string;
  draftNotice?: boolean;
  children: React.ReactNode;
}) {
  return (
    <>
      <MarketingNav />
      <main className="mx-auto w-full max-w-[70ch] px-6 py-16">
        <p className="eyebrow">Last updated {updated}</p>
        <h1 className="mt-3 font-display text-[clamp(30px,5vw,46px)] font-bold leading-[1.05] tracking-[-0.015em]">
          {title}
        </h1>
        {draftNotice && (
          <Callout tone="clay" title="Draft — not yet reviewed by a solicitor" className="mt-7">
            This is a working draft written alongside the product so the behaviour
            and the policy match. Have it reviewed before you take real users.
          </Callout>
        )}
        <div className="legal mt-10 flex flex-col gap-7">{children}</div>
      </main>
      <Footer />
    </>
  );
}

export function Clause({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-[22px] font-bold leading-tight tracking-[-0.01em]">{heading}</h2>
      <div className="mt-2.5 flex flex-col gap-3 text-[15.5px] leading-relaxed text-ink-2">{children}</div>
    </section>
  );
}
