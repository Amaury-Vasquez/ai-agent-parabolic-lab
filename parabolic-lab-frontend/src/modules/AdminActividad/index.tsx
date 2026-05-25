"use client";
import { Activity } from "lucide-react";
import AlumnoCard from "./AlumnoCard";
import AlumnoRow from "./AlumnoRow";
import useIsMobileOrTablet from "@/hooks/useIsMobileOrTablet";
import { useAdminAlumnosActividad } from "@/queries/useAdminAlumnosActividad";

const AdminActividad = () => {
  const isMobileOrTablet = useIsMobileOrTablet();
  const { data: alumnos, isLoading } = useAdminAlumnosActividad();

  return (
    <div className="p-4 md:p-6 lg:p-8 flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl md:text-3xl font-bold">Actividad de Alumnos</h1>
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
            <AlumnoCard key={alumno.idalumno} alumno={alumno} />
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
                </tr>
              </thead>
              <tbody>
                {alumnos.map((alumno) => (
                  <AlumnoRow key={alumno.idalumno} alumno={alumno} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminActividad;
