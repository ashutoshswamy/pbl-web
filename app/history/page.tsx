import { Suspense } from "react";
import { Shell } from "../components/Shell";
import { AllTable, Card, Controls, METRICS, Pager, Stats } from "../components/HistoryParts";
import { Chart } from "../components/Chart";
import { page, parseRange, series, stats } from "../lib/queries";
import { v } from "../lib/format";
import { LEGEND } from "../lib/levels";
import type { Row } from "../lib/useHistory";

export const metadata = { title: "History | Environment Monitoring using ESP8266 and MQTT" };

type SP = Promise<Record<string, string | undefined>>;

const Loading = () => (
  <div className="space-y-4" aria-busy="true">
    <div className="h-8 w-56 animate-pulse rounded-lg bg-[var(--line)]/60" />
    <div className="h-72 animate-pulse rounded-xl bg-[var(--line)]/40" />
  </div>
);

export default function History({ searchParams }: { searchParams: SP }) {
  return (
    <Shell>
      <Suspense fallback={<Loading />}>
        <Body searchParams={searchParams} />
      </Suspense>
    </Shell>
  );
}

async function Body({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const range = parseRange(sp.range);
  const p = Math.max(1, Number(sp.page) || 1);
  const [data, st, rows] = await Promise.all([series(range), stats(range), page(range, p)]);
  const pts = (pick: (r: Row) => number | null) => data.flatMap((r) => (pick(r) === null ? [] : [{ t: Date.parse(r.recorded_at), v: pick(r) as number }]));
  const buzzerPts = data.flatMap((r) => (r.buzzer === null ? [] : [{ t: Date.parse(r.recorded_at), v: r.buzzer ? 1 : 0 }]));

  return (
    <>
      <h1 className="font-[family-name:var(--font-display)] mb-1 text-2xl font-semibold md:text-3xl">History</h1>
      <p className="mb-6 max-w-[65ch] text-[var(--muted)]">Every saved reading, across all parameters.</p>
      <Controls active="all" range={range} base="/history" />

      <Stats
        items={[
          ["Readings saved", String(st.n)],
          ["Avg temperature", `${v(st.temperature_avg as number | null, 1)} °C`],
          ["Avg humidity", `${v(st.humidity_avg as number | null, 0)} %`],
          ["Avg light", v(st.light_avg as number | null, 0)],
        ]}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {(Object.keys(METRICS) as (keyof typeof METRICS)[]).map((k) => (
          <Card key={k} title={METRICS[k].label} sub={LEGEND[k]} href={`/history/${k}?range=${range}`}>
            <Chart data={pts(METRICS[k].pick)} unit={METRICS[k].unit} decimals={METRICS[k].d} />
          </Card>
        ))}
        <Card title="Buzzer" sub="On or off over time" href={`/history/buzzer?range=${range}`}>
          <Chart data={buzzerPts} unit="" decimals={0} binary />
        </Card>
      </div>

      <Card title="All readings" sub="Newest first" className="mt-4">
        <AllTable rows={rows.rows} />
        <Pager base="/history" range={range} p={p} total={rows.total} />
      </Card>
    </>
  );
}
