import { Logo } from "@/components/Logo";

export default function StartLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-line">
        <div className="mx-auto flex h-16 w-full max-w-3xl items-center justify-between px-6">
          <Logo size="sm" />
          <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-faint">
            Setting up
          </span>
        </div>
      </header>
      <main className="flex-1 px-6 py-10">{children}</main>
    </div>
  );
}
