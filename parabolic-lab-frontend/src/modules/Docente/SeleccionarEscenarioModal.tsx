"use client";
import { Modal } from "amvasdev-ui";
import { useState } from "react";
import { useAsignarEscenario } from "@/mutations/useAsignarEscenario";
import { useMisEscenarios } from "@/queries/useMisEscenarios";
import type { Salon } from "@/types/salon";

interface SeleccionarEscenarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  salon: Salon;
}

const SeleccionarEscenarioModal = ({
  isOpen,
  onClose,
  salon,
}: SeleccionarEscenarioModalProps) => {
  const [selectedEscenario, setSelectedEscenario] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { data: escenarios } = useMisEscenarios();
  const { mutate: asignar, isPending } = useAsignarEscenario();

  const handleConfirm = () => {
    if (selectedEscenario.trim() === "") return;
    setError(null);
    asignar(
      { idescenario: selectedEscenario, idsalon: salon.idsalon },
      {
        onSuccess: () => {
          setSelectedEscenario("");
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
    setSelectedEscenario("");
    setError(null);
    onClose();
  };

  return isOpen ? (
    <Modal
      onClose={handleCancel}
      title={`Asignar Escenario a "${salon.nombresalon}"`}
      confirmButton={{
        children: isPending ? "Asignando..." : "Asignar",
        variant: "primary",
        onClick: handleConfirm,
        disabled: selectedEscenario.trim() === "" || isPending,
      }}
    >
      <div className="flex flex-col py-4 gap-4">
        <div>
          <label className="label">
            <span className="label-text">Selecciona un escenario</span>
          </label>
          <select
            className="select select-bordered w-full"
            value={selectedEscenario}
            onChange={(e) => setSelectedEscenario(e.target.value)}
            disabled={isPending || !escenarios || escenarios.length === 0}
          >
            <option value="">-- Elige un escenario --</option>
            {escenarios?.map((escenario) => (
              <option
                key={escenario.idescenario}
                value={escenario.idescenario}
              >
                {escenario.nombre}
              </option>
            ))}
          </select>
        </div>
        {error ? <p className="text-error text-sm">{error}</p> : null}
      </div>
    </Modal>
  ) : null;
};

export default SeleccionarEscenarioModal;
