import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Shell } from "../../components/Shell";
import { Card, Controls, METRICS, MetricTable, Pager, Stats, type MetricKey } from "../../components/HistoryParts";
import { Chart } from "../../components/Chart";
import { page, parseRange, series, stats } from "../../lib/queries";
import { v } from "../../lib/format";
import { LEGEND } from "../../lib/levels";

const isMetric = (m: string): m is MetricKey => m === "buzzer" || m in METRICS;

type Props = { params: Promise<{ metric: string }>; searchParams: Promise<Record<string, string | undefined>> };

const Loading = () => (
  <div className="space-y-4" aria-busy="true">
    <div className="h-8 w-56 animate-pulse rounded-lg bg-[var(--line)]/60" />
    <div className="h-72 animate-pulse rounded-xl bg-[var(--line)]/40" />
  </div>
);

export default function MetricHistory(props: Props) {
  return (
    <Shell>
      <Suspense fallback={<Loading />}>
        <Body {...props} />
      </Suspense>
    </Shell>
  );
}

async function Body({ params, searchParams }: Props) {
  const { metric } = await params;
  if (!isMetric(metric)) notFound();
  const sp = await searchParams;
  const range = parseRange(sp.range);
  const p = Math.max(1, Number(sp.page) || 1);
  const [data, st, rows] = await Promise.all([series(range), stats(range), page(range, p)]);
  const base = `/history/${metric}`;
  const label = metric === "buzzer" ? "Buzzer" : METRICS[metric].label;

  let stat: [string, string][];
  let pts;
  if (metric === "buzzer") {
    const known = data.filter((r) => r.buzzer !== null);
    const switches = known.filter((r, i) => i > 0 && r.buzzer !== known[i - 1].buzzer).length;
    const share = st.buzzer_n ? (Number(st.buzzer_on) / Number(st.buzzer_n)) * 100 : null;
    const last = known.at(-1)?.buzzer;
    stat = [
      ["Latest state", last === undefined || last === null ? "--" : last ? "On" : "Off"],
      ["Time on", share === null ? "--" : `${share.toFixed(0)} %`],
      ["Switches", String(switches)],
      ["Readings", String(st.buzzer_n)],
    ];
    pts = known.map((r) => ({ t: Date.parse(r.recorded_at), v: r.buzzer ? 1 : 0 }));
  } else {
    const m = METRICS[metric];
    const u = m.unit ? ` ${m.unit}` : "";
    const f = (x: unknown) => `${v(x as number | null, m.d)}${u}`;
    const vals = data.map((r) => m.pick(r)).filter((x): x is number => x !== null);
    stat = [
      ["Latest", vals.length ? f(vals.at(-1)) : "--"],
      ["Minimum", f(st[`${metric}_min`])],
      ["Average", f(st[`${metric}_avg`])],
      ["Maximum", f(st[`${metric}_max`])],
    ];
    pts = data.flatMap((r) => (m.pick(r) === null ? [] : [{ t: Date.parse(r.recorded_at), v: m.pick(r) as number }]));
  }

  return (
    <>
      <h1 className="font-[family-name:var(--font-display)] mb-1 text-2xl font-semibold md:text-3xl">{label} history</h1>
      <p className="mb-6 max-w-[65ch] text-[var(--muted)]">Saved readings over time.</p>
      {metric !== "buzzer" && <p className="-mt-4 mb-6 max-w-[65ch] text-sm text-[var(--muted)]">{LEGEND[metric]}</p>}
      <Controls active={metric} range={range} base={base} />
      <Stats items={stat} />
      <Card title={label} sub={metric === "buzzer" ? "On or off over time" : "Hover or drag across the chart for exact values"}>
        <Chart data={pts} unit={metric === "buzzer" ? "" : METRICS[metric].unit} decimals={metric === "buzzer" ? 0 : METRICS[metric].d} binary={metric === "buzzer"} />
      </Card>
      <Card title="Readings" sub="Newest first" className="mt-4">
        <MetricTable rows={rows.rows} metric={metric} />
        <Pager base={base} range={range} p={p} total={rows.total} />
      </Card>
    </>
  );
}
