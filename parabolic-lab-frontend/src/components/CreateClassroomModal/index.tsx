"use client";
import { Input, Modal } from "amvasdev-ui";
import { useState } from "react";
import { useCreateSalon } from "@/queries/useCreateSalon";

interface CreateClassroomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateClassroomModal = ({ isOpen, onClose }: CreateClassroomModalProps) => {
  const [classroomName, setClassroomName] = useState("");
  const { mutate: crearSalon, isPending } = useCreateSalon();

  const handleConfirm = () => {
    if (classroomName.trim() === "") return;
    crearSalon(
      { nombresalon: classroomName.trim() },
      {
        onSuccess: () => {
          setClassroomName("");
          onClose();
        },
        onError: () => {
          alert("Error al crear el salón. Intenta de nuevo.");
        },
      }
    );
  };

  const handleCancel = () => {
    setClassroomName("");
    onClose();
  };

  return isOpen ? (
    <Modal
      onClose={handleCancel}
      title="Crear Nuevo Salón"
      confirmButton={{
        children: isPending ? "Creando..." : "Crear Salón",
        variant: "primary",
        onClick: handleConfirm,
        disabled: classroomName.trim() === "" || isPending,
      }}
    >
      <div className="flex flex-col py-4 gap-4">
        <Input
          id="classroom-name"
          label="Nombre del Salón"
          placeholder="Física 101"
          value={classroomName}
          onChange={(e) => setClassroomName(e.currentTarget.value)}
        />
      </div>
    </Modal>
  ) : null;
};

export default CreateClassroomModal;