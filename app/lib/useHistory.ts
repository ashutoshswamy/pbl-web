"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { State } from "./useSensors";

export type Row = {
  id: number;
  recorded_at: string;
  temperature: number | null;
  humidity: number | null;
  ldr: number | null;
  buzzer: boolean | null;
};

const SAVE_MS = 30_000;

export function useHistory(s: State) {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState(false);
  const latest = useRef(s);
  latest.current = s;

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/readings?limit=12", { cache: "no-store" });
      if (!r.ok) throw new Error();
      setRows(await r.json());
      setError(false);
    } catch {
      setError(true);
    }
  }, []);

  useEffect(() => {
    load();
    const save = async () => {
      const s = latest.current;
      if (!s.updated || Date.now() - s.updated > SAVE_MS * 2) return; // only record fresh data
      await fetch("/api/readings", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ temperature: s.temperature, humidity: s.humidity, ldr: s.ldr, buzzer: s.buzzer }),
      }).catch(() => {});
      load();
    };
    const id = setInterval(save, SAVE_MS);
    return () => clearInterval(id);
  }, [load]);

  return { rows, error };
}
