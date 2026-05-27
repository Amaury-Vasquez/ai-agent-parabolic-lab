"use client";
import { Badge } from "amvasdev-ui";
import clsx from "clsx";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Scenario } from "@/models/scenario";
import { useEscenarioCompletion } from "@/queries/useEscenarioCompletion";

interface ScenarioCardProps {
  scenario: Scenario;
  idactividad?: string;
  salonId?: string;
}

const DIFFICULTY_VARIANT_MAP: Record<
  string,
  "success" | "warning" | "error" | "neutral"
> = {
  Básico: "success",
  Basico: "success",
  Intermedio: "warning",
  Avanzado: "error",
  Difícil: "error",
  Experto: "error",
};

const ScenarioCard = ({
  scenario,
  idactividad: idactividadProp,
  salonId,
}: ScenarioCardProps) => {
  const params = useParams();
  const idactividad = idactividadProp ?? (params.idactividad as string);
  const { completado, mejorPuntuacion } = useEscenarioCompletion(
    scenario.idescenario
  );

  const href = salonId
    ? `/alumno/salon/${salonId}/escenario/${scenario.idescenario}`
    : `/alumno/actividad/${idactividad}/escenario/${scenario.idescenario}`;

  return (
    <div
      className={clsx(
        "bg-base-200 rounded-lg p-4 flex flex-col gap-4 md:p-6 md:gap-6",
        completado ? "border border-success/40" : ""
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg md:text-xl font-semibold">
              {scenario.nombre}
            </h3>
            {completado ? (
              <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
            ) : null}
          </div>
          <div className="flex gap-2 mt-2 flex-wrap">
            <Badge
              variant={
                DIFFICULTY_VARIANT_MAP[scenario.niveldificultad] || "neutral"
              }
            >
              {scenario.niveldificultad}
            </Badge>
            <Badge variant="neutral">{scenario.tipoescenario}</Badge>
            {completado && mejorPuntuacion !== null ? (
              <Badge variant="success">
                {Math.round(mejorPuntuacion)} pts
              </Badge>
            ) : null}
          </div>
        </div>
        <Link
          href={href}
          className={clsx(
            "btn hidden md:flex",
            completado ? "btn-ghost" : "btn-primary"
          )}
        >
          {completado ? "Repetir" : "Comenzar"}
        </Link>
      </div>
      {scenario.descripcion ? (
        <p className="text-sm">{scenario.descripcion}</p>
      ) : null}
      {scenario.objetivosaprendizaje ? (
        <div>
          <p className="text-sm font-semibold">Objetivos de aprendizaje:</p>
          <p className="text-sm opacity-80">{scenario.objetivosaprendizaje}</p>
        </div>
      ) : null}
      {scenario.instrucciones ? (
        <div>
          <p className="text-sm font-semibold">Instrucciones:</p>
          <p className="text-sm opacity-80">{scenario.instrucciones}</p>
        </div>
      ) : null}
      <div className="flex gap-4 text-sm opacity-70">
        {scenario.tiempolimite ? (
          <span>{scenario.tiempolimite} min</span>
        ) : null}
        {scenario.intentospermitidos ? (
          <span>{scenario.intentospermitidos} intentos</span>
        ) : null}
      </div>
      <Link
        href={href}
        className={clsx(
          "btn w-full md:hidden",
          completado ? "btn-ghost" : "btn-primary"
        )}
      >
        {completado ? "Repetir" : "Comenzar"}
      </Link>
    </div>
  );
};

export default ScenarioCard;
