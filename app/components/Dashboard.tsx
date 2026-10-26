"use client";
import { BellAlertIcon, BellSlashIcon, CloudIcon, FireIcon, SignalIcon, SignalSlashIcon, SunIcon } from "@heroicons/react/24/outline";
import type { CSSProperties, ReactNode } from "react";
import { useLive } from "./SensorsProvider";
import { Chip, LevelChip, tones, type Tone } from "./Chip";
import { useHistory, type Row } from "../lib/useHistory";
import { v } from "../lib/format";
import Link from "next/link";
import { Chart, type Point } from "./Chart";
import { Shell } from "./Shell";
import type { LevelKey } from "../lib/levels";
import { RangeBar } from "./RangeBar";

const LDR_MAX = Number(process.env.NEXT_PUBLIC_LDR_MAX) || 4095;
const TOPIC = process.env.NEXT_PUBLIC_MQTT_TOPIC;
const BROKER = (() => {
  try { return new URL(process.env.NEXT_PUBLIC_MQTT_URL!).host; } catch { return "unknown"; }
})();
const ICON = "size-[18px]";
const fmt = (v?: number, d = 1) => (v === undefined ? "--" : v.toFixed(d));
const stamp = (t: number) => new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
const series = (h: { t: number; temperature?: number; humidity?: number; ldr?: number }[], k: "temperature" | "humidity" | "ldr"): Point[] =>
  h.flatMap((r) => (r[k] === undefined ? [] : [{ t: r.t, v: r[k] as number }]));


function Card({ i = 0, className = "", children }: { i?: number; className?: string; children: ReactNode }) {
  return (
    <section className={`rise rounded-xl border border-[var(--line)] bg-[var(--card)] p-4 sm:p-5 transition-colors hover:border-[var(--accent)]/40 ${className}`} style={{ "--i": i } as CSSProperties}>
      {children}
    </section>
  );
}

function Kpi({ i, label, icon, value, unit, chip, delta, gauge }: { i: number; label: string; icon: ReactNode; value: ReactNode; unit?: string; chip: ReactNode; delta?: string; gauge?: { k: LevelKey; x?: number } }) {
  return (
    <Card i={i} className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-sm font-medium text-[var(--muted)]">
          <span className="grid size-8 place-items-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]">{icon}</span>
          {label}
        </span>
        {chip}
      </div>
      <p className="num text-3xl font-medium leading-none sm:text-4xl md:text-[2.75rem]">
        {value}
        {unit && <span className="ml-1.5 text-base font-normal tracking-normal text-[var(--muted)]">{unit}</span>}
      </p>
      <p className="num text-xs tracking-normal text-[var(--muted)]">{delta ?? "No change data yet"}</p>
      {gauge && <RangeBar k={gauge.k} x={gauge.x} />}
    </Card>
  );
}


