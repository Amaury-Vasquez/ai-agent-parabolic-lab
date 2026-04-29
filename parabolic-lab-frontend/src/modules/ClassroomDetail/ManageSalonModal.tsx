"use client";
import { Input, Modal } from "amvasdev-ui";
import { useState } from "react";
import { useUpdateSalon } from "@/mutations/useUpdateSalon";

interface ManageSalonModalProps {
  isOpen: boolean;
  onClose: () => void;
  salonId: string;
  salonNombre: string;
}

const ManageSalonModal = ({
  isOpen,
  onClose,
  salonId,
  salonNombre,
}: ManageSalonModalProps) => {
  const { mutate: actualizarSalon, isPending } = useUpdateSalon();
  const [nuevoNombre, setNuevoNombre] = useState(salonNombre);
  const [error, setError] = useState<string | null>(null);

  const handleActualizar = () => {
    if (!nuevoNombre.trim()) {
      setError("El nombre del salón no puede estar vacío");
      return;
    }

    setError(null);
    actualizarSalon(
      { idsalon: salonId, nombresalon: nuevoNombre },
      {
        onSuccess: () => onClose(),
        onError: (err) =>
          setError(
            err instanceof Error
              ? err.message
              : "Error al actualizar el salón",
          ),
      },
    );
  };

  const handleCancel = () => {
    setNuevoNombre(salonNombre);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal
      onClose={handleCancel}
      title="Gestionar Salón"
      confirmButton={{
        children: isPending ? "Guardando..." : "Guardar Cambios",
        variant: "primary",
        onClick: handleActualizar,
        disabled: isPending || nuevoNombre === salonNombre,
      }}
    >
      <div className="flex flex-col gap-4 py-4">
        <div>
          <label className="label">
            <span className="label-text">Nombre del Salón</span>
          </label>
          <Input
            id="salon-nombre"
            type="text"
            value={nuevoNombre}
            onChange={(e) => {
              setNuevoNombre(e.currentTarget.value);
              setError(null);
            }}
            placeholder="Física 101"
            className={error ? "input-error" : ""}
          />
          {error ? (
            <label className="label">
              <span className="label-text-alt text-error">{error}</span>
            </label>
          ) : null}
        </div>
        <p className="text-sm opacity-60">
          Cambiar el nombre del salón no afecta los escenarios asignados ni el
          progreso de los estudiantes.
        </p>
      </div>
    </Modal>
  );
};

export default ManageSalonModal;
