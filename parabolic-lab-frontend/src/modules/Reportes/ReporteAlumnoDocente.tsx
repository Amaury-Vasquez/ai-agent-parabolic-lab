"use client";
import { Button } from "amvasdev-ui";
import { useState } from "react";
import { useCookies } from "react-cookie";
import ReporteIntentoContent from "@/components/ReporteIntento";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";
import { useReporteAlumnoDocente } from "@/queries/useReporteAlumnoDocente";
import { downloadReport } from "@/services/api";

type FormatoDescarga = "pdf" | "csv";

interface ReporteAlumnoDocenteProps {
  idalumno: string;
  idsalon: string;
  nombreAlumno: string;
  onClose: () => void;
}

const ReporteAlumnoDocente = ({
  idalumno,
  idsalon,
  nombreAlumno,
  onClose,
}: ReporteAlumnoDocenteProps) => {
  const [cookies] = useCookies([ACCESS_TOKEN_COOKIE]);
  const token = cookies[ACCESS_TOKEN_COOKIE];
  const [descargando, setDescargando] = useState<FormatoDescarga | null>(null);
  const [descargaError, setDescargaError] = useState<string | null>(null);

  const {
    data: reporte,
    isLoading,
    isError,
    sinReportes,
  } = useReporteAlumnoDocente(idalumno, idsalon, true);

  const handleDescargar = async (format: FormatoDescarga) => {
    if (!token) return;
    setDescargando(format);
    setDescargaError(null);
    try {
      await downloadReport(
        `/reportes/estudiante/${idalumno}/salon/${idsalon}/${format}`,
        token,
        `reporte_${nombreAlumno.replace(/\s+/g, "_")}.${format}`,
      );
    } catch {
      setDescargaError(
        `No se pudo descargar el reporte ${format.toUpperCase()}. Intenta de nuevo.`,
      );
    } finally {
      setDescargando(null);
    }
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-start justify-between gap-3 p-4 md:p-5 border-b border-base-300">
        <div className="min-w-0">
          <p className="text-xs uppercase opacity-60 font-semibold tracking-wide">
            Reporte del estudiante
          </p>
          <h2 className="text-lg md:text-xl font-bold truncate">
            {nombreAlumno}
          </h2>
        </div>
        <div className="flex gap-2 items-center shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDescargar("pdf")}
            disabled={descargando === "pdf"}
          >
            {descargando === "pdf" ? (
              <span className="loading loading-spinner loading-xs" />
            ) : (
              "PDF"
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDescargar("csv")}
            disabled={descargando === "csv"}
          >
            {descargando === "csv" ? (
              <span className="loading loading-spinner loading-xs" />
            ) : (
              "CSV"
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="btn-square"
            onClick={onClose}
          >
            ✕
          </Button>
        </div>
      </div>

      <div className="p-4 md:p-5 max-h-[80vh] overflow-y-auto">
        {descargaError ? (
          <p className="text-error text-sm mb-3">{descargaError}</p>
        ) : null}

        {isLoading ? (
          <div className="flex justify-center py-16">
            <span className="loading loading-spinner loading-lg" />
          </div>
        ) : sinReportes ? (
          <div className="alert alert-info">
            <span>
              Este estudiante aún no tiene escenarios completados con reporte.
            </span>
          </div>
        ) : isError || !reporte ? (
          <div className="alert alert-error">
            <span>
              No se pudo cargar el reporte del estudiante. Inténtalo más tarde.
            </span>
          </div>
        ) : (
          <ReporteIntentoContent reporte={reporte} modoImpresion />
        )}
      </div>
    </div>
  );
};

export default ReporteAlumnoDocente;
