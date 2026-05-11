"use client";
import { Badge, Button } from "amvasdev-ui";
import { Calendar, Clock, Target, Trophy } from "lucide-react";
import Link from "next/link";
import Card from "@/components/Card";
import { ActivityWithScenarios } from "@/models/activity";

interface ActivityCardProps {
  activity: ActivityWithScenarios;
}

const ACTIVITY_TYPE_COLORS: Record<string, "primary" | "info" | "error" | "warning" | "success"> = {
  cuestionario: "info",
  tarea: "warning",
  examen: "error",
  proyecto: "primary",
  participacion: "success",
  practica: "primary",
  foro: "info",
  juego: "success",
};

const ACTIVITY_TYPE_LABELS: Record<string, string> = {
  cuestionario: "Cuestionario",
  tarea: "Tarea",
  examen: "Examen",
  proyecto: "Proyecto",
  participacion: "Participación",
  practica: "Práctica",
  foro: "Foro",
  juego: "Juego",
};

const DIFFICULTY_COLORS: Record<string, "success" | "info" | "warning" | "error"> = {
  principiante: "success",
  intermedio: "info",
  avanzado: "warning",
  experto: "error",
};

const DIFFICULTY_LABELS: Record<string, string> = {
  principiante: "Principiante",
  intermedio: "Intermedio",
  avanzado: "Avanzado",
  experto: "Experto",
};

const formatExpiracion = (value: Date | string | null | undefined): string | null => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("es-MX", { day: "numeric", month: "short" });
};

const ActivityCard = ({ activity }: ActivityCardProps) => {
  const hasMultipleScenarios = activity.escenarios.length > 1;
  const tipoKey = activity.tipoactividad?.toLowerCase() ?? "";
  const activityTypeColor = ACTIVITY_TYPE_COLORS[tipoKey] ?? "primary";
  const activityTypeLabel =
    ACTIVITY_TYPE_LABELS[tipoKey] ?? activity.tipoactividad;
  const fechaExpiracionText = formatExpiracion(activity.fechaexpiracion);

  return (
    <Card>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg sm:text-xl font-bold break-words">
            {activity.titulo}
          </h3>
          {activity.descripcion ? (
            <p className="text-sm mt-1 opacity-70">{activity.descripcion}</p>
          ) : null}
        </div>
        <Badge variant={activityTypeColor}>{activityTypeLabel}</Badge>
      </div>

      <div className="flex flex-wrap gap-3 sm:gap-4 mb-4 text-sm">
        {activity.duracionminutos ? (
          <div className="flex items-center gap-1.5">
            <Clock size={16} className="opacity-60" />
            <span>{activity.duracionminutos} min</span>
          </div>
        ) : null}
        {activity.puntuaciontotal ? (
          <div className="flex items-center gap-1.5">
            <Trophy size={16} className="opacity-60" />
            <span>{activity.puntuaciontotal} pts</span>
          </div>
        ) : null}
        {activity.intentospermitidos ? (
          <div className="flex items-center gap-1.5">
            <Target size={16} className="opacity-60" />
            <span>
              {activity.intentospermitidos}{" "}
              {activity.intentospermitidos === 1 ? "intento" : "intentos"}
            </span>
          </div>
        ) : null}
        {fechaExpiracionText ? (
          <div className="flex items-center gap-1.5">
            <Calendar size={16} className="opacity-60" />
            <span>Vence: {fechaExpiracionText}</span>
          </div>
        ) : null}
      </div>

      {activity.escenarios.length > 0 ? (
        <div className="bg-base-200 rounded-lg p-3 mb-4">
          <p className="text-xs font-semibold uppercase mb-2 opacity-70">
            {hasMultipleScenarios ? "Escenarios asignados" : "Escenario asignado"}
          </p>
          <div className="flex flex-col gap-2">
            {activity.escenarios.map((scenario, index) => {
              const difKey = scenario.niveldificultad?.toLowerCase() ?? "";
              return (
                <div
                  key={scenario.idescenario}
                  className="flex flex-wrap items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm font-medium truncate">
                      {index + 1}. {scenario.nombre}
                    </span>
                    <Badge
                      variant={DIFFICULTY_COLORS[difKey] ?? "info"}
                      size="sm"
                    >
                      {DIFFICULTY_LABELS[difKey] ?? scenario.niveldificultad}
                    </Badge>
                  </div>
                  {scenario.tiempolimite ? (
                    <span className="text-xs opacity-60">
                      {scenario.tiempolimite} min
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {activity.instrucciones ? (
        <p className="text-sm italic opacity-70 mb-4">{activity.instrucciones}</p>
      ) : null}

      <Link href={`/alumno/actividad/${activity.idactividad}`}>
        <Button variant="primary" className="w-full">
          Iniciar actividad
        </Button>
      </Link>
    </Card>
  );
};

export default ActivityCard;
