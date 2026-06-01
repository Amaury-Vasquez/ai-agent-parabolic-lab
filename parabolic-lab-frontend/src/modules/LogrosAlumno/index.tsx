"use client";
import { Badge } from "amvasdev-ui";
import clsx from "clsx";
import type { LucideIcon } from "lucide-react";
import {
  Award,
  Clock,
  Compass,
  GraduationCap,
  Lock,
  Star,
  Target,
  Trophy,
} from "lucide-react";
import BackButton from "@/components/BackButton";
import { ProgresoAlumnoData } from "@/fetchers/interaccionesAlumno";
import { useProgresoAlumno } from "@/queries/useProgresoAlumno";

interface LogroDefinicion {
  id: string;
  titulo: string;
  descripcion: string;
  icon: LucideIcon;
  condicion: (progreso: ProgresoAlumnoData) => boolean;
}

const LOGROS: LogroDefinicion[] = [
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

interface LogroCardProps {
  titulo: string;
  descripcion: string;
  icon: LucideIcon;
  desbloqueado: boolean;
}

const LogroCard = ({
  titulo,
  descripcion,
  icon: Icon,
  desbloqueado,
}: LogroCardProps) => (
  <div
    className={clsx(
      "card border border-solid",
      desbloqueado
        ? "bg-base-100 border-primary shadow-md"
        : "bg-base-200 border-base-300 opacity-50"
    )}
  >
    <div className="card-body items-center text-center gap-3 p-6">
      <div
        className={clsx(
          "relative rounded-full p-4",
          desbloqueado ? "bg-primary/10 text-primary" : "bg-base-300"
        )}
      >
        <Icon size={28} />
        {desbloqueado ? null : (
          <span className="absolute -bottom-1 -right-1 bg-base-300 rounded-full p-0.5">
            <Lock size={12} />
          </span>
        )}
      </div>
      <h3 className="font-bold text-lg">{titulo}</h3>
      <p className="text-sm opacity-60">{descripcion}</p>
      {desbloqueado ? (
        <Badge variant="primary" soft>
          Desbloqueado
        </Badge>
      ) : null}
    </div>
  </div>
);

const LogrosAlumno = () => {
  const { data: progreso, isLoading } = useProgresoAlumno();

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (!progreso) return null;

  const logros = LOGROS.map((logro) => ({
    ...logro,
    desbloqueado: logro.condicion(progreso),
  })).sort((a, b) => Number(b.desbloqueado) - Number(a.desbloqueado));

  const totalDesbloqueados = logros.filter((l) => l.desbloqueado).length;

  return (
    <div className="p-4 md:p-8 flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <BackButton />
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Mis Logros</h1>
          <p className="mt-1 opacity-60">
            {totalDesbloqueados} de {LOGROS.length} logros desbloqueados
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {logros.map((logro) => (
          <LogroCard
            key={logro.id}
            titulo={logro.titulo}
            descripcion={logro.descripcion}
            icon={logro.icon}
            desbloqueado={logro.desbloqueado}
          />
        ))}
      </div>
    </div>
  );
};

export default LogrosAlumno;
