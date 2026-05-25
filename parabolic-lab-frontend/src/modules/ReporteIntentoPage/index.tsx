"use client";
import { useParams } from "next/navigation";
import ReporteIntentoContent from "@/components/ReporteIntento";
import { useReporteIntento } from "@/queries/useReporteIntento";

const ReporteIntentoPage = () => {
  const params = useParams<{ idinteraccion: string }>();
  const idinteraccion = params?.idinteraccion ?? null;
  const { data: reporte, isLoading, isError } = useReporteIntento(idinteraccion);

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (isError || !reporte) {
    return (
      <div className="p-4 md:p-8">
        <div className="alert alert-error max-w-lg">
          <span>No se pudo cargar el reporte. Verifica que el intento esté completado y tengas acceso.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <ReporteIntentoContent reporte={reporte} />
    </div>
  );
};

export default ReporteIntentoPage;
