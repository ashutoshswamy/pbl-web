import { neon } from "@neondatabase/serverless";

export const sql = neon(process.env.DATABASE_URL_POOLED!);

let ready: Promise<unknown> | undefined;
// ponytail: create-if-missing on first use instead of a migration tool
export const ensureTable = () =>
  (ready ??= sql`
    CREATE TABLE IF NOT EXISTS readings (
      id bigserial PRIMARY KEY,
      recorded_at timestamptz NOT NULL DEFAULT now(),
      temperature real,
      humidity real,
      ldr integer,
      buzzer boolean
    )`);
