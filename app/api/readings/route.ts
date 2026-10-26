import { ensureTable, sql } from "../../lib/db";

const SAVE_EVERY_SECONDS = 30;
const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : null);

export async function GET(request: Request) {
  await ensureTable();
  const limit = Math.min(Number(new URL(request.url).searchParams.get("limit")) || 20, 200);
  const rows = await sql`
    SELECT id, recorded_at, temperature, humidity, ldr, buzzer
    FROM readings ORDER BY recorded_at DESC LIMIT ${limit}`;
  return Response.json(rows);
}

export async function POST(request: Request) {
  const b = await request.json().catch(() => null);
  if (!b || typeof b !== "object") return Response.json({ error: "Body must be a JSON object." }, { status: 400 });

  const [temperature, humidity, ldr] = [b.temperature, b.humidity, b.ldr].map(num);
  if (temperature === null && humidity === null && ldr === null) {
    return Response.json({ error: "Send at least one of temperature, humidity or ldr." }, { status: 400 });
  }
  const buzzer = typeof b.buzzer === "boolean" ? b.buzzer : null;

  await ensureTable();
  // Several open tabs may report the same reading; the NOT EXISTS guard keeps one row per interval.
  const saved = await sql`
    INSERT INTO readings (temperature, humidity, ldr, buzzer)
    SELECT ${temperature}, ${humidity}, ${ldr}, ${buzzer}
    WHERE NOT EXISTS (
      SELECT 1 FROM readings WHERE recorded_at > now() - make_interval(secs => ${SAVE_EVERY_SECONDS})
    )
    RETURNING id`;
  return Response.json({ saved: saved.length > 0 });
}
