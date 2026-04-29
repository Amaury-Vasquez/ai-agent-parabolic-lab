"use client";
import { Input, Modal } from "amvasdev-ui";
import { useState } from "react";
import { useAgregarEstudiante } from "@/mutations/useAgregarEstudiante";

interface AgregarEstudianteModalProps {
  isOpen: boolean;
  onClose: () => void;
  salonId: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const AgregarEstudianteModal = ({
  isOpen,
  onClose,
  salonId,
}: AgregarEstudianteModalProps) => {
  const { mutate: agregarEstudiante, isPending } = useAgregarEstudiante();
  const [correo, setCorreo] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleAgregar = () => {
    if (!correo.trim()) {
      setError("El correo electrónico es requerido");
      return;
    }
    if (!EMAIL_REGEX.test(correo)) {
      setError("Ingresa un correo electrónico válido");
      return;
    }

    setError(null);
    agregarEstudiante(
      { salonId, correoAlumno: correo },
      {
        onSuccess: () => {
          setCorreo("");
          onClose();
        },
        onError: (err) =>
          setError(
            err instanceof Error
              ? err.message
              : "Error al agregar estudiante",
          ),
      },
    );
  };

  const handleCancel = () => {
    setCorreo("");
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal
      onClose={handleCancel}
      title="Agregar Estudiante"
      confirmButton={{
        children: isPending ? "Agregando..." : "Agregar",
        variant: "primary",
        onClick: handleAgregar,
        disabled: isPending || !correo.trim(),
      }}
    >
      <div className="flex flex-col gap-4 py-4">
        <div>
          <label className="label">
            <span className="label-text">
              Correo Electrónico del Estudiante
            </span>
          </label>
          <Input
            id="estudiante-correo"
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
    </Modal>
  );
};

export default AgregarEstudianteModal;
