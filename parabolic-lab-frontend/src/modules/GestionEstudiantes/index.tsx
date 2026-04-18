"use client";
import { useState } from "react";
import { Button, Badge } from "amvasdev-ui";
import { Plus, Trash2, Eye } from "lucide-react";
import { useEstudiantesBySalon } from "@/queries/useEstudiantesBySalon";
import { useDarDeBajaEstudiante } from "@/mutations/useDarDeBajaEstudiante";
import AgregarEstudianteModal from "./AgregarEstudianteModal";
import { EstudianteEnSalon } from "@/fetchers/salones";
import { useRouter } from "next/navigation";

interface GestionEstudiantesProps {
  salonId: string;
}

const GestionEstudiantes = ({ salonId }: GestionEstudiantesProps) => {
  const router = useRouter();
  const [isAgregarModalOpen, setIsAgregarModalOpen] = useState(false);
  const { data: estudiantes, isLoading } = useEstudiantesBySalon(salonId);
  const { mutateAsync: darDeBaja } = useDarDeBajaEstudiante();

  const handleDarDeBaja = async (estudiante: EstudianteEnSalon) => {
    if (
      window.confirm(
        `¿Estás seguro de que deseas dar de baja a ${estudiante.nombre} ${estudiante.apellido}? Esta acción no se puede deshacer.`
      )
    ) {
      try {
        await darDeBaja({ salonId, idalumno: estudiante.idalumno });
      } catch (error) {
        console.error("Error al dar de baja:", error);
        alert("Hubo un error al dar de baja al estudiante.");
      }
    }
  };

  const handleVerDetalle = (idalumno: string) => {
    router.push(`/docente/salon/${salonId}/estudiantes/${idalumno}`);
  };

  const formatearFecha = (fecha: string | null): string => {
    if (!fecha) return "Sin acceso";
    try {
      const date = new Date(fecha);
      const options: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "short",
        day: "numeric",
      };
      return date.toLocaleDateString("es-ES", options);
    } catch {
      return "Fecha inválida";
    }
  };

  const calcularPorcentajeprogreso = (
    completados: number,
    total: number
  ): number => {
    return total > 0 ? (completados / total) * 100 : 0;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Gestión de Estudiantes</h1>
          <p className="opacity-60">
            Total: {estudiantes?.length || 0} estudiante
            {estudiantes && estudiantes.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setIsAgregarModalOpen(true)}
          className="gap-2"
        >
          <Plus size={18} />
          Agregar Estudiante
        </Button>
      </div>

      {isAgregarModalOpen ? (
        <AgregarEstudianteModal
          isOpen={isAgregarModalOpen}
          onClose={() => setIsAgregarModalOpen(false)}
          salonId={salonId}
        />
      ) : null}

      {!estudiantes || estudiantes.length === 0 ? (
        <div className="card bg-base-200">
          <div className="card-body items-center justify-center h-64">
            <p className="text-center opacity-60">
              No hay estudiantes en este salón aún
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsAgregarModalOpen(true)}
              className="gap-2 mt-4"
            >
              <Plus size={16} />
              Agregar primero estudiante
            </Button>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto bg-base-100 rounded-lg border border-base-300">
          <table className="table w-full">
            <thead>
              <tr className="bg-base-300">
                <th>Nombre</th>
                <th>Correo</th>
                <th>Último Acceso</th>
                <th>Progreso</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {estudiantes.map((estudiante) => (
                <tr key={estudiante.idalumno} className="hover:bg-base-200">
                  <td>
                    <div className="font-medium">
                      {estudiante.nombre} {estudiante.apellido}
                    </div>
                  </td>
                  <td>
                    <div className="text-sm opacity-60">{estudiante.correo}</div>
                  </td>
                  <td>
                    <span className="text-sm">
                      {formatearFecha(estudiante.ultimo_acceso)}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <progress
                        className="progress progress-primary h-2 w-28"
                        value={calcularPorcentajeprogreso(
                          estudiante.escenarios_completados,
                          estudiante.total_escenarios
                        )}
                        max="100"
                      ></progress>
                      <span className="text-sm min-w-fit">
                        {estudiante.escenarios_completados}/
                        {estudiante.total_escenarios}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleVerDetalle(estudiante.idalumno)}
                        title="Ver detalle del estudiante"
                      >
                        <Eye size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDarDeBaja(estudiante)}
                        className="hover:bg-error hover:bg-opacity-20"
                        title="Dar de baja al estudiante"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default GestionEstudiantes;
