import { Logo } from "@/components/Logo";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-line">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center px-6">
          <Logo />
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-[420px]">{children}</div>
      </main>
      <footer className="border-t border-line px-6 py-5">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap gap-x-6 gap-y-1 font-mono text-[11px] uppercase tracking-[0.09em] text-faint">
          <Link href="/privacy" className="hover:text-brass-ink">Privacy</Link>
          <Link href="/terms" className="hover:text-brass-ink">Terms</Link>
          <span>Your photo is never public</span>
        </div>
      </footer>
    </div>
  );
}
