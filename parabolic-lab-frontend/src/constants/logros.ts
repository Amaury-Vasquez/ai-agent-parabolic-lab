import type { LucideIcon } from "lucide-react";
import {
  Award,
  Clock,
  Compass,
  GraduationCap,
  Star,
  Target,
  Trophy,
} from "lucide-react";
import type { ProgresoAlumnoData } from "@/fetchers/interaccionesAlumno";

export interface LogroDefinicion {
  id: string;
  titulo: string;
  descripcion: string;
  icon: LucideIcon;
  condicion: (progreso: ProgresoAlumnoData) => boolean;
}

export const LOGROS: LogroDefinicion[] = [
  {
    id: "primer-escenario",
    titulo: "Primer escenario completado",
    descripcion: "Completaste tu primer escenario de simulación.",
    icon: Trophy,
    condicion: (p) => p.escenarios_completados >= 1,
  },
  {
    id: "en-camino",
    titulo: "En camino",
    descripcion: "Completaste 3 escenarios.",
    icon: Star,
    condicion: (p) => p.escenarios_completados >= 3,
  },
  {
    id: "maestro",
    titulo: "Maestro del simulador",
    descripcion: "Completaste 5 escenarios de simulación.",
    icon: Award,
    condicion: (p) => p.escenarios_completados >= 5,
  },
  {
    id: "dedicado",
    titulo: "Estudiante dedicado",
    descripcion: "Completaste 10 escenarios.",
    icon: GraduationCap,
    condicion: (p) => p.escenarios_completados >= 10,
  },
  {
    id: "puntuacion-perfecta",
    titulo: "Puntuación perfecta",
    descripcion: "Obtuviste 100 puntos en algún escenario.",
    icon: Target,
    condicion: (p) => (p.mejor_puntuacion ?? 0) >= 100,
  },
  {
    id: "explorador",
    titulo: "Explorador",
    descripcion: "Interactuaste con 10 escenarios distintos.",
    icon: Compass,
    condicion: (p) => p.total_escenarios >= 10,
  },
  {
    id: "hora-practica",
    titulo: "Hora de práctica",
    descripcion: "Acumulaste 60 minutos de práctica.",
    icon: Clock,
    condicion: (p) => p.tiempo_total_minutos >= 60,
  },
];

export const getLogrosDesbloqueados = (
  progreso: ProgresoAlumnoData,
): LogroDefinicion[] => LOGROS.filter((logro) => logro.condicion(progreso));
