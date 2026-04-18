export const DIFFICULTY_LEVELS = [
  "Básico",
  "Intermedio",
  "Avanzado",
  "Difícil",
  "Experto",
] as const;

export type DifficultyLevel = (typeof DIFFICULTY_LEVELS)[number];
