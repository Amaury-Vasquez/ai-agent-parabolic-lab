"use client";
import { Button } from "amvasdev-ui";
import { useEffect, useState } from "react";
import Toast, { ToastContainer } from "@/components/Toast";

interface TutorialPromptToastProps {
  // Clave de localStorage que marca el prompt como atendido (ver
  // TUTORIAL_PROMPT_STORAGE_KEYS en constants/tutorial.ts).
  storageKey: string;
  onAccept: () => void;
}

// Toast flotante que ofrece ver el tutorial. Se muestra solo hasta que el
// usuario lo acepta o lo descarta; la decisión persiste en localStorage.
const TutorialPromptToast = ({
  storageKey,
  onAccept,
}: TutorialPromptToastProps) => {
  const [visible, setVisible] = useState(false);

  // localStorage solo existe en el cliente: decidir la visibilidad tras el
  // montaje evita un mismatch de hidratación.
  useEffect(() => {
    setVisible(!window.localStorage.getItem(storageKey));
  }, [storageKey]);

  const dismiss = () => {
    window.localStorage.setItem(storageKey, new Date().toISOString());
    setVisible(false);
  };

  const handleAccept = () => {
    dismiss();
    onAccept();
  };

  return visible ? (
    <ToastContainer>
      <Toast
        icon="🎓"
        title="¡Hola! ¿Deseas ver un recorrido rápido por el sistema?"
        onClose={dismiss}
        actions={
          <>
            <Button
              variant="ghost"
              size="sm"
              className="text-base-content/60"
              onClick={dismiss}
            >
              No, gracias
            </Button>
            <Button variant="primary" size="sm" onClick={handleAccept}>
              Sí, ver tutorial
            </Button>
          </>
        }
      />
    </ToastContainer>
  ) : null;
};

export default TutorialPromptToast;
