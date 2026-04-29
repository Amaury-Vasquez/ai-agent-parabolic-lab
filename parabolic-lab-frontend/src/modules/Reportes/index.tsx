"use client";

import { Button } from "amvasdev-ui";
import { File, FileText } from "lucide-react";
import { useState } from "react";
import { useCookies } from "react-cookie";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";
import { useMySalones } from "@/queries/useMySalones";
import { useSalonProgreso } from "@/queries/useSalonProgreso";
import { downloadReport } from "@/services/api";

type ReportFormat = "csv" | "pdf";

const Reportes = () => {
  const [cookies] = useCookies([ACCESS_TOKEN_COOKIE]);
  const token = cookies[ACCESS_TOKEN_COOKIE];
  const { data: salones = [] } = useMySalones();

  const [selectedSalonId, setSelectedSalonId] = useState("");
  const [loadingReport, setLoadingReport] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const { data: estudiantes = [], isLoading: isLoadingEstudiantes } =
    useSalonProgreso(selectedSalonId);

  const selectedSalon = salones.find((s) => s.idsalon === selectedSalonId);
  const selectedSalonName = selectedSalon?.nombresalon ?? "";

  const handleDownloadSalonReport = async (format: ReportFormat) => {
    if (!selectedSalonId || !token) return;

    setLoadingReport(`salon-${format}`);
    setDownloadError(null);
    try {
      const filename = `reporte_salon_${selectedSalonName.replace(/\s+/g, "_")}.${format}`;
      await downloadReport(
        `/reportes/salon/${selectedSalonId}/${format}`,
        token,
        filename,
      );
    } catch {
      setDownloadError(
        `No se pudo descargar el reporte ${format.toUpperCase()}. Intenta de nuevo.`,
      );
    } finally {
      setLoadingReport(null);
    }
  };

  const handleDownloadStudentReport = async (
    alumnoId: string,
    alumnoNombre: string,
    format: ReportFormat,
  ) => {
    if (!selectedSalonId || !token) return;

    setLoadingReport(`student-${alumnoId}-${format}`);
    setDownloadError(null);
    try {
      const filename = `expediente_${alumnoNombre.replace(/\s+/g, "_")}.${format}`;
      await downloadReport(
        `/reportes/estudiante/${alumnoId}/salon/${selectedSalonId}/${format}`,
        token,
        filename,
      );
    } catch {
      setDownloadError(
        `No se pudo descargar el expediente ${format.toUpperCase()}. Intenta de nuevo.`,
      );
    } finally {
      setLoadingReport(null);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Reportes de Desempeño</h1>
        <p className="opacity-60">
          Descarga reportes consolidados y expedientes individuales de tus
          estudiantes
        </p>
      </div>

      <div className="card bg-base-100 shadow-md border border-base-300 rounded-xl mb-6">
        <div className="card-body">
          <label className="form-control w-full">
            <div className="label">
              <span className="label-text font-semibold">
                Seleccionar Salón
              </span>
            </div>
            <select
              value={selectedSalonId}
              onChange={(e) => setSelectedSalonId(e.target.value)}
              className="select select-bordered w-full"
            >
              <option value="">-- Elige un salón --</option>
              {salones.map((salon) => (
                <option key={salon.idsalon} value={salon.idsalon}>
                  {salon.nombresalon} ({salon.num_estudiantes} estudiantes)
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {downloadError ? (
        <div className="alert alert-error mb-6">
          <p>{downloadError}</p>
        </div>
      ) : null}

      {selectedSalonId ? (
        <>
          <div className="card bg-base-100 shadow-md border border-base-300 rounded-xl mb-6">
            <div className="card-body">
              <h2 className="card-title text-lg mb-4">
                Reporte Consolidado del Grupo
              </h2>
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() => handleDownloadSalonReport("csv")}
                  disabled={loadingReport === "salon-csv"}
                  variant="primary"
                  className="flex items-center gap-2"
                >
                  {loadingReport === "salon-csv" ? (
                    <>
                      <span className="loading loading-spinner loading-sm" />
                      Descargando...
                    </>
                  ) : (
                    <>
                      <File size={18} />
                      Descargar CSV
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => handleDownloadSalonReport("pdf")}
                  disabled={loadingReport === "salon-pdf"}
                  variant="primary"
                  className="flex items-center gap-2"
                >
                  {loadingReport === "salon-pdf" ? (
                    <>
                      <span className="loading loading-spinner loading-sm" />
                      Descargando...
                    </>
                  ) : (
                    <>
                      <FileText size={18} />
                      Descargar PDF
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-md border border-base-300 rounded-xl">
            <div className="card-body">
              <h2 className="card-title text-lg mb-4">
                Expedientes de Estudiantes
              </h2>

              {isLoadingEstudiantes ? (
                <div className="flex justify-center py-12">
                  <span className="loading loading-spinner loading-lg" />
                </div>
              ) : estudiantes.length === 0 ? (
                <div className="text-center py-12 opacity-60">
                  <p>No hay estudiantes en este salón.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="table table-sm table-zebra">
                    <thead>
                      <tr className="bg-base-200">
                        <th>Estudiante</th>
                        <th className="text-center">Completados</th>
                        <th className="text-center">Intentos</th>
                        <th className="text-center">Promedio</th>
                        <th className="text-center">Mejor</th>
                        <th className="text-center">Tiempo</th>
                        <th className="text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {estudiantes.map((estudiante) => {
                        const fullName = `${estudiante.nombre} ${estudiante.apellidopaterno}`;
                        const csvKey = `student-${estudiante.idalumno}-csv`;
                        const pdfKey = `student-${estudiante.idalumno}-pdf`;
                        return (
                          <tr key={estudiante.idalumno} className="hover">
                            <td className="font-medium">{fullName}</td>
                            <td className="text-center">
                              {estudiante.escenarios_completados}
                            </td>
                            <td className="text-center">
                              {estudiante.total_intentos}
                            </td>
                            <td className="text-center">
                              {estudiante.promedio_puntuacion.toFixed(1)}
                            </td>
                            <td className="text-center">
                              {estudiante.mejor_puntuacion.toFixed(1)}
                            </td>
                            <td className="text-center">
                              {estudiante.tiempo_total_minutos}m
                            </td>
                            <td className="text-center">
                              <div className="flex justify-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="xs"
                                  onClick={() =>
                                    handleDownloadStudentReport(
                                      estudiante.idalumno,
                                      fullName,
                                      "csv",
                                    )
                                  }
                                  disabled={loadingReport === csvKey}
                                  title="Descargar CSV"
                                >
                                  {loadingReport === csvKey ? (
                                    <span className="loading loading-spinner loading-xs" />
                                  ) : (
                                    <File size={14} />
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="xs"
                                  onClick={() =>
                                    handleDownloadStudentReport(
                                      estudiante.idalumno,
                                      fullName,
                                      "pdf",
                                    )
                                  }
                                  disabled={loadingReport === pdfKey}
                                  title="Descargar PDF"
                                >
                                  {loadingReport === pdfKey ? (
                                    <span className="loading loading-spinner loading-xs" />
                                  ) : (
                                    <FileText size={14} />
                                  )}
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default Reportes;
