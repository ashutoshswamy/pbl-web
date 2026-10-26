"use client";
import { useEffect, useState } from "react";
import mqtt from "mqtt";

export type Reading = { t: number; temperature?: number; humidity?: number; ldr?: number };
export type State = {
  status: "connecting" | "online" | "error";
  temperature?: number;
  humidity?: number;
  ldr?: number;
  buzzer?: boolean;
  updated?: number;
  count: number;
  events: { t: number; on: boolean }[];
  history: Reading[];
};

const URL = process.env.NEXT_PUBLIC_MQTT_URL!;
const BASE = process.env.NEXT_PUBLIC_MQTT_TOPIC!;
const MAX_POINTS = 120;

const toBool = (v: unknown) => ["1", "on", "true"].includes(String(v).toLowerCase());

export function useSensors(): State {
  const [s, setS] = useState<State>({ status: "connecting", count: 0, events: [], history: [] });

  useEffect(() => {
    const client = mqtt.connect(URL, { reconnectPeriod: 3000 });
    client.on("connect", () => {
      setS((p) => ({ ...p, status: "online" }));
      client.subscribe([BASE, `${BASE}/#`]);
    });
    client.on("error", () => setS((p) => ({ ...p, status: "error" })));
    client.on("close", () => setS((p) => ({ ...p, status: "connecting" })));

    client.on("message", (topic, buf) => {
      const raw = buf.toString().trim();
      let data: Record<string, unknown>;
      try {
        const j = JSON.parse(raw);
        data = typeof j === "object" && j ? j : { [topic.split("/").pop()!]: j };
      } catch {
        data = { [topic.split("/").pop()!]: raw };
      }
      // ponytail: key aliases cover common DHT11/LDR firmware naming
      const num = (...k: string[]) => {
        for (const key of k) if (data[key] !== undefined && !isNaN(Number(data[key]))) return Number(data[key]);
      };
      const temperature = num("temperature", "temp", "t");
      const humidity = num("humidity", "hum", "h");
      const ldr = num("ldr", "light");
      const b = data.buzzer ?? data.buzz;

      setS((p) => {
        const now = Date.now();
        const next: State = {
          ...p,
          temperature: temperature ?? p.temperature,
          humidity: humidity ?? p.humidity,
          ldr: ldr ?? p.ldr,
          buzzer: b === undefined ? p.buzzer : toBool(b),
          updated: now,
          count: p.count + 1,
        };
        if (b !== undefined && toBool(b) !== p.buzzer) next.events = [{ t: now, on: toBool(b) }, ...p.events].slice(0, 20);
        if (temperature !== undefined || humidity !== undefined || ldr !== undefined) {
          next.history = [...p.history, { t: now, temperature, humidity, ldr }].slice(-MAX_POINTS);
        }
        return next;
      });
    });
    return () => void client.end(true);
  }, []);

  return s;
}
