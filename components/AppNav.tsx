"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { Logo } from "./Logo";
import { signOut } from "@/lib/actions/auth";

const LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/history", label: "History" },
  { href: "/routine", label: "Routine" },
  { href: "/billing", label: "Plan" },
  { href: "/settings", label: "Settings" },
];

export function AppNav({ email, isAdmin }: { email: string; isAdmin: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const links = isAdmin ? [...LINKS, { href: "/admin", label: "Admin" }] : LINKS;

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-6">
        <div className="flex items-center gap-8">
          <Logo size="sm" href="/dashboard" />
          <nav className="hidden items-center gap-6 md:flex">
            {links.map((l) => {
              const active = pathname === l.href || pathname.startsWith(l.href + "/");
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={clsx(
                    "relative py-5 text-[14.5px] transition-colors",
                    active ? "text-ink" : "text-muted hover:text-brass-ink",
                  )}
                >
                  {l.label}
                  {active && <span className="absolute inset-x-0 bottom-0 h-[2px] bg-brass" />}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden font-mono text-[11.5px] text-faint lg:inline">{email}</span>
          <form action={signOut} className="hidden md:block">
            <button
              type="submit"
              className="flex items-center gap-1.5 px-2 py-1 text-[13.5px] text-muted transition-colors hover:text-clay"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </form>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-line bg-surface px-6 py-3 md:hidden">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block border-b border-line-soft py-3 text-[15px] text-ink-2 last:border-0"
            >
              {l.label}
            </Link>
          ))}
          <form action={signOut} className="pt-3">
            <button type="submit" className="flex items-center gap-2 py-1 text-[15px] text-clay">
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </form>
        </nav>
      )}
    </header>
  );
}
