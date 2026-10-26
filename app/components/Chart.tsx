"use client";
import { useEffect, useState } from "react";

export type Point = { t: number; v: number };
const W = 600;
const H = 200;
const clock = (t: number) => new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
const stamp = (t: number) => new Date(t).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

export function Chart({ data, unit, decimals = 1, binary = false }: { data: Point[]; unit: string; decimals?: number; binary?: boolean }) {
  const [hover, setHover] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false); // local-time labels only after mount, so SSR and client agree
  useEffect(() => setMounted(true), []);
  const n = data.length;
  const long = n > 1 && data[n - 1].t - data[0].t > 20 * 3_600_000;
  const time = (t: number) => (!mounted ? "" : long ? stamp(t) : clock(t));

  if (n < 2) {
    return (
      <div className="flex h-56 items-center justify-center rounded-lg border border-dashed border-[var(--line)] text-sm text-[var(--muted)]">
        Waiting for readings. The chart fills as data arrives.
      </div>
    );
  }

  const vals = data.map((d) => d.v);
  const pad = (Math.max(...vals) - Math.min(...vals)) * 0.2 || 1;
  const lo = binary ? -0.1 : Math.min(...vals) - pad;
  const hi = binary ? 1.1 : Math.max(...vals) + pad;
  const show = (x: number) => (binary ? (x > 0.5 ? "On" : "Off") : `${x.toFixed(decimals)}${unit ? ` ${unit}` : ""}`);
  const px = (i: number) => i / (n - 1);
  const py = (v: number) => 1 - (v - lo) / (hi - lo);
  const line = data.map((d, i) => `${px(i) * W},${py(d.v) * H}`).join(" ");
  const ticks = binary ? [(hi - 1) / (hi - lo), (hi - 0) / (hi - lo)] : [0, 1 / 3, 2 / 3, 1];
  const at = hover ?? n - 1;

  return (
    <div>
      <div
        className="relative ml-12 h-56 touch-pan-y"
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setHover(Math.round(Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * (n - 1)));
        }}
        onPointerLeave={() => setHover(null)}
      >
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
          {ticks.map((f) => (
            <line key={f} x1="0" x2={W} y1={f * H} y2={f * H} stroke="var(--line)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          ))}
          <polygon points={`0,${H} ${line} ${W},${H}`} fill="var(--accent)" opacity="0.08" />
          <polyline points={line} fill="none" stroke="var(--accent)" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
        </svg>

        {ticks.map((f) => (
          <span key={f} className="absolute right-full mr-3 -translate-y-1/2 num text-xs tracking-normal text-[var(--muted)]" style={{ top: `${f * 100}%` }}>
            {binary ? show(hi - f * (hi - lo)) : (hi - f * (hi - lo)).toFixed(decimals)}
          </span>
        ))}

        {hover !== null && <div className="absolute inset-y-0 w-px bg-[var(--line)]" style={{ left: `${px(at) * 100}%` }} />}
        <div
          className="absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[var(--card)] bg-[var(--accent)]"
          style={{ left: `${px(at) * 100}%`, top: `${py(data[at].v) * 100}%` }}
        />
        {hover !== null && (
          <div
            className="pointer-events-none absolute -top-2 -translate-y-full rounded-lg border border-[var(--line)] bg-[var(--card)] px-3 py-1.5 text-xs shadow-sm"
            style={{ left: `clamp(15%, ${px(at) * 100}%, 85%)`, transform: "translate(-50%, -100%)" }}
          >
            <p className="num tracking-normal font-medium">{show(data[at].v)}</p>
            <p className="num tracking-normal text-[var(--muted)]">{time(data[at].t)}</p>
          </div>
        )}
      </div>
      <div className="ml-12 mt-2 flex justify-between num text-xs tracking-normal text-[var(--muted)]">
        <span>{time(data[0].t)}</span>
        <span>{time(data[n - 1].t)}</span>
      </div>
    </div>
  );
}
