import type { Metadata } from "next";
import {
  DEFAULT_OG_IMAGE,
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_LOCALE,
  SITE_NAME,
  SITE_URL,
  TWITTER_HANDLE,
} from "@/constants/seo";

interface BuildMetadataParams {
  /** Título de la página (sin la marca; la plantilla del layout la añade). */
  title: string;
  /** Descripción específica de la página. */
  description?: string;
  /** Ruta canónica relativa, p. ej. "/login". Omitir en rutas dinámicas. */
  path?: string;
  /** Palabras clave adicionales para esta página. */
  keywords?: string[];
  /** true en rutas privadas/autenticadas para evitar su indexación. */
  noindex?: boolean;
  /** Imagen social específica (relativa o absoluta). Por defecto la de marca. */
  image?: string;
  /** true para usar el título tal cual, sin añadir la marca de la plantilla. */
  absoluteTitle?: boolean;
}

// Construye un objeto Metadata consistente (Open Graph, Twitter, canónico y
// robots) a partir de unos pocos campos por página, evitando repetición.
export function buildMetadata({
  title,
  description = SITE_DESCRIPTION,
  path,
  keywords,
  noindex = false,
  image,
  absoluteTitle = false,
}: BuildMetadataParams): Metadata {
  const canonical = path ? `${SITE_URL}${path}` : undefined;
  const ogImages = image
    ? [{ url: image, width: 1200, height: 630, alt: title }]
    : [DEFAULT_OG_IMAGE];

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    keywords: keywords ? [...SITE_KEYWORDS, ...keywords] : SITE_KEYWORDS,
    alternates: canonical ? { canonical } : undefined,
    robots: noindex
      ? {
          index: false,
          follow: false,
          googleBot: { index: false, follow: false },
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: SITE_LOCALE,
      url: canonical,
      title,
      description,
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      site: TWITTER_HANDLE,
      creator: TWITTER_HANDLE,
      title,
      description,
      images: ogImages,
    },
  };
}
