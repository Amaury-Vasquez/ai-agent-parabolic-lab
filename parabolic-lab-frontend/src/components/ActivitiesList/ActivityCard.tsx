"use client";
import { Badge, Button } from "amvasdev-ui";
import { Calendar, Clock, Target, Trophy } from "lucide-react";
import Link from "next/link";
import Card from "@/components/Card";
import { ActivityWithScenarios } from "@/constants/activities";

interface ActivityCardProps {
  activity: ActivityWithScenarios;
}

const ACTIVITY_TYPE_COLORS = {
  Practica: "primary",
  "Laboratorio Virtual": "info",
  Examen: "error",
  Tarea: "warning",
} as const;

const DIFFICULTY_COLORS = {
  Facil: "success",
  Intermedio: "warning",
  Dificil: "error",
} as const;

const ActivityCard = ({ activity }: ActivityCardProps) => {
  const hasMultipleScenarios = activity.escenarios.length > 1;
  const activityTypeColor =
    ACTIVITY_TYPE_COLORS[
      activity.tipoactividad as keyof typeof ACTIVITY_TYPE_COLORS
    ] || "base";

  return (
    <Card>
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold">{activity.titulo}</h3>
          {activity.descripcion ? (
            <p className="text-sm mt-1 opacity-70">{activity.descripcion}</p>
          ) : null}
        </div>
        <Badge variant={activityTypeColor} size="md">
          {activity.tipoactividad}
        </Badge>
      </div>

      {/* Activity Details */}
      <div className="flex flex-wrap gap-4 mb-4 text-sm">
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
        {activity.fechaexpiracion ? (
          <div className="flex items-center gap-1.5">
            <Calendar size={16} className="opacity-60" />
            <span>
              Vence:{" "}
              {activity.fechaexpiracion.toLocaleDateString("es-MX", {
                day: "numeric",
                month: "short",
              })}
            </span>
          </div>
        ) : null}
      </div>

      {/* Scenarios */}
      <div className="bg-base-200 rounded-lg p-3 mb-4">
        <p className="text-xs font-semibold uppercase mb-2 opacity-70">
          {hasMultipleScenarios ? "Escenarios Asignados" : "Escenario Asignado"}
        </p>
        <div className="flex flex-col gap-2">
          {activity.escenarios.map((scenario, index) => (
            <div
              key={scenario.idescenario}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {index + 1}. {scenario.nombre}
                </span>
                <Badge
                  variant={
                    DIFFICULTY_COLORS[
                      scenario.niveldificultad as keyof typeof DIFFICULTY_COLORS
                    ] || "base"
                  }
                  size="sm"
                >
                  {scenario.niveldificultad}
                </Badge>
              </div>
              {scenario.tiempolimite ? (
                <span className="text-xs opacity-60">
                  {scenario.tiempolimite} min
                </span>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      {/* Instructions */}
      {activity.instrucciones ? (
        <p className="text-sm italic opacity-70 mb-4">
          {activity.instrucciones}
        </p>
      ) : null}

      {/* Action Button */}
      <Link href={`/alumno/actividad/${activity.idactividad}`}>
        <Button variant="primary" className="w-full">
          Iniciar Actividad
        </Button>
      </Link>
    </Card>
  );
};

export default ActivityCard;
