export const BACKGROUND_ASSET_KEYS = [
  "day",
  "sunset",
  "night",
  "desert",
  "snow",
] as const;

export type BackgroundAssetKey = (typeof BACKGROUND_ASSET_KEYS)[number];

export const BACKGROUND_LABELS: Record<BackgroundAssetKey, string> = {
  day: "Día",
  sunset: "Atardecer",
  night: "Noche",
  desert: "Desierto",
  snow: "Nieve",
};

export const DEFAULT_BACKGROUND: BackgroundAssetKey = "day";

/**
 * Paleta de cada tema. Se usa tanto en el canvas (GameCanvas) para pintar el
 * fondo como en el panel de controles para mostrar la miniatura del swatch.
 * `sky` y `ground` son tres paradas de un degradado vertical (arriba→abajo).
 */
export interface BackgroundTheme {
  sky: [string, string, string];
  ground: [string, string, string];
  cloud: string;
  grassShadow: string;
}

export const BACKGROUND_THEMES: Record<BackgroundAssetKey, BackgroundTheme> = {
  day: {
    sky: ["#7dd3fc", "#bae6fd", "#fef3c7"],
    ground: ["#22c55e", "#15803d", "#064e3b"],
    cloud: "rgba(255,255,255,0.8)",
    grassShadow: "rgba(0,0,0,0.18)",
  },
  sunset: {
    sky: ["#fb923c", "#f472b6", "#fde68a"],
    ground: ["#4d7c0f", "#365314", "#1a2e05"],
    cloud: "rgba(255,240,230,0.75)",
    grassShadow: "rgba(0,0,0,0.2)",
  },
  night: {
    sky: ["#0f172a", "#1e293b", "#334155"],
    ground: ["#1f2937", "#111827", "#030712"],
    cloud: "rgba(203,213,225,0.5)",
    grassShadow: "rgba(0,0,0,0.3)",
  },
  desert: {
    sky: ["#fcd34d", "#fde68a", "#fef3c7"],
    ground: ["#d97706", "#b45309", "#78350f"],
    cloud: "rgba(255,255,255,0.7)",
    grassShadow: "rgba(0,0,0,0.15)",
  },
  snow: {
    sky: ["#e0f2fe", "#f0f9ff", "#ffffff"],
    ground: ["#e2e8f0", "#cbd5e1", "#94a3b8"],
    cloud: "rgba(255,255,255,0.95)",
    grassShadow: "rgba(148,163,184,0.4)",
  },
};
