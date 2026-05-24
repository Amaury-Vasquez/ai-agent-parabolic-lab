"use client";
import { Button, Modal } from "amvasdev-ui";
import { ArrowLeft, BookOpen, ClipboardList, Pencil, Plus, Share2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { Scenario } from "@/models/scenario";
import EmptyState from "@/components/EmptyState";
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
  const [sortBy, setSortBy] = useState("reciente");

  const DIFFICULTY_ORDER: Record<string, number> = {
    principiante: 0,
    intermedio: 1,
    avanzado: 2,
    experto: 3,
  };

  const escenariosOrdenados = useMemo(() => {
    if (!escenarios) return [];
    const sorted = [...escenarios];
    switch (sortBy) {
      case "alfabetico":
        return sorted.sort((a, b) => a.nombre.localeCompare(b.nombre));
      case "dificultad":
        return sorted.sort(
          (a, b) =>
            (DIFFICULTY_ORDER[a.niveldificultad] ?? 99) -
            (DIFFICULTY_ORDER[b.niveldificultad] ?? 99),
        );
      case "tipo":
        return sorted.sort((a, b) =>
          (a.tipoescenario ?? "").localeCompare(b.tipoescenario ?? ""),
        );
      default:
        return sorted;
    }
  }, [escenarios, sortBy]);

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
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6 md:mb-8">
        <div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="btn btn-ghost btn-square btn-sm"
              title="Regresar"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-2xl md:text-3xl font-bold">
              Biblioteca de escenarios
            </h1>
          </div>
          <p className="mt-1 text-sm md:text-base opacity-70">
            Gestiona todos tus escenarios de tiro parabólico
          </p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <select
            className="select select-bordered select-sm"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="reciente">Más reciente</option>
            <option value="alfabetico">Alfabético A-Z</option>
            <option value="dificultad">Por dificultad</option>
            <option value="tipo">Por tipo</option>
          </select>
          <Button
            variant="primary"
            onClick={() => router.push("/docente/biblioteca/nuevo")}
          >
            <Plus size={16} />
            Crear escenario
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg" />
        </div>
      ) : escenariosOrdenados.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {escenariosOrdenados.map((escenario) => (
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

              <div className="flex flex-wrap gap-2 mt-auto pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 min-w-[80px]"
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
                  className="flex-1 min-w-[80px]"
                  onClick={() =>
                    router.push(
                      `/docente/salon/${escenario.idsalon}/escenarios/${escenario.idescenario}/respuestas`
                    )
                  }
                >
                  <ClipboardList size={14} />
                  Respuestas
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 min-w-[80px]"
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
        <EmptyState
          emoji="🔬"
          title="Tu biblioteca está vacía"
          subtitle="Crea escenarios de simulación y asígnalos a tus grupos."
          actionLabel="+ Crear escenario"
          onAction={() => router.push("/docente/biblioteca/nuevo")}
        />
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