import type { Metadata } from "next";
import { SITE_TITLE } from "@/constants/seo";
import Home from "@/modules/Home";
import { buildMetadata } from "@/utils/metadata";

export const metadata: Metadata = buildMetadata({
  title: SITE_TITLE,
  absoluteTitle: true,
  description:
    "Aprende y enseña tiro parabólico con ParabolicLab: simulaciones interactivas de física, escenarios creados por docentes y seguimiento del progreso de cada estudiante.",
  path: "/",
  keywords: ["plataforma educativa de física", "enseñar tiro parabólico"],
});

export default function HomePage() {
  return <Home />;
}
