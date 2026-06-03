"use client";
import { Button, Input, Modal } from "amvasdev-ui";
import { useState } from "react";
import { useDesasignarEscenario } from "@/mutations/useDesasignarEscenario";
import { useUpdateSalon } from "@/mutations/useUpdateSalon";
import type { Salon } from "@/types/salon";

interface SalonConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  salon: Salon;
}

const SalonConfigModal = ({ isOpen, onClose, salon }: SalonConfigModalProps) => {
  const [nombreSalon, setNombreSalon] = useState(salon.nombresalon);
  const { mutate: updateSalon, isPending: isUpdating } = useUpdateSalon();
  // Quita el escenario del salón sin borrarlo de la biblioteca; la
  // eliminación definitiva solo se hace desde docente/biblioteca.
  const { mutate: desasignarEscenario, isPending: isDesasignando } =
    useDesasignarEscenario();

  const handleSaveName = () => {
    if (nombreSalon.trim() === "") return;
    updateSalon({ idsalon: salon.idsalon, nombresalon: nombreSalon });
  };

  if (!isOpen) return null;

  return (
    <Modal onClose={onClose} title={`Configuración de "${salon.nombresalon}"`}>
      <div className="flex flex-col py-4 gap-6">
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
                    disabled={isDesasignando}
                    onClick={() => desasignarEscenario(escenario.idescenario)}
                  >
                    Quitar del salón
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
