import { CUTS, DOMAIN, LDR_MAX, type LevelKey } from "../lib/levels";

const UNIT: Record<LevelKey, string> = { temperature: "°C", humidity: "%", light: "%" };

// Three-zone gauge (low / medium / high) with a marker at the current reading.
export function RangeBar({ k, x }: { k: LevelKey; x?: number }) {
  const [lo, hi] = CUTS[k];
  const max = DOMAIN[k];
  const at = (n: number) => `${Math.min(100, Math.max(0, (n / max) * 100))}%`;
  const val = x === undefined ? undefined : k === "light" ? (x / LDR_MAX) * 100 : x;

  return (
    <div aria-hidden="true">
      <div className="relative h-1.5 rounded-full bg-[var(--line)]">
        <span className="absolute inset-y-0 left-0 rounded-l-full bg-[var(--muted)]/30" style={{ width: at(lo) }} />
        <span className="absolute inset-y-0 bg-[var(--ok)]/35" style={{ left: at(lo), width: `calc(${at(hi)} - ${at(lo)})` }} />
        <span className="absolute inset-y-0 right-0 rounded-r-full bg-[var(--warn)]/35" style={{ left: at(hi) }} />
        {val !== undefined && (
          <span
            className="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[var(--card)] bg-[var(--fg)] shadow-sm transition-[left] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{ left: at(val) }}
          />
        )}
      </div>
      <div className="num relative mt-1.5 h-4 text-[11px] tracking-normal text-[var(--muted)]">
        <span className="absolute left-0">0</span>
        <span className="absolute -translate-x-1/2" style={{ left: at(lo) }}>{lo}</span>
        <span className="absolute -translate-x-1/2" style={{ left: at(hi) }}>{hi}</span>
        <span className="absolute right-0">{max}{UNIT[k]}</span>
      </div>
    </div>
  );
}
