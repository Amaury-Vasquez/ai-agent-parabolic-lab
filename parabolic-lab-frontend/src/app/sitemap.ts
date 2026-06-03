import type { MetadataRoute } from "next";
import { SITE_URL } from "@/constants/seo";

// Solo rutas públicas indexables. Las rutas autenticadas y las páginas
// transaccionales (recuperar/restablecer contraseña, registro por institución)
// se excluyen a propósito.
export default function sitemap(): MetadataRoute.Sitemap {
  const routes: Array<{
    path: string;
    priority: number;
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  }> = [
    { path: "/", priority: 1, changeFrequency: "weekly" },
    { path: "/simulador", priority: 0.9, changeFrequency: "monthly" },
    { path: "/registro", priority: 0.7, changeFrequency: "monthly" },
    { path: "/registro/institucion", priority: 0.6, changeFrequency: "monthly" },
    { path: "/login", priority: 0.5, changeFrequency: "monthly" },
  ];

  return routes.map(({ path, priority, changeFrequency }) => ({
    url: `${SITE_URL}${path}`,
    priority,
    changeFrequency,
  }));
}
