"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Home", short: "Home", icon: "⌂" },
  { href: "/intake", label: "Sell something", short: "Sell", icon: "📷" },
  { href: "/dashboard", label: "Operations", short: "Ops", icon: "▦" },
  { href: "/market", label: "Buyer sandbox", short: "Market", icon: "🛒" },
];

function isActive(href: string, path: string) {
  return href === "/" ? path === "/" : path.startsWith(href);
}

export function Nav() {
  const path = usePathname();
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-ink/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-2 px-3 py-3 sm:px-4">
        <Link href="/" className="group flex shrink-0 items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-cash text-ink font-black">
            €
          </span>
          <span className="font-black tracking-tight text-white">
            Cash<span className="text-cash">From</span>Chaos
          </span>
        </Link>
        {/* Desktop: inline links. On mobile these live in the bottom nav. */}
        <nav className="hidden items-center gap-1 sm:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm transition ${
                isActive(l.href, path)
                  ? "bg-white/10 text-cash"
                  : "text-white/65 hover:bg-white/10 hover:text-white"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

/** Fixed bottom tab bar shown only on phones — makes the demo feel native. */
export function BottomNav() {
  const path = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-ink/95 backdrop-blur sm:hidden">
      <div className="mx-auto flex max-w-6xl items-stretch justify-around">
        {LINKS.map((l) => {
          const active = isActive(l.href, path);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-semibold transition ${
                active ? "text-cash" : "text-white/55"
              }`}
            >
              <span className="text-lg leading-none">{l.icon}</span>
              {l.short}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
