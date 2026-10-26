"use client";
import { BellAlertIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { LevelChip } from "./Chip";
import { useLive } from "./SensorsProvider";

const FRESH_MS = 120_000;

export function BuzzerAlert() {
  const s = useLive();
  const [row, setRow] = useState<{ buzzer: boolean | null; temperature: number | null; humidity: number | null; ldr: number | null } | null>(null);
  const [dismissed, setDismissed] = useState(false);

  // Live MQTT state may not have arrived yet when the site opens, so fall back to the newest saved reading.
  useEffect(() => {
    fetch("/api/readings?limit=1", { cache: "no-store" })
      .then((r) => r.json())
      .then(([r]) => setRow(r && Date.now() - Date.parse(r.recorded_at) < FRESH_MS ? r : null))
      .catch(() => {});
  }, []);

  const on = s.buzzer ?? row?.buzzer === true;
  useEffect(() => {
    if (!on) setDismissed(false); // alert again the next time it switches on
  }, [on]);

  if (!on || dismissed) return null;

  const rows = [
    ["Temperature", s.temperature ?? row?.temperature ?? undefined, "temperature", "°C", 1],
    ["Humidity", s.humidity ?? row?.humidity ?? undefined, "humidity", "%", 0],
    ["Light", s.ldr ?? row?.ldr ?? undefined, "light", "", 0],
  ] as const;

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="buzzer-alert-title"
      aria-describedby="buzzer-alert-body"
      className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/55 p-4"
      onKeyDown={(e) => e.key === "Escape" && setDismissed(true)}
    >
      <div className="rise w-full max-w-md rounded-xl border border-[var(--danger)] bg-[var(--card)] p-5 sm:p-6 shadow-xl">
        <span className="grid size-11 place-items-center rounded-full bg-[var(--danger-soft)] text-[var(--danger)]">
          <BellAlertIcon className="size-6" />
        </span>
        <h2 id="buzzer-alert-title" className="mt-4 font-[family-name:var(--font-display)] text-xl font-semibold">
          Buzzer is on
        </h2>
        <p id="buzzer-alert-body" className="mt-1 text-sm leading-relaxed text-[var(--muted)]">
          The ESP8266 is sounding the buzzer right now. Latest readings:
        </p>
        <dl className="mt-4 divide-y divide-[var(--line)] text-sm">
          {rows.map(([label, val, k, unit, d]) => (
            <div key={k} className="flex items-center justify-between py-2">
              <dt className="text-[var(--muted)]">{label}</dt>
              <dd className="num flex items-center gap-3 tracking-normal">
                {val === undefined ? "--" : `${val.toFixed(d)}${unit ? ` ${unit}` : ""}`}
                <LevelChip k={k} x={val} />
              </dd>
            </div>
          ))}
        </dl>
        <button
          autoFocus
          onClick={() => setDismissed(true)}
          className="mt-6 w-full rounded-lg bg-[var(--danger)] px-4 py-2.5 text-sm font-medium text-[var(--bg)] transition-transform active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--danger)]"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
