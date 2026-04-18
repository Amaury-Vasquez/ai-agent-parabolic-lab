import { Activity } from "@/models/activity";
import { Scenario } from "@/models/scenario";

export const MOCK_SCENARIOS: Scenario[] = [
  {
    idescenario: "scenario-1",
    idsalon: "salon-1",
    nombre: "Tiro Parabólico Básico",
    descripcion: "Análisis del movimiento parabólico con velocidad inicial horizontal",
    niveldificultad: "Fácil",
    tipoescenario: "Simulación",
    objetivosaprendizaje: "Comprender los componentes horizontal y vertical del movimiento",
    tiempolimite: 30,
    intentospermitidos: 3,
    activo: true,
  },
  {
    idescenario: "scenario-2",
    idsalon: "salon-1",
    nombre: "Lanzamiento con Ángulo",
    descripcion: "Estudio del tiro parabólico con ángulo de elevación",
    niveldificultad: "Intermedio",
    tipoescenario: "Simulación",
    objetivosaprendizaje: "Calcular alcance máximo y altura máxima",
    tiempolimite: 45,
    intentospermitidos: 2,
    activo: true,
  },
  {
    idescenario: "scenario-3",
    idsalon: "salon-1",
    nombre: "Tiro con Resistencia del Aire",
    descripcion: "Análisis avanzado incluyendo fricción del aire",
    niveldificultad: "Difícil",
    tipoescenario: "Simulación Avanzada",
    objetivosaprendizaje: "Entender efectos de resistencia en trayectorias",
    tiempolimite: 60,
    intentospermitidos: 2,
    activo: true,
  },
];

export interface ActivityWithScenarios extends Activity {
  escenarios: Scenario[];
}

export const MOCK_ACTIVITIES: ActivityWithScenarios[] = [
  {
    idactividad: "activity-1",
    idsalon: "salon-1",
    titulo: "Introducción al Tiro Parabólico",
    descripcion: "Actividad introductoria sobre los conceptos básicos del movimiento parabólico",
    instrucciones: "Completa los escenarios en orden y responde las preguntas de cada uno",
    duracionminutos: 60,
    intentospermitidos: 3,
    fechacreacion: new Date("2025-01-01"),
    fechaexpiracion: new Date("2025-12-31"),
    puntuaciontotal: 100,
    tipoactividad: "Práctica",
    activa: true,
    escenarios: [MOCK_SCENARIOS[0]],
  },
  {
    idactividad: "activity-2",
    idsalon: "salon-1",
    titulo: "Análisis de Trayectorias",
    descripcion: "Estudio detallado de diferentes ángulos de lanzamiento",
    instrucciones: "Experimenta con diferentes ángulos y registra tus observaciones",
    duracionminutos: 90,
    intentospermitidos: 2,
    fechacreacion: new Date("2025-01-05"),
    fechaexpiracion: new Date("2025-12-31"),
    puntuaciontotal: 150,
    tipoactividad: "Laboratorio Virtual",
    activa: true,
    escenarios: [MOCK_SCENARIOS[1], MOCK_SCENARIOS[2]],
  },
  {
    idactividad: "activity-3",
    idsalon: "salon-2",
    titulo: "Evaluación Final de Cinemática",
    descripcion: "Evaluación comprensiva de todos los conceptos aprendidos",
    instrucciones: "Resuelve todos los escenarios propuestos. No se permiten consultas",
    duracionminutos: 120,
    intentospermitidos: 1,
    fechacreacion: new Date("2025-01-10"),
    fechaexpiracion: new Date("2025-01-20"),
    puntuaciontotal: 200,
    tipoactividad: "Examen",
    activa: true,
    escenarios: MOCK_SCENARIOS,
  },
];
