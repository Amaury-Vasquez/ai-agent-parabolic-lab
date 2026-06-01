import type { MetadataRoute } from "next";
import { SITE_URL } from "@/constants/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Rutas privadas/autenticadas y páginas transaccionales: no rastrear.
      // Los enlaces de registro por institución ya llevan meta robots noindex.
      disallow: [
        "/docente",
        "/alumno",
        "/admin",
        "/recuperar-contrasena",
        "/restablecer-contrasena",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
