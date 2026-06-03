"use client";

import { Button } from "amvasdev-ui";
import { ArrowLeft, File, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCookies } from "react-cookie";
import ReporteAlumnoDocente from "./ReporteAlumnoDocente";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";
import { useMySalones } from "@/queries/useMySalones";
import { useSalonProgreso } from "@/queries/useSalonProgreso";
import { downloadReport } from "@/services/api";

type ReportFormat = "csv" | "pdf";

const Reportes = () => {
  const router = useRouter();
  const [cookies] = useCookies([ACCESS_TOKEN_COOKIE]);
  const token = cookies[ACCESS_TOKEN_COOKIE];
  const { data: salones = [] } = useMySalones();

  const [selectedSalonId, setSelectedSalonId] = useState("");
  const [loadingReport, setLoadingReport] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState<{
    idalumno: string;
    nombre: string;
  } | null>(null);

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

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={() => router.back()}
            className="btn btn-ghost btn-square btn-sm"
            title="Regresar"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-3xl font-bold">Reportes de Desempeño</h1>
        </div>
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
                        <th className="text-center">Reporte</th>
                      </tr>
                    </thead>
                    <tbody>
                      {estudiantes.map((estudiante) => {
                        const fullName = [estudiante.nombre, estudiante.apellidopaterno, estudiante.apellidomaterno].filter(Boolean).join(" ");
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
                              {Number(estudiante.promedio_puntuacion ?? 0).toFixed(1)}
                            </td>
                            <td className="text-center">
                              {Number(estudiante.mejor_puntuacion ?? 0).toFixed(1)}
                            </td>
                            <td className="text-center">
                              {estudiante.tiempo_total_minutos}m
                            </td>
                            <td className="text-center">
                              <Button
                                variant="ghost"
                                size="xs"
                                onClick={() =>
                                  setAlumnoSeleccionado({
                                    idalumno: estudiante.idalumno,
                                    nombre: fullName,
                                  })
                                }
                              >
                                Ver reporte
                              </Button>
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

      {alumnoSeleccionado ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-base-100 rounded-2xl shadow-2xl w-full max-w-2xl my-4 overflow-hidden">
            <ReporteAlumnoDocente
              idalumno={alumnoSeleccionado.idalumno}
              idsalon={selectedSalonId}
              nombreAlumno={alumnoSeleccionado.nombre}
              onClose={() => setAlumnoSeleccionado(null)}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Reportes;
