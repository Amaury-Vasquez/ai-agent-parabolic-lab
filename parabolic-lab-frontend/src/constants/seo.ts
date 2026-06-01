// Configuración central de SEO. Todos los valores se exponen en
// SCREAMING_SNAKE_CASE y se reutilizan en el layout raíz, el manifest de la PWA,
// robots, sitemap y el helper buildMetadata (src/utils/metadata.ts).

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://paraboliclab.app"
).replace(/\/$/, "");

export const SITE_NAME = "ParabolicLab";

export const SITE_TITLE = "ParabolicLab — Aprende tiro parabólico simulando";

export const SITE_DESCRIPTION =
  "ParabolicLab es una plataforma educativa para aprender tiro parabólico con simulaciones interactivas de física. Docentes crean escenarios y los estudiantes practican el movimiento de proyectiles y siguen su progreso.";

// Plantilla de título: cada página aporta su propio título y se le concatena la marca.
export const TITLE_TEMPLATE = `%s · ${SITE_NAME}`;

export const SITE_LOCALE = "es_MX";

export const SITE_LANG = "es";

// Azul de marca (coincide con el icono cohete y el color primario del tema).
export const BRAND_COLOR = "#1d4ed8";

export const BACKGROUND_COLOR = "#ffffff";

export const SITE_KEYWORDS = [
  "tiro parabólico",
  "movimiento parabólico",
  "movimiento de proyectiles",
  "simulador de física",
  "física educativa",
  "cinemática",
  "aprendizaje de física",
  "educación STEM",
  "simulaciones interactivas",
  "ParabolicLab",
];

export const TWITTER_HANDLE = "@paraboliclab";

export const SITE_CREATOR = "ParabolicLab";

// Imagen Open Graph / Twitter por defecto (1200x630).
export const DEFAULT_OG_IMAGE = {
  url: "/og-image.png",
  width: 1200,
  height: 630,
  alt: SITE_NAME,
};