function History({ rows, error }: { rows: Row[] | null; error: boolean }) {
  if (error) return <p className="rounded-lg bg-[var(--danger-soft)] px-4 py-3 text-sm text-[var(--danger)]" role="alert">Could not load saved readings. Check DATABASE_URL_POOLED in .env.local.</p>;
  if (!rows) return <div className="h-40 animate-pulse rounded-lg bg-[var(--line)]/50" />;
  if (!rows.length) return <p className="rounded-lg border border-dashed border-[var(--line)] p-6 text-sm text-[var(--muted)]">Nothing saved yet. A reading is stored every 30 seconds while data is flowing.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="text-xs font-medium text-[var(--muted)]">
          <tr>{["Time", "Temp (°C)", "Humidity (%)", "Light", "Buzzer"].map((c) => <th key={c} className="pb-3 pr-4 font-medium">{c}</th>)}</tr>
        </thead>
        <tbody className="num tracking-normal">
          {rows.map((r) => (
            <tr key={r.id} className="border-t border-[var(--line)]">
              <td className="py-2.5 pr-4">{new Date(r.recorded_at).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" })}</td>
              <td className="py-2.5 pr-4">{v(r.temperature, 1)}</td>
              <td className="py-2.5 pr-4">{v(r.humidity, 0)}</td>
              <td className="py-2.5 pr-4">{v(r.ldr, 0)}</td>
              <td className="py-2.5 pr-4">{r.buzzer === null ? "--" : r.buzzer ? "On" : "Off"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const delta = (pts: Point[], unit: string, d: number) => {
  if (pts.length < 2) return undefined;
  const diff = pts[pts.length - 1].v - pts[pts.length - 2].v;
  return `${diff > 0 ? "+" : ""}${diff.toFixed(d)} ${unit} since last reading`;
};

function Panel({ title, sub, children, i, className = "" }: { title: string; sub: string; children: ReactNode; i: number; className?: string }) {
  return (
    <Card i={i} className={className}>
      <header className="mb-5">
        <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold">{title}</h2>
        <p className="mt-0.5 text-sm leading-relaxed text-[var(--muted)]">{sub}</p>
      </header>
      {children}
    </Card>
  );
}

export function Dashboard() {
  const s = useLive();
  const h = useHistory(s);
  const waiting = s.updated === undefined;
  const live = s.status === "online" && !waiting;
  const temps = series(s.history, "temperature");
  const hums = series(s.history, "humidity");
  const lights = series(s.history, "ldr");
  const pct = s.ldr === undefined ? undefined : Math.min(100, (s.ldr / LDR_MAX) * 100);

  const StatusIcon = s.status === "error" ? SignalSlashIcon : SignalIcon;
  const statusTone: Tone = s.status === "error" ? "danger" : live ? "ok" : "muted";
  const statusText = { connecting: "Connecting", online: waiting ? "Waiting for data" : "Live", error: "Broker unreachable" }[s.status];

  return (
    <Shell
      right={
        <div role="status" className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium ${tones[statusTone]}`}>
          <StatusIcon className={`${ICON} ${live ? "pulse" : ""}`} />
          <span className="hidden sm:inline">{statusText}</span>
        </div>
      }
    >
        <dl className="rise mb-6 grid grid-cols-2 gap-x-6 sm:flex sm:flex-wrap sm:gap-x-10 gap-y-3 text-sm">
          {[
            ["Broker", BROKER],
            ["Topic", `${TOPIC}/#`],
            ["Messages", String(s.count)],
            ["Last update", s.updated ? stamp(s.updated) : "None yet"],
          ].map(([k, v]) => (
            <div key={k} className="flex flex-col">
              <dt className="text-xs font-medium text-[var(--muted)]">{k}</dt>
              <dd className="num text-sm tracking-normal">{v}</dd>
            </div>
          ))}
        </dl>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Kpi gauge={{ k: "temperature", x: s.temperature }} i={1} label="Temperature" icon={<FireIcon className={ICON} />} value={fmt(s.temperature)} unit="°C" chip={<LevelChip k="temperature" x={s.temperature} />} delta={delta(temps, "°C", 1)} />
          <Kpi gauge={{ k: "humidity", x: s.humidity }} i={2} label="Humidity" icon={<CloudIcon className={ICON} />} value={fmt(s.humidity, 0)} unit="%" chip={<LevelChip k="humidity" x={s.humidity} />} delta={delta(hums, "%", 0)} />
          <Kpi
            gauge={{ k: "light", x: s.ldr }}
            i={3}
            label="Light"
            icon={<SunIcon className={ICON} />}
            value={fmt(s.ldr, 0)}
            unit={`/ ${LDR_MAX}`}
            chip={<LevelChip k="light" x={s.ldr} />}
            delta={pct === undefined ? undefined : `${pct.toFixed(0)}% brightness`}
          />
          <Kpi
            i={4}
            label="Buzzer"
            icon={s.buzzer ? <BellAlertIcon className={ICON} /> : <BellSlashIcon className={ICON} />}
            value={s.buzzer === undefined ? "--" : s.buzzer ? "On" : "Off"}
            chip={<Chip tone={s.buzzer ? "danger" : "muted"}>{s.buzzer === undefined ? "No data" : s.buzzer ? "Sounding" : "Silent"}</Chip>}
            delta={s.events[0] ? `Changed at ${stamp(s.events[0].t)}` : "No state changes yet"}
          />
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-6">
          <Panel i={5} title="Temperature" sub="Recent readings in °C" className="lg:col-span-4">
            <Chart data={temps} unit="°C" />
          </Panel>

          <Panel i={6} title="Buzzer events" sub="State changes since the page opened" className="lg:col-span-2">
            {s.events.length === 0 ? (
              <p className="rounded-lg border border-dashed border-[var(--line)] p-6 text-sm text-[var(--muted)]">
                No events yet. A row appears each time the buzzer switches on or off.
              </p>
            ) : (
              <ul className="divide-y divide-[var(--line)]">
                {s.events.slice(0, 7).map((e) => (
                  <li key={e.t} className="flex items-center justify-between py-2.5 text-sm">
                    <Chip tone={e.on ? "danger" : "muted"}>{e.on ? "Switched on" : "Switched off"}</Chip>
                    <span className="font-mono tabular-nums text-[var(--muted)]">{stamp(e.t)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel i={7} title="Humidity" sub="Recent readings in %" className="lg:col-span-3">
            <Chart data={hums} unit="%" decimals={0} />
          </Panel>
          <Panel i={8} title="Light" sub={`Recent LDR readings, 0 to ${LDR_MAX}`} className="lg:col-span-3">
            <Chart data={lights} unit="" decimals={0} />
          </Panel>
        </div>

        <Panel i={9} title="Saved history" sub="Latest readings stored in the database" className="mt-4">
          <History rows={h.rows} error={h.error} />
          <Link href="/history" className="mt-4 inline-block text-sm font-medium text-[var(--accent)] hover:underline">View full history</Link>
        </Panel>

        {s.status === "error" && (
          <p className="mt-6 rounded-lg bg-[var(--danger-soft)] px-4 py-3 text-sm text-[var(--danger)]" role="alert">
            Could not reach the broker. Check NEXT_PUBLIC_MQTT_URL in .env.local. The broker must expose MQTT over WebSockets.
          </p>
        )}
    </Shell>
  );
}
