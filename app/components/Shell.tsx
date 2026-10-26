"use client";
import { CpuChipIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { ThemeToggle } from "./ThemeToggle";

const NAV = [
  { href: "/", label: "Dashboard", active: (p: string) => p === "/" },
  { href: "/history", label: "History", active: (p: string) => p.startsWith("/history") },
  { href: "/guide", label: "Guide", active: (p: string) => p === "/guide" },
];

function Nav() {
  const path = usePathname();
  return (
    <nav className="mx-auto flex max-w-7xl 2xl:max-w-[96rem] gap-5 overflow-x-auto sm:gap-6 px-4 md:px-8" aria-label="Main">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              aria-current={n.active(path) ? "page" : undefined}
              className={`-mb-px whitespace-nowrap border-b-2 py-3 text-sm md:py-2.5 font-medium transition-colors ${n.active(path) ? "border-[var(--accent)] text-[var(--fg)]" : "border-transparent text-[var(--muted)] hover:text-[var(--fg)]"}`}
            >
              {n.label}
            </Link>
          ))}
    </nav>
  );
}

export function Shell({ right, children }: { right?: ReactNode; children: ReactNode }) {
  return (
    <div className="flex min-h-[100dvh] flex-col">
      <header className="sticky top-0 z-20 border-b border-[var(--line)] bg-[var(--card)]/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl 2xl:max-w-[96rem] items-center justify-between gap-4 px-4 md:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[var(--accent)] text-[var(--bg)]">
              <CpuChipIcon className="size-5" />
            </span>
            <p className="truncate font-[family-name:var(--font-display)] text-sm font-semibold sm:text-base">Environment Monitoring using ESP8266 and MQTT</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {right}
            <ThemeToggle />
          </div>
        </div>
        <Suspense fallback={<div className="h-10" />}>
          <Nav />
        </Suspense>
      </header>
      <main className="mx-auto w-full max-w-7xl 2xl:max-w-[96rem] flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
      <footer className="border-t border-[var(--line)]">
        <div className="mx-auto max-w-7xl 2xl:max-w-[96rem] px-4 py-6 text-sm text-[var(--muted)] md:px-8">
          <p>Made by Ashutosh Swamy, Kaustubh Chitgopkar and Sairaj Dhuri</p>
          <p className="mt-1 text-xs">ECE AIML, Div A, G2</p>
        </div>
      </footer>
    </div>
  );
}
