import type { Metadata } from "next";
import RegisterTeacher from "@/modules/RegisterTeacher";
import { buildMetadata } from "@/utils/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Registro de docente",
  description:
    "Únete a tu institución en ParabolicLab como docente para crear salones, diseñar escenarios y dar seguimiento al progreso de tus estudiantes.",
  noindex: true,
});

interface RegisterTeacherPageProps {
  params: Promise<{ institutionId: string }>;
}

export default async function RegisterTeacherPage({
  params,
}: RegisterTeacherPageProps) {
  const { institutionId } = await params;

  return <RegisterTeacher institutionId={institutionId} />;
}
