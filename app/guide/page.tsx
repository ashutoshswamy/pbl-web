import { Shell } from "../components/Shell";
import { Chip } from "../components/Chip";
import { CUTS, LDR_MAX, LEVEL_LABEL, type LevelKey } from "../lib/levels";

export const metadata = { title: "Guide | Environment Monitoring using ESP8266 and MQTT" };

const ROWS: { k: LevelKey; label: string; unit: string; note: string }[] = [
  { k: "temperature", label: "Temperature", unit: "°C", note: "DHT sensor reading." },
  { k: "humidity", label: "Humidity", unit: "%", note: "DHT sensor reading." },
  { k: "light", label: "Light", unit: "%", note: `LDR reading as a percentage of its maximum (${LDR_MAX}).` },
];

export default function Guide() {
  return (
    <Shell>
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold">Guide</h1>
      <p className="mt-2 max-w-[65ch] text-sm leading-relaxed text-[var(--muted)]">
        Each reading gets a level chip so you can tell at a glance whether it is low, medium or high. These are the ranges behind the chips.
      </p>

      <div className="mt-6 overflow-x-auto rounded-xl border border-[var(--line)] bg-[var(--card)] p-5">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="text-xs font-medium text-[var(--muted)]">
            <tr>
              <th className="pb-3 pr-4 font-medium">Metric</th>
              <th className="pb-3 pr-4 font-medium"><Chip tone="muted">{LEVEL_LABEL.low}</Chip></th>
              <th className="pb-3 pr-4 font-medium"><Chip tone="ok">{LEVEL_LABEL.medium}</Chip></th>
              <th className="pb-3 pr-4 font-medium"><Chip tone="warn">{LEVEL_LABEL.high}</Chip></th>
            </tr>
          </thead>
          <tbody className="num tracking-normal">
            {ROWS.map(({ k, label, unit, note }) => {
              const [lo, hi] = CUTS[k];
              return (
                <tr key={k} className="border-t border-[var(--line)]">
                  <td className="py-3 pr-4 font-sans">
                    <p className="font-medium">{label}</p>
                    <p className="text-xs text-[var(--muted)]">{note}</p>
                  </td>
                  <td className="py-3 pr-4">below {lo} {unit}</td>
                  <td className="py-3 pr-4">{lo} to {hi} {unit}</td>
                  <td className="py-3 pr-4">above {hi} {unit}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <h2 className="mt-8 font-[family-name:var(--font-display)] text-lg font-semibold">Other indicators</h2>
      <dl className="mt-3 grid max-w-3xl gap-3 text-sm sm:grid-cols-[10rem_1fr]">
        <dt className="font-medium">Live / Waiting / Broker unreachable</dt>
        <dd className="text-[var(--muted)]">Connection status of the MQTT broker, shown top right.</dd>
        <dt className="font-medium">Buzzer</dt>
        <dd className="text-[var(--muted)]">Sounding means the ESP8266 switched the buzzer on. A popup shows the latest readings until dismissed.</dd>
        <dt className="font-medium">Saved history</dt>
        <dd className="text-[var(--muted)]">One reading is stored every 30 seconds while data is flowing. Browse and filter it on the History tab.</dd>
      </dl>
    </Shell>
  );
}
