"use client";
import { Badge } from "amvasdev-ui";
import { PlayCircle } from "lucide-react";
import CustomLink from "@/components/CustomLink";
import { Scenario } from "@/models/scenario";
import { useMisEscenarios } from "@/queries/useMisEscenarios";

const DIFFICULTY_VARIANT_MAP: Record<
  string,
  "success" | "warning" | "error" | "neutral"
> = {
  Básico: "success",
  Intermedio: "warning",
  Avanzado: "error",
  Difícil: "error",
  Experto: "error",
};

interface ScenarioAlumnoCardProps {
  scenario: Scenario;
}

const ScenarioAlumnoCard = ({ scenario }: ScenarioAlumnoCardProps) => (
  <div className="card bg-base-100 shadow-md border border-solid border-base-300 flex flex-col">
    <div className="card-body gap-4 flex-1">
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold">{scenario.nombre}</h3>
        <div className="flex flex-wrap gap-2">
          <Badge
            variant={DIFFICULTY_VARIANT_MAP[scenario.niveldificultad] ?? "neutral"}
          >
            {scenario.niveldificultad}
          </Badge>
          <Badge variant="neutral">{scenario.tipoescenario}</Badge>
        </div>
      </div>
      {scenario.descripcion ? (
        <p className="text-sm opacity-70 flex-1">{scenario.descripcion}</p>
      ) : null}
      <div className="flex gap-4 text-sm opacity-60">
        {scenario.tiempolimite ? (
          <span>{scenario.tiempolimite} min</span>
        ) : null}
        {scenario.intentospermitidos ? (
          <span>{scenario.intentospermitidos} intentos</span>
        ) : null}
      </div>
    </div>
    <div className="px-6 pb-6">
      <CustomLink
        href={`/alumno/actividad/simulador/${scenario.idescenario}`}
        variant="primary"
        className="w-full"
      >
        <PlayCircle size={16} />
        Ir al simulador
      </CustomLink>
    </div>
  </div>
);

const EscenariosAlumno = () => {
  const { data: escenarios, isLoading } = useMisEscenarios();

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">Mis Escenarios</h1>
        <p className="mt-1 opacity-60">
          Accede a los escenarios asignados y practica tu tiro parabólico
        </p>
      </div>

      {escenarios && escenarios.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {escenarios.map((scenario) => (
            <ScenarioAlumnoCard key={scenario.idescenario} scenario={scenario} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 opacity-60">
          <p className="text-lg">No tienes escenarios asignados aún.</p>
        </div>
      )}
    </div>
  );
};

export default EscenariosAlumno;
