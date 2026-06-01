import type { Metadata } from "next";
import RegisterInstitution from "@/modules/RegisterInstitution";
import { buildMetadata } from "@/utils/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Registrar institución",
  description:
    "Da de alta tu escuela o institución en ParabolicLab para gestionar docentes, salones y el aprendizaje de tiro parabólico de tus estudiantes.",
  path: "/registro/institucion",
  keywords: ["registrar institución", "alta de escuela", "registro institucional"],
});

export default function RegistroInstitucion() {
  return <RegisterInstitution />;
}
