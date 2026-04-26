"use client";
import { Modal } from "amvasdev-ui";
import { useState } from "react";
import { useAsignarEscenario } from "@/mutations/useAsignarEscenario";
import type { Scenario } from "@/models/scenario";
import type { Salon } from "@/types/salon";

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
  const [selectedSalon, setSelectedSalon] = useState<string>("");

  const { mutate: asignar, isPending } = useAsignarEscenario();

  const handleConfirm = () => {
    if (selectedSalon.trim() === "") return;
    asignar({ idescenario: escenario.idescenario, idsalon: selectedSalon }, {
      onSuccess: () => {
        setSelectedSalon("");
        onClose();
      },
      onError: () => {
        alert(
          "Error al asignar el escenario. Por favor, intenta de nuevo."
        );
      },
    });
  };

  const handleCancel = () => {
    setSelectedSalon("");
    onClose();
  };

  return isOpen ? (
    <Modal
      onClose={handleCancel}
      title={`Asignar "${escenario.nombre}" a Salón`}
      confirmButton={{
        children: isPending ? "Asignando..." : "Asignar",
        variant: "primary",
        onClick: handleConfirm,
        disabled: selectedSalon.trim() === "" || isPending,
      }}
    >
      <div className="flex flex-col py-4 gap-4">
        <div>
          <label className="label">
            <span className="label-text">Selecciona un salón</span>
          </label>
          <select
            className="select select-bordered w-full"
            value={selectedSalon}
            onChange={(e) => setSelectedSalon(e.target.value)}
            disabled={isPending || !salones || salones.length === 0}
          >
            <option value="">-- Elige un salón --</option>
            {salones?.map((salon) => (
              <option key={salon.idsalon} value={salon.idsalon}>
                {salon.nombresalon}
              </option>
            ))}
          </select>
        </div>
      </div>
    </Modal>
  ) : null;
};

export default AsignarEscenarioModal;
