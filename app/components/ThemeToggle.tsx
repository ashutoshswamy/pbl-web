"use client";
import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [dark, setDark] = useState<boolean | null>(null);

  useEffect(() => {
    const t = document.documentElement.dataset.theme;
    setDark(t ? t === "dark" : matchMedia("(prefers-color-scheme: dark)").matches);
  }, []);

  const flip = () => {
    const next = dark ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("theme", next); } catch {}
    setDark(!dark);
  };

  return (
    <button
      onClick={flip}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      className="grid size-10 place-items-center md:size-9 rounded-full border border-[var(--line)] text-[var(--muted)] transition-colors hover:text-[var(--fg)] active:scale-95 focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
    >
      {dark === null ? null : dark ? <SunIcon className="size-[18px]" /> : <MoonIcon className="size-[18px]" />}
    </button>
  );
}
