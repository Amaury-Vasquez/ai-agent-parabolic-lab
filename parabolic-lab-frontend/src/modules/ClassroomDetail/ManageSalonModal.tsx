"use client";
import { Button, Input } from "amvasdev-ui";
import { useState } from "react";
import { useUpdateSalon } from "@/mutations/useUpdateSalon";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  const { mutateAsync: actualizarSalon, isPending } = useUpdateSalon();
  const [nuevoNombre, setNuevoNombre] = useState(salonNombre);
  const [error, setError] = useState<string | null>(null);

  const handleActualizar = async () => {
    if (!nuevoNombre.trim()) {
      setError("El nombre del salón no puede estar vacío");
      return;
    }

    try {
      await actualizarSalon({ idsalon: salonId, nombresalon: nuevoNombre });
      onClose();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Error desconocido";
      setError(`Error al actualizar: ${errorMsg}`);
    }
  };

  const handleCancel = () => {
    setNuevoNombre(salonNombre);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <dialog className="modal modal-open">
      <form method="dialog" className="modal-box">
        <h3 className="font-bold text-lg mb-4">Gestionar Salón</h3>

        <div className="space-y-4">
          <div>
            <label className="label">
              <span className="label-text">Nombre del Salón</span>
            </label>
            <Input
              id="nombre-salon"
              type="text"
              value={nuevoNombre}
              onChange={(e) => {
                setNuevoNombre(e.currentTarget.value);
                setError(null);
              }}
              placeholder="Nombre del salón"
              className={error ? "input-error" : ""}
            />
            {error ? (
              <label className="label">
                <span className="label-text-alt text-error">{error}</span>
              </label>
            ) : null}
          </div>

          <p className="text-sm opacity-60">
            Cambiar el nombre del salón no afecta los escenarios asignados ni el progreso de los estudiantes.
          </p>
        </div>

        <div className="modal-action">
          <Button
            variant="ghost"
            onClick={handleCancel}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleActualizar}
            disabled={isPending || nuevoNombre === salonNombre}
          >
            {isPending ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>
      </form>
      <form method="dialog" className="modal-backdrop" onClick={handleCancel}>
        <button>close</button>
      </form>
    </dialog>
  );
};

export default ManageSalonModal;
