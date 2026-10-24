import Link from "next/link";
import { Logo } from "./Logo";
import { ButtonLink } from "./ui";

export function MarketingNav({ signedIn = false }: { signedIn?: boolean }) {
  return (
    <header className="sticky top-0 z-40 border-b border-t-[3px] border-line border-t-brass bg-paper/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-6 px-6">
        <Logo />
        <nav className="hidden items-center gap-7 text-[14.5px] text-ink-2 sm:flex">
          <Link href="/how-it-works" className="transition-colors hover:text-brass-ink">
            How it works
          </Link>
          <Link href="/pricing" className="transition-colors hover:text-brass-ink">
            Pricing
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          {signedIn ? (
            <ButtonLink href="/dashboard" size="sm">
              Dashboard
            </ButtonLink>
          ) : (
            <>
              <Link
                href="/login"
                className="px-2 text-[14.5px] text-ink-2 transition-colors hover:text-brass-ink"
              >
                Log in
              </Link>
              <ButtonLink href="/signup" size="sm">
                Find my look
              </ButtonLink>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
