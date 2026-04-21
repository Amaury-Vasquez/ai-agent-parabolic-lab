import ActividadDetalle from "@/modules/ActividadDetalle";

interface ActividadDetallePageProps {
  params: Promise<{ activityId: string }>;
}

export default async function ActividadDetallePage({ params }: ActividadDetallePageProps) {
  const { activityId } = await params;
  return <ActividadDetalle idactividad={activityId} />;
}