import type { Metadata } from "next";
import NuevoEscenario from "@/modules/Biblioteca/NuevoEscenario";
import { buildMetadata } from "@/utils/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Nuevo escenario",
  description:
    "Crea un nuevo escenario de tiro parabólico definiendo parámetros físicos, objetivos de aprendizaje e instrucciones para tus estudiantes.",
  noindex: true,
});

export default function NuevoEscenarioPage() {
  return <NuevoEscenario />;
}
