import type { Metadata } from "next";
import RegisterStudent from "@/modules/RegisterStudent";
import { buildMetadata } from "@/utils/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Registro de estudiante",
  description:
    "Únete a tu institución en ParabolicLab como estudiante para acceder a tus salones, actividades y simulaciones de tiro parabólico.",
  noindex: true,
});

interface RegisterStudentPageProps {
  params: Promise<{ institutionId: string }>;
  searchParams: Promise<{ salon?: string }>;
}

export default async function RegisterStudentPage({
  params,
  searchParams,
}: RegisterStudentPageProps) {
  // Ambos parámetros se leen en el servidor para que el formulario llegue
  // prellenado en el primer render.
  const { institutionId } = await params;
  const { salon } = await searchParams;

  return (
    <RegisterStudent institutionId={institutionId} salonCode={salon ?? ""} />
  );
}
