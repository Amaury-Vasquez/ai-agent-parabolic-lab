import type { Metadata } from "next";
import TutorialDocente from "@/modules/TutorialDocente";
import { buildMetadata } from "@/utils/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Tutorial para docentes",
  description:
    "Aprende a usar ParabolicLab como docente: crea salones, diseña escenarios y da seguimiento al progreso de tus estudiantes.",
  noindex: true,
});

export default function TutorialDocentePage() {
  return <TutorialDocente />;
}
