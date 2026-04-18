export const SCENARIO_TYPES = [
  "Simulación",
  "Simulación Avanzada",
  "Problema",
  "Desafío",
  "Práctica Guiada",
] as const;

export type ScenarioType = (typeof SCENARIO_TYPES)[number];
