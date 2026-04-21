"use client";
import { Modal, Input, Button } from "amvasdev-ui";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCookies } from "react-cookie";
import { patch, del } from "@/services/api";
import { MY_SALONES_QUERY_KEY } from "@/fetchers/salones";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";
import type { Salon } from "@/types/salon";

interface SalonConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  salon: Salon;
}

const SalonConfigModal = ({
  isOpen,
  onClose,
  salon,
}: SalonConfigModalProps) => {
  const [nombreSalon, setNombreSalon] = useState(salon.nombresalon);
  const [cookies] = useCookies([ACCESS_TOKEN_COOKIE]);
  const token = cookies[ACCESS_TOKEN_COOKIE];
  const queryClient = useQueryClient();

  const { mutate: updateName, isPending: isUpdating } = useMutation({
    mutationFn: () =>
      patch(`/salones/${salon.idsalon}`, { nombresalon: nombreSalon }, { token }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MY_SALONES_QUERY_KEY });
    },
  });

  const { mutate: deleteEscenario } = useMutation({
    mutationFn: (idescenario: string) =>
      del(`/escenarios/${idescenario}`, { token }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MY_SALONES_QUERY_KEY });
    },
  });

  const handleSaveName = () => {
    if (nombreSalon.trim() === "") return;
    updateName();
  };

  const handleDeleteEscenario = (idescenario: string) => {
    deleteEscenario(idescenario);
  };

  if (!isOpen) return null;

  return (
    <Modal
      onClose={onClose}
      title={`Configuración de "${salon.nombresalon}"`}
    >
      <div className="flex flex-col py-4 gap-6">
        {/* Editar nombre del salón */}
        <div>
          <label className="label">
            <span className="label-text font-semibold">Nombre del salón</span>
          </label>
          <div className="flex gap-2">
            <Input
              id="salon-name-input"
              value={nombreSalon}
              onChange={(e) => setNombreSalon(e.currentTarget.value)}
              placeholder="Nombre del salón"
              className="flex-1"
            />
            <Button
              variant="primary"
              onClick={handleSaveName}
              disabled={
                isUpdating ||
                nombreSalon.trim() === "" ||
                nombreSalon === salon.nombresalon
              }
            >
              {isUpdating ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </div>

        {/* Lista de escenarios */}
        <div>
          <label className="label">
            <span className="label-text font-semibold">
              Escenarios asignados
            </span>
          </label>
          {salon.escenarios.length === 0 ? (
            <p className="text-sm opacity-50 italic">
              No hay escenarios asignados
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {salon.escenarios.map((escenario) => (
                <li
                  key={escenario.idescenario}
                  className="flex items-center justify-between bg-base-200 rounded-lg px-4 py-2"
                >
                  <span className="text-sm">{escenario.nombre}</span>
                  <Button
                    variant="error"
                    size="sm"
                    onClick={() =>
                      handleDeleteEscenario(escenario.idescenario)
                    }
                  >
                    Eliminar
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default SalonConfigModal;
