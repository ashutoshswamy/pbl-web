"use client";
import { createContext, useContext, type ReactNode } from "react";
import { useSensors, type State } from "../lib/useSensors";

const Ctx = createContext<State | null>(null);

// One MQTT connection for the whole site, shared by every page and the buzzer alert.
export function SensorsProvider({ children }: { children: ReactNode }) {
  return <Ctx value={useSensors()}>{children}</Ctx>;
}

export function useLive(): State {
  const s = useContext(Ctx);
  if (!s) throw new Error("useLive must be used inside SensorsProvider");
  return s;
}
