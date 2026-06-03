"use client";
import { Activity } from "lucide-react";
import { useState } from "react";
import AlumnoCard from "./AlumnoCard";
import AlumnoRow from "./AlumnoRow";
import ReporteAlumnoAdmin from "./ReporteAlumnoAdmin";
import BackButton from "@/components/BackButton";
import useIsMobileOrTablet from "@/hooks/useIsMobileOrTablet";
import { useAdminAlumnosActividad } from "@/queries/useAdminAlumnosActividad";
import type { AdminAlumnoActividadRow } from "@/types/admin";

const AdminActividad = () => {
  const isMobileOrTablet = useIsMobileOrTablet();
  const { data: alumnos, isLoading } = useAdminAlumnosActividad();
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState<{
    idalumno: string;
    nombre: string;
  } | null>(null);

  const handleVerReporte = (alumno: AdminAlumnoActividadRow) => {
    const fullName = [
      alumno.nombre,
      alumno.apellidopaterno,
      alumno.apellidomaterno,
    ]
      .filter(Boolean)
      .join(" ");
    setAlumnoSeleccionado({ idalumno: alumno.idalumno, nombre: fullName });
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <BackButton />
          <h1 className="text-2xl md:text-3xl font-bold">
            Actividad de Alumnos
          </h1>
        </div>
        <p className="text-sm md:text-base opacity-70">
          Resumen del progreso de cada alumno en todos sus salones
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg" />
        </div>
      ) : !alumnos || alumnos.length === 0 ? (
        <div className="flex flex-col items-center text-center py-12 gap-2 opacity-70">
          <Activity size={32} />
          <p>Aún no hay actividad de alumnos registrada.</p>
        </div>
      ) : isMobileOrTablet ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {alumnos.map((alumno) => (
            <AlumnoCard
              key={alumno.idalumno}
              alumno={alumno}
              onVerReporte={handleVerReporte}
            />
          ))}
        </div>
      ) : (
        <div className="bg-base-100 border border-base-300 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Alumno</th>
                  <th>Matrícula</th>
                  <th>Salones</th>
                  <th>Interacciones</th>
                  <th>Completados</th>
                  <th>Promedio</th>
                  <th>Tiempo</th>
                  <th>Estado</th>
                  <th>Reporte</th>
                </tr>
              </thead>
              <tbody>
                {alumnos.map((alumno) => (
                  <AlumnoRow
                    key={alumno.idalumno}
                    alumno={alumno}
                    onVerReporte={handleVerReporte}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {alumnoSeleccionado ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-base-100 rounded-2xl shadow-2xl w-full max-w-2xl my-4 overflow-hidden">
            <ReporteAlumnoAdmin
              idalumno={alumnoSeleccionado.idalumno}
              nombreAlumno={alumnoSeleccionado.nombre}
              onClose={() => setAlumnoSeleccionado(null)}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default AdminActividad;
