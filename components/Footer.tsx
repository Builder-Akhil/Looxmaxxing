import Link from "next/link";
import { Logo } from "./Logo";
import { brand } from "@/lib/brand";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-line bg-surface-2/40">
      <div className="mx-auto w-full max-w-6xl px-6 py-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-[34ch]">
            <Logo size="sm" />
            <p className="mt-3 text-[14px] leading-relaxed text-muted">{brand.tagline}</p>
          </div>

          <nav className="grid grid-cols-2 gap-x-12 gap-y-2 text-[14px] sm:grid-cols-3">
            <FooterLink href="/how-it-works">How it works</FooterLink>
            <FooterLink href="/pricing">Pricing</FooterLink>
            <FooterLink href="/signup">Get started</FooterLink>
            <FooterLink href="/privacy">Privacy</FooterLink>
            <FooterLink href="/terms">Terms</FooterLink>
            <FooterLink href={`mailto:${brand.supportEmail}`}>Contact</FooterLink>
          </nav>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-line pt-6 font-mono text-[11.5px] uppercase tracking-[0.09em] text-faint sm:flex-row sm:items-center sm:justify-between">
          <span>
            © {new Date().getFullYear()} {brand.name}
          </span>
          <span>Styling guidance, not medical advice · India &amp; UK</span>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-ink-2 transition-colors hover:text-brass-ink">
      {children}
    </Link>
  );
}
