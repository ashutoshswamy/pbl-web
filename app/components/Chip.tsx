import type { ReactNode } from "react";
import { level, LEVEL_LABEL, type Level, type LevelKey } from "../lib/levels";

export type Tone = "ok" | "warn" | "danger" | "muted";
export const tones: Record<Tone, string> = {
  ok: "bg-[var(--ok-soft)] text-[var(--ok)]",
  warn: "bg-[var(--warn-soft)] text-[var(--warn)]",
  danger: "bg-[var(--danger-soft)] text-[var(--danger)]",
  muted: "bg-[var(--line)] text-[var(--muted)]",
};
const LEVEL_TONE: Record<Level, Tone> = { low: "muted", medium: "ok", high: "warn" };

export const Chip = ({ tone, children }: { tone: Tone; children: ReactNode }) => (
  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium tracking-normal ${tones[tone]}`}>{children}</span>
);

export function LevelChip({ k, x }: { k: LevelKey; x?: number | null }) {
  if (x === undefined || x === null) return <Chip tone="muted">No data</Chip>;
  const l = level(k, Number(x));
  return <Chip tone={LEVEL_TONE[l]}>{LEVEL_LABEL[l]}</Chip>;
}
