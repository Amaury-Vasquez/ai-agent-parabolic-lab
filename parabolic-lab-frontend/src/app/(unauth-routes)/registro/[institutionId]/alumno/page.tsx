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
}

export default async function RegisterStudentPage({
  params,
}: RegisterStudentPageProps) {
  const { institutionId } = await params;

  return <RegisterStudent institutionId={institutionId} />;
}
