export interface Student {
  id: string;
  nombre: string;
  apellido: string;
  activitiesCompleted: number;
  totalScore: number;
  maxScore: number;
  averageTime: number; // in minutes
  totalAttempts: number;
  lastAccess: Date;
  difficultyLevel: "Fácil" | "Intermedio" | "Difícil";
  scenariosCompleted: string[];
}

export const STUDENTS: Student[] = [
  {
    id: "1",
    nombre: "María",
    apellido: "González",
    activitiesCompleted: 12,
    totalScore: 945,
    maxScore: 98,
    averageTime: 15,
    totalAttempts: 18,
    lastAccess: new Date("2025-11-05"),
    difficultyLevel: "Difícil",
    scenariosCompleted: [
      "Tiro Parabólico Básico",
      "Ángulo Óptimo",
      "Alcance Máximo",
    ],
  },
  {
    id: "2",
    nombre: "Carlos",
    apellido: "Martínez",
    activitiesCompleted: 10,
    totalScore: 850,
    maxScore: 95,
    averageTime: 18,
    totalAttempts: 15,
    lastAccess: new Date("2025-11-04"),
    difficultyLevel: "Intermedio",
    scenariosCompleted: ["Tiro Parabólico Básico", "Ángulo Óptimo"],
  },
  {
    id: "3",
    nombre: "Ana",
    apellido: "López",
    activitiesCompleted: 15,
    totalScore: 1200,
    maxScore: 100,
    averageTime: 12,
    totalAttempts: 20,
    lastAccess: new Date("2025-11-06"),
    difficultyLevel: "Difícil",
    scenariosCompleted: [
      "Tiro Parabólico Básico",
      "Ángulo Óptimo",
      "Alcance Máximo",
      "Velocidad Inicial",
    ],
  },
  {
    id: "4",
    nombre: "Luis",
    apellido: "Hernández",
    activitiesCompleted: 8,
    totalScore: 680,
    maxScore: 90,
    averageTime: 20,
    totalAttempts: 12,
    lastAccess: new Date("2025-11-03"),
    difficultyLevel: "Fácil",
    scenariosCompleted: ["Tiro Parabólico Básico"],
  },
  {
    id: "5",
    nombre: "Sofía",
    apellido: "Ramírez",
    activitiesCompleted: 14,
    totalScore: 1150,
    maxScore: 99,
    averageTime: 13,
    totalAttempts: 19,
    lastAccess: new Date("2025-11-05"),
    difficultyLevel: "Difícil",
    scenariosCompleted: [
      "Tiro Parabólico Básico",
      "Ángulo Óptimo",
      "Alcance Máximo",
    ],
  },
  {
    id: "6",
    nombre: "Diego",
    apellido: "Torres",
    activitiesCompleted: 6,
    totalScore: 520,
    maxScore: 88,
    averageTime: 22,
    totalAttempts: 10,
    lastAccess: new Date("2025-11-02"),
    difficultyLevel: "Fácil",
    scenariosCompleted: ["Tiro Parabólico Básico"],
  },
];
