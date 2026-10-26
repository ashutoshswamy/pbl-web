import Link from "next/link";
import type { ReactNode } from "react";
import { PAGE_SIZE, RANGES, type Range } from "../lib/queries";
import { v } from "../lib/format";
import type { Row } from "../lib/useHistory";
import { Time } from "./Time";
import { LevelChip } from "./Chip";
import type { LevelKey } from "../lib/levels";

export const METRICS = {
  temperature: { label: "Temperature", unit: "°C", d: 1, pick: (r: Row) => r.temperature },
  humidity: { label: "Humidity", unit: "%", d: 0, pick: (r: Row) => r.humidity },
  light: { label: "Light", unit: "", d: 0, pick: (r: Row) => r.ldr },
} as const;
export type MetricKey = keyof typeof METRICS | "buzzer";
export const TABS: { key: "all" | MetricKey; label: string; href: string }[] = [
  { key: "all", label: "All parameters", href: "/history" },
  { key: "temperature", label: "Temperature", href: "/history/temperature" },
  { key: "humidity", label: "Humidity", href: "/history/humidity" },
  { key: "light", label: "Light", href: "/history/light" },
  { key: "buzzer", label: "Buzzer", href: "/history/buzzer" },
];
const RANGE_LABEL: Record<Range, string> = { "1h": "Last hour", "24h": "24 hours", "7d": "7 days", "30d": "30 days", all: "All time" };

const pill = (on: boolean) =>
  `rounded-full px-3.5 py-2 text-sm font-medium transition-colors md:px-3 md:py-1.5 ${on ? "bg-[var(--accent)] text-[var(--bg)]" : "text-[var(--muted)] hover:bg-[var(--line)] hover:text-[var(--fg)]"}`;

export function Controls({ active, range, base }: { active: "all" | MetricKey; range: Range; base: string }) {
  return (
    <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <nav className="-mx-1 flex gap-1 overflow-x-auto px-1" aria-label="Parameter">
        {TABS.map((t) => (
          <Link key={t.key} href={`${t.href}?range=${range}`} className={`${pill(t.key === active)} whitespace-nowrap`} aria-current={t.key === active ? "page" : undefined}>
            {t.label}
          </Link>
        ))}
      </nav>
      <nav className="flex max-w-full gap-1 self-start overflow-x-auto rounded-full border border-[var(--line)] bg-[var(--card)] p-1" aria-label="Time range">
        {(Object.keys(RANGES) as Range[]).map((r) => (
          <Link key={r} href={`${base}?range=${r}`} className={`${pill(r === range)} whitespace-nowrap`} aria-current={r === range ? "true" : undefined}>
            {RANGE_LABEL[r]}
          </Link>
        ))}
      </nav>
    </div>
  );
}

export function Card({ title, sub, href, children, className = "" }: { title: string; sub?: string; href?: string; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-xl border border-[var(--line)] bg-[var(--card)] p-4 sm:p-5 ${className}`}>
      <header className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold">{title}</h2>
          {sub && <p className="mt-0.5 text-sm leading-relaxed text-[var(--muted)]">{sub}</p>}
        </div>
        {href && (
          <Link href={href} className="shrink-0 text-sm font-medium text-[var(--accent)] hover:underline">
            Details
          </Link>
        )}
      </header>
      {children}
    </section>
  );
}

export function Stats({ items }: { items: [string, string][] }) {
  return (
    <dl className="mb-4 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
      {items.map(([k, val]) => (
        <div key={k} className="rounded-xl border border-[var(--line)] bg-[var(--card)] p-4 sm:p-5">
          <dt className="text-sm font-medium text-[var(--muted)]">{k}</dt>
          <dd className="num mt-3 text-2xl font-medium leading-none sm:text-3xl">{val}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Pager({ base, range, p, total }: { base: string; range: Range; p: number; total: number }) {
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const link = (n: number) => `${base}?range=${range}&page=${n}`;
  const btn = "rounded-lg border border-[var(--line)] px-4 py-2 text-sm font-medium md:px-3 md:py-1.5";
  return (
    <div className="mt-4 flex flex-col gap-3 text-sm text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between">
      <p className="num tracking-normal">
        Page {p} of {pages}, {total} readings
      </p>
      <div className="flex gap-2">
        {p > 1 ? <Link href={link(p - 1)} className={`${btn} text-[var(--fg)] hover:bg-[var(--line)]`}>Previous</Link> : <span className={`${btn} opacity-40`}>Previous</span>}
        {p < pages ? <Link href={link(p + 1)} className={`${btn} text-[var(--fg)] hover:bg-[var(--line)]`}>Next</Link> : <span className={`${btn} opacity-40`}>Next</span>}
      </div>
    </div>
  );
}

const lv = (k: LevelKey, x: number | null, d: number) => (
  <span className="inline-flex items-center gap-2">
    {v(x, d)}
    {x !== null && <LevelChip k={k} x={x} />}
  </span>
);
const buzz = (b: boolean | null) => (b === null ? "--" : b ? "On" : "Off");

function Table({ head, rows, empty, wide }: { head: string[]; rows: ReactNode[][]; empty: string; wide?: boolean }) {
  if (!rows.length) return <p className="rounded-lg border border-dashed border-[var(--line)] p-6 text-sm text-[var(--muted)]">{empty}</p>;
  return (
    <div className="overflow-x-auto">
      <table className={`w-full text-left text-sm ${wide ? "min-w-[720px]" : ""}`}>
        <thead className="text-xs text-[var(--muted)]">
          <tr>{head.map((h) => <th key={h} className="pb-3 pr-4 font-medium">{h}</th>)}</tr>
        </thead>
        <tbody className="num tracking-normal">
          {rows.map((cells, i) => (
            <tr key={i} className="border-t border-[var(--line)]">
              {cells.map((c, j) => <td key={j} className={`py-2.5 pr-4`}>{c}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const EMPTY = "No readings in this range. Try a longer range, or keep the dashboard open so readings are saved.";

export const AllTable = ({ rows }: { rows: Row[] }) => (
  <Table
    head={["Time", "Temp (°C)", "Humidity (%)", "Light", "Buzzer"]}
    empty={EMPTY}
    wide
    rows={rows.map((r) => [<Time key="t" iso={r.recorded_at} />, lv("temperature", r.temperature, 1), lv("humidity", r.humidity, 0), lv("light", r.ldr, 0), buzz(r.buzzer)])}
  />
);

export const MetricTable = ({ rows, metric }: { rows: Row[]; metric: MetricKey }) => {
  const m = metric === "buzzer" ? null : METRICS[metric];
  return (
    <Table
      head={["Time", m ? `${m.label}${m.unit ? ` (${m.unit})` : ""}` : "Buzzer"]}
      empty={EMPTY}
      rows={rows.map((r) => [<Time key="t" iso={r.recorded_at} />, m ? lv(metric as LevelKey, m.pick(r), m.d) : buzz(r.buzzer)])}
    />
  );
};
