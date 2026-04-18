"use client";
import { Scenario } from "@/models/scenario";
import ScenarioCard from "./ScenarioCard";

// TODO: Replace with API call
const MOCK_SCENARIOS: Scenario[] = [
  {
    idescenario: "scenario-1",
    idsalon: "salon-123",
    nombre: "Tiro Horizontal",
    descripcion:
      "Calcula el alcance de un proyectil lanzado horizontalmente desde una altura determinada.",
    niveldificultad: "Básico",
    tipoescenario: "Simulación",
    objetivosaprendizaje:
      "Comprender el movimiento horizontal y vertical independiente en el tiro parabólico.",
    instrucciones:
      "Ajusta la velocidad inicial y la altura para lograr el alcance objetivo.",
    tiempolimite: 15,
    intentospermitidos: 3,
    activo: true,
  },
  {
    idescenario: "scenario-2",
    idsalon: "salon-123",
    nombre: "Tiro con Ángulo",
    descripcion:
      "Determina el ángulo óptimo para maximizar el alcance del proyectil.",
    niveldificultad: "Intermedio",
    tipoescenario: "Simulación",
    objetivosaprendizaje:
      "Analizar cómo el ángulo de lanzamiento afecta la trayectoria.",
    instrucciones:
      "Experimenta con diferentes ángulos entre 0° y 90° para encontrar el óptimo.",
    tiempolimite: 20,
    intentospermitidos: 3,
    activo: true,
  },
  {
    idescenario: "scenario-3",
    idsalon: "salon-123",
    nombre: "Alcance Máximo",
    descripcion:
      "Calcula la velocidad inicial necesaria para alcanzar un objetivo específico.",
    niveldificultad: "Avanzado",
    tipoescenario: "Problema",
    objetivosaprendizaje:
      "Aplicar ecuaciones del tiro parabólico para resolver problemas complejos.",
    instrucciones:
      "Usa las ecuaciones de movimiento para calcular la velocidad requerida.",
    tiempolimite: 25,
    intentospermitidos: 2,
    activo: true,
  },
];

const ScenariosList = () => (
  <div className="flex flex-col gap-4">
    <h2 className="text-lg md:text-2xl font-bold ml-4 md:ml-6">Escenarios</h2>

    {MOCK_SCENARIOS.length > 0 ? (
      <div className="grid grid-cols-1 gap-4 md:gap-6">
        {MOCK_SCENARIOS.map((scenario) => (
          <ScenarioCard key={scenario.idescenario} scenario={scenario} />
        ))}
      </div>
    ) : (
      <div className="bg-base-200 rounded-lg p-4 text-center md:p-6">
        <p className="text-base-content/70">
          No hay escenarios disponibles para esta actividad.
        </p>
      </div>
    )}
  </div>
);

export default ScenariosList;
