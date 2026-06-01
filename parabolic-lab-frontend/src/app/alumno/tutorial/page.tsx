import type { Metadata } from "next";
import TutorialAlumno from "@/modules/TutorialAlumno";
import { buildMetadata } from "@/utils/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Tutorial",
  description:
    "Aprende a usar ParabolicLab como estudiante: resuelve escenarios y domina el tiro parabólico paso a paso.",
  noindex: true,
});

export default function TutorialPage() {
  return <TutorialAlumno />;
}
