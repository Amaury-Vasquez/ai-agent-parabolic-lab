import type { Metadata } from "next";
import ActividadDetalle from "@/modules/ActividadDetalle";
import { buildMetadata } from "@/utils/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Actividad",
  description:
    "Resuelve los escenarios de esta actividad de tiro parabólico y registra tu progreso.",
  noindex: true,
});

interface ActividadDetallePageProps {
  params: Promise<{ activityId: string }>;
}

export default async function ActividadDetallePage({ params }: ActividadDetallePageProps) {
  const { activityId } = await params;
  return <ActividadDetalle idactividad={activityId} />;
}