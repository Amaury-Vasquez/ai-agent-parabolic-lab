import type { Metadata } from "next";
import Registro from "@/modules/Registro";
import { buildMetadata } from "@/utils/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Crear cuenta",
  description:
    "Regístrate en ParabolicLab como docente o estudiante y empieza a trabajar con escenarios y simulaciones de tiro parabólico.",
  path: "/registro",
  keywords: ["crear cuenta", "registro", "registrarse"],
});

export default function RegistroPage() {
  return <Registro />;
}
