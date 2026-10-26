import { ensureTable, sql } from "./db";
import type { Row } from "./useHistory";

export const RANGES = { "1h": 3_600, "24h": 86_400, "7d": 604_800, "30d": 2_592_000, all: 315_360_000 } as const;
export type Range = keyof typeof RANGES;
export const parseRange = (r?: string): Range => (r && r in RANGES ? (r as Range) : "24h");
export const PAGE_SIZE = 25;
const CHART_POINTS = 1000; // ponytail: newest 1000 rows, add bucketing (date_bin) if ranges outgrow this

const clean = (r: Record<string, unknown>) => ({ ...r, id: Number(r.id), recorded_at: new Date(r.recorded_at as string).toISOString() }) as Row;

export async function series(range: Range): Promise<Row[]> {
  await ensureTable();
  const rows = await sql`
    SELECT id, recorded_at, temperature, humidity, ldr, buzzer FROM readings
    WHERE recorded_at > now() - make_interval(secs => ${RANGES[range]})
    ORDER BY recorded_at DESC LIMIT ${CHART_POINTS}`;
  return rows.map(clean).reverse();
}

export async function page(range: Range, p: number) {
  await ensureTable();
  const [[{ n }], rows] = await Promise.all([
    sql`SELECT count(*)::int AS n FROM readings WHERE recorded_at > now() - make_interval(secs => ${RANGES[range]})`,
    sql`
      SELECT id, recorded_at, temperature, humidity, ldr, buzzer FROM readings
      WHERE recorded_at > now() - make_interval(secs => ${RANGES[range]})
      ORDER BY recorded_at DESC LIMIT ${PAGE_SIZE} OFFSET ${(p - 1) * PAGE_SIZE}`,
  ]);
  return { total: n as number, rows: rows.map(clean) };
}

export async function stats(range: Range) {
  await ensureTable();
  const [r] = await sql`
    SELECT count(*)::int AS n,
      min(temperature) AS temperature_min, avg(temperature) AS temperature_avg, max(temperature) AS temperature_max,
      min(humidity) AS humidity_min, avg(humidity) AS humidity_avg, max(humidity) AS humidity_max,
      min(ldr) AS light_min, avg(ldr) AS light_avg, max(ldr) AS light_max,
      count(buzzer)::int AS buzzer_n, (count(*) FILTER (WHERE buzzer))::int AS buzzer_on
    FROM readings WHERE recorded_at > now() - make_interval(secs => ${RANGES[range]})`;
  return r as Record<string, number | null>;
}
