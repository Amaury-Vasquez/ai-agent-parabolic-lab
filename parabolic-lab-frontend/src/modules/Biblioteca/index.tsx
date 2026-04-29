"use client";
import { Button, Modal } from "amvasdev-ui";
import { BookOpen, Pencil, Plus, Share2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Scenario } from "@/models/scenario";
import { useDeleteEscenario } from "@/mutations/useDeleteEscenario";
import { useMisEscenarios } from "@/queries/useMisEscenarios";
import { useMySalones } from "@/queries/useMySalones";
import AsignarEscenarioModal from "./AsignarEscenarioModal";

const DIFFICULTY_COLORS: Record<string, string> = {
  principiante: "badge-success",
  intermedio: "badge-warning",
  avanzado: "badge-error",
  experto: "badge-error",
};

const DIFFICULTY_LABELS: Record<string, string> = {
  principiante: "Básico",
  intermedio: "Intermedio",
  avanzado: "Avanzado",
  experto: "Experto",
};

const Biblioteca = () => {
  const router = useRouter();
  const { data: escenarios, isLoading } = useMisEscenarios();
  const { data: salones } = useMySalones();
  const { mutate: eliminarEscenario, isPending: isDeleting } =
    useDeleteEscenario();

  const [isAsignarModalOpen, setIsAsignarModalOpen] = useState(false);
  const [escenarioSeleccionado, setEscenarioSeleccionado] =
    useState<Scenario | null>(null);
  const [escenarioAEliminar, setEscenarioAEliminar] =
    useState<Scenario | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const getSalonNombre = (idsalon: string) => {
    const salon = salones?.find((s) => s.idsalon === idsalon);
    return salon?.nombresalon ?? "Salón desconocido";
  };

  const handleConfirmarEliminacion = () => {
    if (!escenarioAEliminar) return;
    setDeleteError(null);
    eliminarEscenario(escenarioAEliminar.idescenario, {
      onSuccess: () => {
        setEscenarioAEliminar(null);
      },
      onError: () => {
        setDeleteError(
          "No se pudo eliminar el escenario. Intenta nuevamente.",
        );
      },
    });
  };

  const handleCerrarConfirmacion = () => {
    setEscenarioAEliminar(null);
    setDeleteError(null);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold">Biblioteca de Escenarios</h1>
          <p className="mt-1 opacity-70">
            Gestiona todos tus escenarios de tiro parabólico
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => router.push("/docente/biblioteca/nuevo")}
        >
          <Plus size={16} />
          Crear Escenario
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg" />
        </div>
      ) : escenarios && escenarios.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {escenarios.map((escenario) => (
            <div
              key={escenario.idescenario}
              className="bg-base-200 rounded-xl p-5 flex flex-col gap-3 border border-base-300"
            >
              <div className="flex justify-between items-start gap-2">
                <h2 className="font-bold text-lg leading-tight">
                  {escenario.nombre}
                </h2>
                <span
                  className={`badge ${DIFFICULTY_COLORS[escenario.niveldificultad] ?? "badge-ghost"} badge-sm shrink-0`}
                >
                  {DIFFICULTY_LABELS[escenario.niveldificultad] ?? escenario.niveldificultad}
                </span>
              </div>

              {escenario.descripcion ? (
                <p className="text-sm opacity-70 line-clamp-2">
                  {escenario.descripcion}
                </p>
              ) : null}

              <div className="flex items-center gap-2 text-sm opacity-60">
                <BookOpen size={14} />
                <span>{getSalonNombre(escenario.idsalon)}</span>
              </div>

              <div className="flex gap-3 text-xs opacity-60">
                {escenario.tiempolimite ? (
                  <span>⏱ {Math.round(escenario.tiempolimite / 60)} min</span>
                ) : null}
                <span>🎯 {escenario.intentospermitidos} intentos</span>
                <span className="capitalize">
                  {escenario.tipoescenario?.replace("_", " ")}
                </span>
              </div>

              <div className="flex gap-2 mt-auto pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1"
                  onClick={() =>
                    router.push(
                      `/docente/salon/${escenario.idsalon}/escenarios/${escenario.idescenario}/editar`
                    )
                  }
                >
                  <Pencil size={14} />
                  Editar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    setEscenarioSeleccionado(escenario);
                    setIsAsignarModalOpen(true);
                  }}
                >
                  <Share2 size={14} />
                  Asignar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEscenarioAEliminar(escenario);
                    setDeleteError(null);
                  }}
                  className="hover:bg-error hover:bg-opacity-20"
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 opacity-60">
          <BookOpen size={48} className="mx-auto mb-4 opacity-40" />
          <p className="text-lg font-medium">No tienes escenarios creados aún</p>
          <p className="text-sm mt-1">
            Crea tu primer escenario para asignarlo a tus salones
          </p>
        </div>
      )}
      {escenarioSeleccionado ? (
        <AsignarEscenarioModal
          isOpen={isAsignarModalOpen}
          onClose={() => {
            setIsAsignarModalOpen(false);
            setEscenarioSeleccionado(null);
          }}
          escenario={escenarioSeleccionado}
          salones={salones}
        />
      ) : null}
      {escenarioAEliminar ? (
        <Modal
          onClose={handleCerrarConfirmacion}
          title="Eliminar escenario"
          confirmButton={{
            children: isDeleting ? "Eliminando..." : "Eliminar",
            variant: "error",
            onClick: handleConfirmarEliminacion,
            disabled: isDeleting,
          }}
        >
          <div className="flex flex-col gap-2 py-4">
            <p>
              ¿Seguro que deseas eliminar el escenario{" "}
              <strong>{escenarioAEliminar.nombre}</strong>? Esta acción no se
              puede deshacer.
            </p>
            {deleteError ? (
              <p className="text-error text-sm">{deleteError}</p>
            ) : null}
          </div>
        </Modal>
      ) : null}
    </div>
  );
};

export default Biblioteca;