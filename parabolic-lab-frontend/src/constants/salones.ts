export interface Salon {
  nombre: string;
  codigo: string;
  escenarios: string[];
  estudiantes: number;
}

export const SALONES: Salon[] = [
  {
    nombre: "Física 3° A",
    codigo: "KJ-4T9",
    escenarios: [
      "Movimiento Parabólico",
      "Fuerzas y Aceleración",
      "Energía Cinética",
    ],
    estudiantes: 28,
  },
  {
    nombre: "Física 3° B",
    codigo: "PL-8K2",
    escenarios: ["Fuerzas y Aceleración"],
    estudiantes: 25,
  },
  {
    nombre: "Física 2° A",
    codigo: "FZ-9M3",
    escenarios: ["Examen parcial", "Movimiento Parabólico"],
    estudiantes: 18,
  },
  {
    nombre: "Física 2° C",
    codigo: "QW-7R5",
    escenarios: [],
    estudiantes: 22,
  },
];
