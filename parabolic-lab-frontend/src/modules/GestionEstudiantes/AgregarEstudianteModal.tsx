"use client";
import { Input, Modal } from "amvasdev-ui";
import { useState } from "react";
import { useAgregarEstudiante } from "@/mutations/useAgregarEstudiante";

interface AgregarEstudianteModalProps {
  isOpen: boolean;
  onClose: () => void;
  salonId: string;
}

interface Feedback {
  type: "error" | "success";
  message: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function mapErrorToFeedback(err: unknown): Feedback {
  const message =
    err instanceof Error ? err.message : String(err);

  // The API service throws errors as "STATUS - detail"
  if (message.startsWith("404")) {
    return {
      type: "error",
      message: "No existe ningún usuario registrado con este correo.",
    };
  }
  if (message.startsWith("400") || message.startsWith("409")) {
    return {
      type: "error",
      message: "Este estudiante ya pertenece a tu salón.",
    };
  }
  if (message.startsWith("5")) {
    return {
      type: "error",
      message: "Ocurrió un error inesperado. Inténtalo más tarde.",
    };
  }
  // Generic fallback
  return {
    type: "error",
    message: "Ocurrió un error inesperado. Inténtalo más tarde.",
  };
}

const AgregarEstudianteModal = ({
  isOpen,
  onClose,
  salonId,
}: AgregarEstudianteModalProps) => {
  const { mutate: agregarEstudiante, isPending } = useAgregarEstudiante();
  const [correo, setCorreo] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const handleAgregar = () => {
    if (!correo.trim()) {
      setFeedback({
        type: "error",
        message: "El correo electrónico es requerido.",
      });
      return;
    }
    if (!EMAIL_REGEX.test(correo)) {
      setFeedback({
        type: "error",
        message: "Por favor, ingresa un correo electrónico válido.",
      });
      return;
    }

    setFeedback(null);
    agregarEstudiante(
      { salonId, correoAlumno: correo },
      {
        onSuccess: () => {
          setFeedback({
            type: "success",
            message: "¡Estudiante agregado correctamente!",
          });
          setTimeout(() => {
            setCorreo("");
            setFeedback(null);
            onClose();
          }, 1200);
        },
        onError: (err) => {
          setFeedback(mapErrorToFeedback(err));
        },
      },
    );
  };

  const handleCancel = () => {
    setCorreo("");
    setFeedback(null);
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
        disabled: isPending || !correo.trim() || feedback?.type === "success",
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
              setFeedback(null);
            }}
            placeholder="estudiante@ejemplo.com"
            className={feedback?.type === "error" ? "input-error" : ""}
            disabled={isPending || feedback?.type === "success"}
          />
          {feedback ? (
            <div
              className={`alert ${feedback.type === "error" ? "alert-error" : "alert-success"} text-sm mt-2`}
            >
              <span>{feedback.message}</span>
            </div>
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
