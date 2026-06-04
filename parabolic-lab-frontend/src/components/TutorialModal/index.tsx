"use client";
import { Button } from "amvasdev-ui";
import { useState } from "react";
import {
  DOCENTE_TUTORIAL_PASOS,
  type PasoTutorial,
} from "@/constants/tutorial";

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Pasos a mostrar; por defecto, el recorrido del docente.
  pasos?: PasoTutorial[];
}

const TutorialModal = ({
  isOpen,
  onClose,
  pasos = DOCENTE_TUTORIAL_PASOS,
}: TutorialModalProps) => {
  const [paso, setPaso] = useState(0);
  const pasoActual = pasos[paso];
  const esUltimo = paso === pasos.length - 1;

  if (!isOpen) return null;

  const handleClose = () => {
    onClose();
    setPaso(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-base-100 border border-base-300 rounded-2xl shadow-2xl w-full max-w-md mx-auto p-8 flex flex-col gap-6 relative">
        {/* Close button */}
        <Button
          variant="ghost"
          size="sm"
          className="btn-square absolute top-4 right-4"
          onClick={handleClose}
        >
          ×
        </Button>

        {/* Step body */}
        <div className="flex flex-col items-center gap-3 pt-2">
          <span className="text-center text-5xl mb-2 select-none">
            {pasoActual.emoji}
          </span>
          <h2 className="text-xl font-bold text-center text-base-content">
            {pasoActual.titulo}
          </h2>
          <p className="text-sm text-center text-base-content/70 leading-relaxed">
            {pasoActual.descripcion}
          </p>
        </div>

        {/* Step indicators */}
        <div className="flex justify-center gap-2 mt-2">
          {pasos.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${i === paso ? "bg-primary scale-125" : "bg-base-300"
                }`}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-2">
          <Button
            variant="ghost"
            disabled={paso === 0}
            onClick={() => setPaso((p) => p - 1)}
          >
            Atrás
          </Button>
          {esUltimo ? (
            <Button
              variant="primary"
              className="active:scale-95"
              onClick={handleClose}
            >
              ¡Empezar!
            </Button>
          ) : (
            <Button
              variant="primary"
              className="active:scale-95"
              onClick={() => setPaso((p) => p + 1)}
            >
              Siguiente
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TutorialModal;
