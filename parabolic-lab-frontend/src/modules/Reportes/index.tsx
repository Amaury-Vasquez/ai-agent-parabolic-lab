"use client";

import { useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import { useMySalones } from "@/queries/useMySalones";
import { fetchSalonProgreso } from "@/fetchers/salones";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";
import { downloadReport } from "@/services/api";
import { Button } from "amvasdev-ui";
import { Download, FileText, File } from "lucide-react";

interface Estudiante {
  idalumno: string;
  nombre: string;
  apellidopaterno: string;
  promedio_puntuacion: number;
  escenarios_completados: number;
  total_intentos: number;
  tiempo_total_minutos: number;
  mejor_puntuacion: number;
}

const Reportes = () => {
  const [cookies] = useCookies([ACCESS_TOKEN_COOKIE]);
  const token = cookies[ACCESS_TOKEN_COOKIE];
  const { data: salones = [] } = useMySalones();

  const [selectedSalonId, setSelectedSalonId] = useState<string>("");
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [loadingEstudiantes, setLoadingEstudiantes] = useState(false);
  const [loadingReport, setLoadingReport] = useState<string | null>(null);
  const [selectedSalonName, setSelectedSalonName] = useState<string>("");

  // Cargar estudiantes cuando se selecciona un salón
  useEffect(() => {
    if (selectedSalonId && token) {
      setLoadingEstudiantes(true);
      const salonSeleccionado = salones.find(
        (s) => s.idsalon === selectedSalonId
      );
      setSelectedSalonName(salonSeleccionado?.nombresalon || "");

      fetchSalonProgreso(token, selectedSalonId)
        .then(setEstudiantes)
        .catch((error) => {
          console.error("Error cargando estudiantes:", error);
          setEstudiantes([]);
        })
        .finally(() => setLoadingEstudiantes(false));
    }
  }, [selectedSalonId, token, salones]);

  const handleDownloadSalonReport = async (format: "csv" | "pdf") => {
    if (!selectedSalonId || !token) return;

    setLoadingReport(`salon-${format}`);
    try {
      const filename = `reporte_salon_${selectedSalonName.replace(/\s+/g, "_")}.${format}`;
      await downloadReport(
        `/reportes/salon/${selectedSalonId}/${format}`,
        token,
        filename
      );
    } catch (error) {
      console.error(`Error descargando reporte ${format}:`, error);
      alert(`Error al descargar el reporte ${format.toUpperCase()}`);
    } finally {
      setLoadingReport(null);
    }
  };

  const handleDownloadStudentReport = async (
    alumnoId: string,
    alumnoNombre: string,
    format: "csv" | "pdf"
  ) => {
    if (!selectedSalonId || !token) return;

    setLoadingReport(`student-${alumnoId}-${format}`);
    try {
      const filename = `expediente_${alumnoNombre.replace(/\s+/g, "_")}.${format}`;
      await downloadReport(
        `/reportes/estudiante/${alumnoId}/salon/${selectedSalonId}/${format}`,
        token,
        filename
      );
    } catch (error) {
      console.error(
        `Error descargando expediente ${format}:`,
        error
      );
      alert(`Error al descargar el expediente ${format.toUpperCase()}`);
    } finally {
      setLoadingReport(null);
    }
  };

  return (
    <div className="p-8">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Reportes de Desempeño</h1>
        <p className="text-base-content/60">
          Descarga reportes consolidados y expedientes individuales de tus estudiantes
        </p>
      </div>

      {/* Salon Selector */}
      <div className="card bg-base-100 shadow-md border border-base-300 rounded-xl mb-6">
        <div className="card-body">
          <label className="form-control w-full">
            <div className="label">
              <span className="label-text font-semibold">Seleccionar Salón</span>
            </div>
            <select
              value={selectedSalonId}
              onChange={(e) => setSelectedSalonId(e.target.value)}
              className="select select-bordered w-full focus:outline-none focus:ring-2 focus:ring-primary"
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

      {selectedSalonId && (
        <>
          {/* Reporte Consolidado */}
          <div className="card bg-base-100 shadow-md border border-primary/20 rounded-xl mb-6 bg-gradient-to-br from-base-100 to-primary/5">
            <div className="card-body">
              <h2 className="card-title text-lg mb-4">Reporte Consolidado del Grupo</h2>
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() => handleDownloadSalonReport("csv")}
                  disabled={loadingReport === "salon-csv"}
                  variant="primary"
                  className="flex items-center gap-2"
                >
                  {loadingReport === "salon-csv" ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
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
                      <span className="loading loading-spinner loading-sm"></span>
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

          {/* Expedientes de Estudiantes */}
          <div className="card bg-base-100 shadow-md border border-base-300 rounded-xl">
            <div className="card-body">
              <h2 className="card-title text-lg mb-4">Expedientes de Estudiantes</h2>

              {loadingEstudiantes ? (
                <div className="flex justify-center py-12">
                  <span className="loading loading-spinner loading-lg"></span>
                </div>
              ) : estudiantes.length === 0 ? (
                <div className="text-center py-12 text-base-content/60">
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
                      {estudiantes.map((estudiante) => (
                        <tr key={estudiante.idalumno} className="hover">
                          <td className="font-medium">
                            {estudiante.nombre} {estudiante.apellidopaterno}
                          </td>
                          <td className="text-center">{estudiante.escenarios_completados}</td>
                          <td className="text-center">{estudiante.total_intentos}</td>
                          <td className="text-center">
                            {estudiante.promedio_puntuacion.toFixed(1)}
                          </td>
                          <td className="text-center">
                            {estudiante.mejor_puntuacion.toFixed(1)}
                          </td>
                          <td className="text-center">{estudiante.tiempo_total_minutos}m</td>
                          <td className="text-center">
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() =>
                                  handleDownloadStudentReport(
                                    estudiante.idalumno,
                                    `${estudiante.nombre} ${estudiante.apellidopaterno}`,
                                    "csv"
                                  )
                                }
                                disabled={
                                  loadingReport ===
                                  `student-${estudiante.idalumno}-csv`
                                }
                                className="btn btn-xs btn-ghost"
                                title="Descargar CSV"
                              >
                                {loadingReport ===
                                `student-${estudiante.idalumno}-csv` ? (
                                  <span className="loading loading-spinner loading-xs"></span>
                                ) : (
                                  <File size={14} />
                                )}
                              </button>
                              <button
                                onClick={() =>
                                  handleDownloadStudentReport(
                                    estudiante.idalumno,
                                    `${estudiante.nombre} ${estudiante.apellidopaterno}`,
                                    "pdf"
                                  )
                                }
                                disabled={
                                  loadingReport ===
                                  `student-${estudiante.idalumno}-pdf`
                                }
                                className="btn btn-xs btn-ghost"
                                title="Descargar PDF"
                              >
                                {loadingReport ===
                                `student-${estudiante.idalumno}-pdf` ? (
                                  <span className="loading loading-spinner loading-xs"></span>
                                ) : (
                                  <FileText size={14} />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Reportes;
