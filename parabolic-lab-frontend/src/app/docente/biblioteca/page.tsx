import type { Metadata } from "next";
import Biblioteca from "@/modules/Biblioteca";
import { buildMetadata } from "@/utils/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Biblioteca de escenarios",
  description:
    "Explora y reutiliza tus escenarios de tiro parabólico guardados en tu biblioteca de ParabolicLab.",
  noindex: true,
});

export default function BibliotecaPage() {
  return <Biblioteca />;
}