export const LDR_MAX = Number(process.env.NEXT_PUBLIC_LDR_MAX) || 4095;

export type Level = "low" | "medium" | "high";
export type LevelKey = "temperature" | "humidity" | "light";

// [low below, high above]. Light is a percentage of the sensor maximum.
export const CUTS: Record<LevelKey, [number, number]> = { temperature: [18, 30], humidity: [30, 60], light: [20, 60] };

export const level = (k: LevelKey, x: number): Level => {
  const n = k === "light" ? (x / LDR_MAX) * 100 : x;
  const [lo, hi] = CUTS[k];
  return n < lo ? "low" : n > hi ? "high" : "medium";
};

export const LEVEL_LABEL: Record<Level, string> = { low: "Low", medium: "Medium", high: "High" };

export const LEGEND: Record<LevelKey, string> = {
  temperature: "Low below 18 °C, medium 18 to 30 °C, high above 30 °C.",
  humidity: "Low below 30 %, medium 30 to 60 %, high above 60 %.",
  light: "Low below 20 %, medium 20 to 60 %, high above 60 % of the sensor maximum.",
};

// Gauge scale shown on the dashboard, in the same unit as CUTS.
export const DOMAIN: Record<LevelKey, number> = { temperature: 45, humidity: 100, light: 100 };
