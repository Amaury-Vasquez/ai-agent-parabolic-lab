"use client";
import { Modal } from "amvasdev-ui";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useCookies } from "react-cookie";
import { asignarEscenario } from "@/fetchers/escenarios";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";
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
  const [cookies] = useCookies([ACCESS_TOKEN_COOKIE]);
  const token = cookies[ACCESS_TOKEN_COOKIE];

  const { mutate: asignar, isPending } = useMutation({
    mutationFn: (idsalon: string) =>
      asignarEscenario(token, escenario.idescenario, idsalon),
  });

  const handleConfirm = () => {
    if (selectedSalon.trim() === "") return;
    asignar(selectedSalon, {
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
