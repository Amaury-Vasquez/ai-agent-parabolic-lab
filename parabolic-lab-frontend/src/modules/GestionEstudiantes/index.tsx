"use client";
import { Button, Modal } from "amvasdev-ui";
import { Eye, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { EstudianteEnSalon } from "@/models/estudiante";
import { useDarDeBajaEstudiante } from "@/mutations/useDarDeBajaEstudiante";
import { useEstudiantesBySalon } from "@/queries/useEstudiantesBySalon";
import AgregarEstudianteModal from "./AgregarEstudianteModal";

interface GestionEstudiantesProps {
  salonId: string;
}

const formatearFecha = (fecha: string | null): string => {
  if (!fecha) return "Sin acceso";
  const date = new Date(fecha);
  if (Number.isNaN(date.getTime())) return "Fecha inválida";
  return date.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const calcularPorcentajeProgreso = (
  completados: number,
  total: number,
): number => (total > 0 ? (completados / total) * 100 : 0);

const GestionEstudiantes = ({ salonId }: GestionEstudiantesProps) => {
  const router = useRouter();
  const [isAgregarModalOpen, setIsAgregarModalOpen] = useState(false);
  const [estudianteABajar, setEstudianteABajar] =
    useState<EstudianteEnSalon | null>(null);
  const [bajaError, setBajaError] = useState<string | null>(null);

  const { data: estudiantes, isLoading } = useEstudiantesBySalon(salonId);
  const { mutate: darDeBaja, isPending: isBajaPending } =
    useDarDeBajaEstudiante();

  const handleConfirmarBaja = () => {
    if (!estudianteABajar) return;
    setBajaError(null);
    darDeBaja(
      { salonId, idalumno: estudianteABajar.idalumno },
      {
        onSuccess: () => setEstudianteABajar(null),
        onError: () =>
          setBajaError("No se pudo dar de baja al estudiante. Intenta nuevamente."),
      },
    );
  };

  const handleCerrarBaja = () => {
    setEstudianteABajar(null);
    setBajaError(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  const total = estudiantes?.length ?? 0;

  return (
    <div className="p-8">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Gestión de Estudiantes</h1>
          <p className="opacity-60">
            Total: {total} estudiante{total !== 1 ? "s" : ""}
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
              Agregar primer estudiante
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
                      {estudiante.nombre} {[estudiante.apellidopaterno, estudiante.apellidomaterno].filter(Boolean).join(" ")}
                    </div>
                  </td>
                  <td>
                    <div className="text-sm opacity-60">
                      {estudiante.email}
                    </div>
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
                        value={calcularPorcentajeProgreso(
                          estudiante.escenarios_completados,
                          estudiante.total_escenarios,
                        )}
                        max="100"
                      />
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
                        onClick={() =>
                          router.push(
                            `/docente/salon/${salonId}/estudiantes/${estudiante.idalumno}`,
                          )
                        }
                        title="Ver detalle del estudiante"
                      >
                        <Eye size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEstudianteABajar(estudiante);
                          setBajaError(null);
                        }}
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

      {estudianteABajar ? (
        <Modal
          onClose={handleCerrarBaja}
          title="Dar de baja al estudiante"
          confirmButton={{
            children: isBajaPending ? "Procesando..." : "Confirmar",
            variant: "error",
            onClick: handleConfirmarBaja,
            disabled: isBajaPending,
          }}
        >
          <div className="flex flex-col gap-2 py-4">
            <p>
              ¿Seguro que deseas dar de baja a{" "}
              <strong>
                {estudianteABajar.nombre} {[estudianteABajar.apellidopaterno, estudianteABajar.apellidomaterno].filter(Boolean).join(" ")}
              </strong>
              ? Esta acción no se puede deshacer.
            </p>
            {bajaError ? (
              <p className="text-error text-sm">{bajaError}</p>
            ) : null}
          </div>
        </Modal>
      ) : null}
    </div>
  );
};

export default GestionEstudiantes;
