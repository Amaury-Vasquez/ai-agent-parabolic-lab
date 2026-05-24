"use client";
import { useState, useEffect } from "react";

const PASOS = [
  {
    emoji: "🚀",
    titulo: "¡Bienvenido a Parabolic-Lab!",
    descripcion:
      "Aquí podrás gestionar tus clases de física de manera interactiva con simulaciones de tiro parabólico.",
  },
  {
    emoji: "🏫",
    titulo: "Mis Salones",
    descripcion:
      "Crea salones con el botón '+'. Cada tarjeta tiene un engranaje para editar el nombre, ver y eliminar escenarios asignados, puedes ver los leaderboards de tus estudiantes inscritos en ese salón en VER PROGRESO.",
  },
  {
    emoji: "👥",
    titulo: "Ver Progreso",
    descripcion:
      "En VER PROGRESO puedes ver los leaderboards de tus estudiantes inscritos en ese salón, gestionar sus perfiles, presionando el boton de 👥 podras ver a detalle su fecha de inscripcion y datos del mismo, al igual que eliminar del salón con el botón de basura y agregar un estudiante manualmente mediante su correo registrado en el botón de +Agregar estudiante.",
  },
  {
    emoji: "🔬",
    titulo: "Biblioteca de Escenarios",
    descripcion:
      "Crea escenarios de simulación configurando física, dificultad e instrucciones. Luego asígnalos a los salones que quieras.",
  },
  {
    emoji: "📊",
    titulo: "Reportes y Progreso",
    descripcion:
      "Visualiza el avance de tus estudiantes por salón y descarga reportes oficiales en PDF y CSV con sus estadisticas y desempeños en las simulaciones.",
  },
];

const TUTORIAL_KEY = "paraboliclab_tutorial_visto";

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TutorialModal = ({ isOpen, onClose }: TutorialModalProps) => {
  const [paso, setPaso] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setPaso(0);
    }
  }, [isOpen]);

  const handleClose = () => {
    localStorage.setItem(TUTORIAL_KEY, "true");
    onClose();
  };

  const handleNext = () => {
    if (paso < PASOS.length - 1) {
      setPaso((prev) => prev + 1);
    } else {
      handleClose();
    }
  };

  const handleBack = () => {
    if (paso > 0) {
      setPaso((prev) => prev - 1);
    }
  };

  if (!isOpen) return null;

  const current = PASOS[paso];
  const isLastStep = paso === PASOS.length - 1;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-base-100 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl relative">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 btn btn-ghost btn-sm btn-circle text-lg"
          aria-label="Cerrar tutorial"
        >
          ×
        </button>

        {/* Emoji */}
        <div className="text-6xl mb-4 text-center">{current.emoji}</div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center mb-2">
          {current.titulo}
        </h2>

        {/* Description */}
        <p className="text-base-content/70 text-center mb-6">
          {current.descripcion}
        </p>

        {/* Step indicators */}
        <div className="flex justify-center gap-2 mb-6">
          {PASOS.map((_, index) => (
            <span
              key={index}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${index === paso ? "bg-primary" : "bg-base-300"
                }`}
            />
          ))}
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between gap-3">
          <button
            onClick={handleBack}
            disabled={paso === 0}
            className="btn btn-ghost"
          >
            Atrás
          </button>
          <button onClick={handleNext} className="btn btn-primary">
            {isLastStep ? "¡Empezar!" : "Siguiente"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TutorialModal;
