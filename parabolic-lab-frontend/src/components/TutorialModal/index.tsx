"use client";
import { Button } from "amvasdev-ui";
import { useState } from "react";

const PASOS = [
  {
    emoji: "🚀",
    titulo: "¡Bienvenido a Parabolic-Lab!",
    descripcion:
      "La plataforma donde gestionar tus clases de física se vuelve interactivo. Aquí crearás salones, diseñarás simulaciones y seguirás el avance de cada estudiante.",
  },
  {
    emoji: "🏫",
    titulo: "Gestiona tus Salones",
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
      "Desde la Biblioteca creas escenarios de tiro parabólico: configuras física, dificultad e instrucciones para tus alumnos. Luego los asignas a los salones que elijas.",
  },
  {
    emoji: "📊",
    titulo: "Reportes y Progreso",
    descripcion:
      "Visualiza el avance de tus estudiantes por salón y descarga reportes oficiales en PDF y CSV con sus estadisticas y desempeños en las simulaciones.",
  },
  {
    emoji: "💡",
    titulo: "¿Necesitas recordar algo?",
    descripcion:
      "Puedes volver a ver este tutorial en cualquier momento entrando a tu Perfil y presionando el botón 'Ver tutorial'.",
  },
];

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TutorialModal = ({ isOpen, onClose }: TutorialModalProps) => {
  const [paso, setPaso] = useState(0);
  const pasoActual = PASOS[paso];
  const esUltimo = paso === PASOS.length - 1;

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
          {PASOS.map((_, i) => (
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
