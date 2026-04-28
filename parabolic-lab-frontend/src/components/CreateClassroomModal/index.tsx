"use client";
import { Input, Modal } from "amvasdev-ui";
import { useState } from "react";
import { useCreateSalon } from "@/mutations/useCreateSalon";

interface CreateClassroomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateClassroomModal = ({ isOpen, onClose }: CreateClassroomModalProps) => {
  const [classroomName, setClassroomName] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const { mutate: crearSalon, isPending } = useCreateSalon();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (classroomName.trim() === "") return;
    setError(false);
    crearSalon(
      { nombresalon: classroomName.trim() },
      {
        onSuccess: () => {
          setSuccess(true);
          setClassroomName("");
          setTimeout(() => {
            setSuccess(false);
            onClose();
          }, 1500);
        },
        onError: () => {
          setError(true);
        },
      }
    );
  };

  const handleCancel = () => {
    setClassroomName("");
    setSuccess(false);
    setError(false);
    onClose();
  };

  return isOpen ? (
    <Modal
      onClose={handleCancel}
      title="Crear Nuevo Salón"
      confirmButton={{
        children: isPending ? "Creando..." : "Crear Salón",
        variant: "primary",
        onClick: handleSubmit,
        disabled: classroomName.trim() === "" || isPending || success,
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="flex flex-col py-4 gap-4"
      >
        <Input
          id="classroom-name"
          label="Nombre del Salón"
          placeholder="Física 101"
          value={classroomName}
          onChange={(e) => setClassroomName(e.currentTarget.value)}
        />
        {success ? (
          <p className="text-success text-sm">
            ✓ Salón creado exitosamente
          </p>
        ) : null}
        {error ? (
          <p className="text-error text-sm">
            ✗ Error al crear el salón. Intenta de nuevo.
          </p>
        ) : null}
      </form>
    </Modal>
  ) : null;
};

export default CreateClassroomModal;