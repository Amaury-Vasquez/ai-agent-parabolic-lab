"use client";
import { Modal } from "amvasdev-ui";
import { useMemo, useState } from "react";
import type { Scenario } from "@/models/scenario";
import { useAsignarEscenario } from "@/mutations/useAsignarEscenario";
import type { Salon } from "@/types/salon";
import { isEscenarioAsignadoASalon } from "@/utils/escenarios";

interface AsignarEscenarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  escenario: Scenario;
  salones: Salon[] | undefined;
}

const AsignarEscenarioModal = ({
  isOpen,
  onClose,
  escenario,
  salones,
}: AsignarEscenarioModalProps) => {
  const [seleccionados, setSeleccionados] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { mutate: asignar, isPending } = useAsignarEscenario();

  // Salones donde el escenario aún no está asignado (los asignados se
  // muestran deshabilitados con su estado).
  const salonesDisponibles = useMemo(
    () =>
      (salones ?? []).filter(
        (salon) => !isEscenarioAsignadoASalon(escenario, salon),
      ),
    [salones, escenario],
  );

  const todosSeleccionados =
    salonesDisponibles.length > 0 &&
    seleccionados.length === salonesDisponibles.length;

  const toggleSalon = (idsalon: string) => {
    setSeleccionados((prev) =>
      prev.includes(idsalon)
        ? prev.filter((id) => id !== idsalon)
        : [...prev, idsalon],
    );
  };

  const toggleTodos = () => {
    setSeleccionados(
      todosSeleccionados ? [] : salonesDisponibles.map((s) => s.idsalon),
    );
  };

  const handleConfirm = () => {
    if (seleccionados.length === 0) return;
    setError(null);
    asignar(
      { idescenario: escenario.idescenario, idsalones: seleccionados },
      {
        onSuccess: () => {
          setSeleccionados([]);
          onClose();
        },
        onError: (err) => {
          setError(
            err instanceof Error
              ? err.message
              : "Error al asignar el escenario. Intenta de nuevo.",
          );
        },
      },
    );
  };

  const handleCancel = () => {
    setSeleccionados([]);
    setError(null);
    onClose();
  };

  return isOpen ? (
    <Modal
      onClose={handleCancel}
      title={`Asignar "${escenario.nombre}" a salones`}
      confirmButton={{
        children: isPending
          ? "Asignando..."
          : `Asignar${seleccionados.length > 0 ? ` (${seleccionados.length})` : ""}`,
        variant: "primary",
        onClick: handleConfirm,
        disabled: seleccionados.length === 0 || isPending,
      }}
    >
      <div className="flex flex-col py-4 gap-4">
        {(salones ?? []).length === 0 ? (
          <p className="text-sm opacity-60">
            Aún no tienes salones. Crea un salón para poder asignar
            escenarios.
          </p>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="label-text font-semibold">
                Selecciona los salones
              </span>
              {salonesDisponibles.length > 1 ? (
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-sm checkbox-primary"
                    checked={todosSeleccionados}
                    onChange={toggleTodos}
                    disabled={isPending}
                  />
                  Seleccionar todos
                </label>
              ) : null}
            </div>
            <ul className="flex flex-col gap-2 max-h-60 overflow-y-auto">
              {(salones ?? []).map((salon) => {
                const yaAsignado = isEscenarioAsignadoASalon(escenario, salon);

                return (
                  <li key={salon.idsalon}>
                    <label
                      className={`flex items-center justify-between bg-base-200 rounded-lg px-4 py-2 ${
                        yaAsignado ? "opacity-60" : "cursor-pointer"
                      }`}
                    >
                      <span className="flex items-center gap-3 text-sm">
                        <input
                          type="checkbox"
                          className="checkbox checkbox-sm checkbox-primary"
                          checked={
                            yaAsignado ||
                            seleccionados.includes(salon.idsalon)
                          }
                          onChange={() => toggleSalon(salon.idsalon)}
                          disabled={yaAsignado || isPending}
                        />
                        {salon.nombresalon}
                      </span>
                      {yaAsignado ? (
                        <span className="badge badge-ghost badge-sm">
                          Ya asignado
                        </span>
                      ) : null}
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
        {error ? <p className="text-error text-sm">{error}</p> : null}
      </div>
    </Modal>
  ) : null;
};

export default AsignarEscenarioModal;
