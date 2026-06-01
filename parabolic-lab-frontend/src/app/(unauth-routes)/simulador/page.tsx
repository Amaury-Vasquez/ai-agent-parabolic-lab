import type { Metadata } from "next";
import SimuladorTiroParabolico from "@/modules/SimuladorTiroParabolico";
import { buildMetadata } from "@/utils/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Simulador de tiro parabólico",
  description:
    "Experimenta con el movimiento de proyectiles en tiempo real: ajusta ángulo, velocidad y gravedad, y observa la trayectoria parabólica resultante en este simulador gratuito de física.",
  path: "/simulador",
  keywords: [
    "simulador de tiro parabólico",
    "simulador de proyectiles",
    "trayectoria parabólica",
    "simulador gratis",
  ],
});

export default function SimuladorPage() {
  return <SimuladorTiroParabolico />;
}
