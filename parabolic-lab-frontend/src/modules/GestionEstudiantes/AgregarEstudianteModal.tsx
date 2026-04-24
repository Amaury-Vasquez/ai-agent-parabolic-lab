"use client";
import { Button, Input } from "amvasdev-ui";
import { useState } from "react";
import { useAgregarEstudiante } from "@/mutations/useAgregarEstudiante";

interface AgregarEstudianteModalProps {
  isOpen: boolean;
  onClose: () => void;
  salonId: string;
}

const AgregarEstudianteModal = ({
  isOpen,
  onClose,
  salonId,
}: AgregarEstudianteModalProps) => {
  const { agregarEstudiante, isPending } =
    useAgregarEstudiante();
  const [correo, setCorreo] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleAgregar = async () => {
    if (!correo.trim()) {
      setError("El correo electrónico es requerido");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      setError("Ingresa un correo electrónico válido");
      return;
    }

    try {
      await agregarEstudiante({ salonId, correoAlumno: correo });
      setCorreo("");
      setError(null);
      onClose();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Error desconocido";
      setError(`Error: ${errorMsg}`);
    }
  };

  const handleCancel = () => {
    setCorreo("");
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <dialog className="modal modal-open">
      <form method="dialog" className="modal-box">
        <h3 className="font-bold text-lg mb-4">Agregar Estudiante</h3>

        <div className="space-y-4">
          <div>
            <label className="label">
              <span className="label-text">Correo Electrónico del Estudiante</span>
            </label>
            <Input
              id="correo-estudiante"
              type="email"
              value={correo}
              onChange={(e) => {
                setCorreo(e.currentTarget.value);
                setError(null);
              }}
              placeholder="estudiante@ejemplo.com"
              className={error ? "input-error" : ""}
              disabled={isPending}
            />
            {error ? (
              <label className="label">
                <span className="label-text-alt text-error">{error}</span>
              </label>
            ) : null}
          </div>

          <p className="text-sm opacity-60">
            Ingresa el correo electrónico del estudiante registrado en el
            sistema. Se le enviará una invitación para unirse a este salón.
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
            onClick={handleAgregar}
            disabled={isPending || !correo.trim()}
          >
            {isPending ? "Agregando..." : "Agregar"}
          </Button>
        </div>
      </form>
      <form method="dialog" className="modal-backdrop" onClick={handleCancel}>
        <button>close</button>
      </form>
    </dialog>
  );
};

export default AgregarEstudianteModal;
