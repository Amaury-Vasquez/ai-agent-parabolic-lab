export const DEFAULT_THEME = "winter";
export const DEFAULT_DARK_THEME = "dim";

export const DAISYUI_THEMES = [
  "light",
  "dark",
  "cupcake",
  "bumblebee",
  "emerald",
  "corporate",
  "synthwave",
  "retro",
  "cyberpunk",
  "valentine",
  "halloween",
  "garden",
  "forest",
  "aqua",
  "lofi",
  "pastel",
  "fantasy",
  "wireframe",
  "black",
  "luxury",
  "dracula",
  "cmyk",
  "autumn",
  "business",
  "acid",
  "lemonade",
  "night",
  "coffee",
  "winter",
  "dim",
  "nord",
  "sunset",
  "caramellatte",
  "abyss",
  "silk",
] as const;

export type DaisyUITheme = (typeof DAISYUI_THEMES)[number];

export interface ThemeOption {
  id: DaisyUITheme;
  label: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  { id: "winter", label: "Invierno" },
  { id: "dim", label: "Tenue" },
  { id: "light", label: "Claro" },
  { id: "dark", label: "Oscuro" },
  { id: "cupcake", label: "Cupcake" },
  { id: "bumblebee", label: "Abejorro" },
  { id: "emerald", label: "Esmeralda" },
  { id: "corporate", label: "Corporativo" },
  { id: "synthwave", label: "Synthwave" },
  { id: "retro", label: "Retro" },
  { id: "cyberpunk", label: "Cyberpunk" },
  { id: "valentine", label: "Valentín" },
  { id: "halloween", label: "Halloween" },
  { id: "garden", label: "Jardín" },
  { id: "forest", label: "Bosque" },
  { id: "aqua", label: "Aqua" },
  { id: "lofi", label: "Lofi" },
  { id: "pastel", label: "Pastel" },
  { id: "fantasy", label: "Fantasía" },
  { id: "wireframe", label: "Wireframe" },
  { id: "black", label: "Negro" },
  { id: "luxury", label: "Lujo" },
  { id: "dracula", label: "Drácula" },
  { id: "cmyk", label: "CMYK" },
  { id: "autumn", label: "Otoño" },
  { id: "business", label: "Negocios" },
  { id: "acid", label: "Ácido" },
  { id: "lemonade", label: "Limonada" },
  { id: "night", label: "Noche" },
  { id: "coffee", label: "Café" },
  { id: "nord", label: "Nord" },
  { id: "sunset", label: "Atardecer" },
  { id: "caramellatte", label: "Caramel Latte" },
  { id: "abyss", label: "Abismo" },
  { id: "silk", label: "Seda" },
];

export function isValidTheme(value: string | null | undefined): value is DaisyUITheme {
  return !!value && (DAISYUI_THEMES as readonly string[]).includes(value);
}
