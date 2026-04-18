"use client";
import { Input, Modal } from "amvasdev-ui";
import { useState } from "react";
import { useCookies } from "react-cookie";
import useModalFormConfirm from "@/hooks/useModalFormConfirm";
import { Hash, Lightbulb } from "lucide-react";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";
import { unirseASalon } from "@/fetchers/salones";

interface JoinClassroomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const JoinClassroomModal = ({ isOpen, onClose }: JoinClassroomModalProps) => {
  const [classroomCode, setClassroomCode] = useState("");
  const { formRef, handleConfirmClick } = useModalFormConfirm();
  const [cookies] = useCookies([ACCESS_TOKEN_COOKIE]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = cookies[ACCESS_TOKEN_COOKIE];
    await unirseASalon(token, classroomCode);
    setClassroomCode("");
    onClose();
    window.location.reload();
  };

  const handleCancel = () => {
    setClassroomCode("");
    onClose();
  };

  return isOpen ? (
    <Modal
      onClose={handleCancel}
      title="Unirse a un Salón"
      confirmButton={{
        children: "Entrar al Salón",
        variant: "primary",
        onClick: handleConfirmClick,
        disabled: classroomCode.trim() === "",
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="flex flex-col py-4 gap-4"
        ref={formRef}
      >
        <p className="text-sm font-semibold">
          Ingresa el código que te dio tu profesor para unirte a su salón
        </p>
        <Input
          leftIcon={<Hash size="16" />}
          id="classroom-code"
          label="Código de Salón"
          placeholder="FISICA-2024-A1"
          value={classroomCode}
          onChange={(e) => setClassroomCode(e.currentTarget.value)}
          required
        />
        <div className="text-sm font-medium text-center flex items-center gap-2 justify-center">
          <Lightbulb className="text-accent" size="14" />
          <p>Pídele el código a tu profesor si no lo tienes</p>
        </div>
      </form>
    </Modal>
  ) : null;
};

export default JoinClassroomModal;
