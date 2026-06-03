"use client";
import { Badge } from "amvasdev-ui";
import clsx from "clsx";
import { CheckCircle2, Lock, PlayCircle } from "lucide-react";
import { useMemo } from "react";
import CustomLink from "@/components/CustomLink";
import { DIFFICULTY_LEVELS } from "@/constants/difficultyLevels";
import { Scenario } from "@/models/scenario";
import { useInteraccionesAlumno } from "@/queries/useInteraccionesAlumno";
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

interface ScenarioStatus {
  scenario: Scenario;
  orden: number;
  completado: boolean;
  mejorPuntuacion: number | null;
  locked: boolean;
}

interface ScenarioAlumnoCardProps {
  status: ScenarioStatus;
}

const ScenarioAlumnoCard = ({ status }: ScenarioAlumnoCardProps) => {
  const { scenario, completado, mejorPuntuacion, locked } = status;
  return (
    <div
      className={clsx(
        "card bg-base-100 shadow-md border border-solid flex flex-col",
        locked ? "border-base-300 opacity-60" : "border-base-300",
        completado ? "border-success/40" : ""
      )}
    >
      <div className="card-body gap-4 flex-1">
        <div className="flex flex-col gap-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-lg font-semibold leading-tight">
              {scenario.nombre}
            </h3>
            {completado ? (
              <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
            ) : locked ? (
              <Lock className="w-5 h-5 opacity-50 shrink-0" />
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={
                DIFFICULTY_VARIANT_MAP[scenario.niveldificultad] ?? "neutral"
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
        {locked ? (
          <button
            className="btn btn-sm w-full btn-disabled gap-1"
            disabled
            type="button"
          >
            <Lock size={14} />
            Completa el anterior para desbloquear
          </button>
        ) : (
          <CustomLink
            href={`/alumno/escenario/${scenario.idescenario}`}
            variant={completado ? "ghost" : "primary"}
            className="w-full"
          >
            <PlayCircle size={16} />
            {completado ? "Repetir" : "Ir al simulador"}
          </CustomLink>
        )}
      </div>
    </div>
  );
};

function getOrden(scenario: Scenario): number {
  const cfg = scenario.configuracionescenario as { orden?: number } | undefined;
  const value = cfg?.orden;
  return typeof value === "number" && !isNaN(value) ? value : 0;
}

function buildScenarioStatuses(
  escenarios: Scenario[],
  completedMap: Map<string, number>
): Record<string, ScenarioStatus[]> {
  const grouped: Record<string, ScenarioStatus[]> = {};
  const vistos = new Set<string>();
  for (const escenario of escenarios) {
    // Dedup defensivo: evita renderizar el mismo escenario dos veces
    if (vistos.has(escenario.idescenario)) continue;
    vistos.add(escenario.idescenario);
    const tier = escenario.niveldificultad;
    if (!grouped[tier]) grouped[tier] = [];
    grouped[tier].push({
      scenario: escenario,
      orden: getOrden(escenario),
      completado: completedMap.has(escenario.idescenario),
      mejorPuntuacion: completedMap.get(escenario.idescenario) ?? null,
      locked: false,
    });
  }

  // Ordenar por orden (asc, undefined al final) y aplicar gating dentro del tier
  for (const tier of Object.keys(grouped)) {
    grouped[tier].sort((a, b) => {
      if (a.orden === b.orden) return a.scenario.nombre.localeCompare(b.scenario.nombre);
      return a.orden - b.orden;
    });
    let blocked = false;
    for (const status of grouped[tier]) {
      if (blocked) {
        status.locked = true;
      } else if (!status.completado) {
        // primero no completado: queda abierto, los siguientes se bloquean
        blocked = true;
      }
    }
  }

  return grouped;
}

const EscenariosAlumno = () => {
  const { data: escenarios, isLoading } = useMisEscenarios();
  const { data: interacciones, isLoading: loadingInter } =
    useInteraccionesAlumno();

  const groups = useMemo(() => {
    if (!escenarios) return {} as Record<string, ScenarioStatus[]>;
    const completedMap = new Map<string, number>();
    for (const it of interacciones ?? []) {
      if (!it.completado) continue;
      const score = Number(it.puntuacion ?? 0);
      const prev = completedMap.get(it.idescenario);
      if (prev === undefined || score > prev) {
        completedMap.set(it.idescenario, score);
      }
    }
    return buildScenarioStatuses(escenarios, completedMap);
  }, [escenarios, interacciones]);

  const tiersInOrder = useMemo(
    () => DIFFICULTY_LEVELS.filter((tier) => groups[tier]?.length),
    [groups]
  );

  if (isLoading || loadingInter) {
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
          Completa cada escenario para desbloquear el siguiente dentro del mismo
          nivel.
        </p>
      </div>

      {tiersInOrder.length > 0 ? (
        <div className="flex flex-col gap-10">
          {tiersInOrder.map((tier) => {
            const statuses = groups[tier];
            const completed = statuses.filter((s) => s.completado).length;
            return (
              <section key={tier} className="flex flex-col gap-3">
                <header className="flex flex-wrap items-end justify-between gap-2">
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold">{tier}</h2>
                    <p className="text-sm opacity-60">
                      {completed}/{statuses.length} completados
                    </p>
                  </div>
                </header>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {statuses.map((status) => (
                    <ScenarioAlumnoCard
                      key={status.scenario.idescenario}
                      status={status}
                    />
                  ))}
                </div>
              </section>
            );
          })}
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
