"use client";

import { Badge } from "amvasdev-ui";
import clsx from "clsx";
import { Clock, ListChecks, Target, BookOpen } from "lucide-react";
import { useEffect, useState } from "react";
import { Scenario } from "@/models/scenario";

interface ProblemPanelProps {
  scenario?: Scenario;
  intentosUsados: number;
  startTime: number;
  onTiempoAgotado?: () => void;
}

const formatTime = (totalSeconds: number) => {
  if (totalSeconds < 0) totalSeconds = 0;
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

const ProblemPanel = ({
  scenario,
  intentosUsados,
  startTime,
  onTiempoAgotado,
}: ProblemPanelProps) => {
  const tiempoLimiteSeg =
    scenario?.tiempolimite ? scenario.tiempolimite * 60 : null;
  const intentos = scenario?.intentospermitidos ?? null;

  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!tiempoLimiteSeg) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [tiempoLimiteSeg]);

  const elapsed = Math.floor((now - startTime) / 1000);
  const remaining = tiempoLimiteSeg ? tiempoLimiteSeg - elapsed : null;

  useEffect(() => {
    if (remaining !== null && remaining <= 0 && onTiempoAgotado) {
      onTiempoAgotado();
    }
  }, [remaining, onTiempoAgotado]);

  const tiempoCritico = remaining !== null && remaining <= 30;
  const sinIntentos = intentos !== null && intentosUsados >= intentos;

  if (!scenario) return null;

  return (
    <div className="bg-base-200 rounded-lg p-4 sm:p-5 flex flex-col gap-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <Target className="w-5 h-5 sm:w-6 sm:h-6 text-primary shrink-0" />
            <span className="truncate">{scenario.nombre}</span>
          </h2>
          <div className="flex gap-2 flex-wrap mt-2">
            <Badge variant="info">{scenario.tipoescenario}</Badge>
            <Badge variant="warning">{scenario.niveldificultad}</Badge>
          </div>
        </div>

        <div className="flex gap-2 shrink-0">
          {remaining !== null ? (
            <div
              className={clsx(
                "rounded-lg px-3 py-2 flex flex-col items-center min-w-[88px]",
                tiempoCritico
                  ? "bg-error/20 border border-error animate-pulse"
                  : "bg-base-100"
              )}
            >
              <div className="flex items-center gap-1 text-[10px] opacity-70">
                <Clock className="w-3 h-3" />
                Tiempo
              </div>
              <div
                className={clsx(
                  "font-mono font-bold text-lg tabular-nums",
                  tiempoCritico ? "text-error" : ""
                )}
              >
                {formatTime(remaining)}
              </div>
            </div>
          ) : null}
          {intentos !== null ? (
            <div
              className={clsx(
                "rounded-lg px-3 py-2 flex flex-col items-center min-w-[88px]",
                sinIntentos
                  ? "bg-error/20 border border-error"
                  : "bg-base-100"
              )}
            >
              <div className="flex items-center gap-1 text-[10px] opacity-70">
                <ListChecks className="w-3 h-3" />
                Intentos
              </div>
              <div
                className={clsx(
                  "font-mono font-bold text-lg tabular-nums",
                  sinIntentos ? "text-error" : ""
                )}
              >
                {intentosUsados}/{intentos}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {scenario.descripcion ? (
        <div>
          <div className="text-xs font-semibold uppercase opacity-60 mb-1">
            Descripción del problema
          </div>
          <p className="text-sm whitespace-pre-line">{scenario.descripcion}</p>
        </div>
      ) : null}

      <div className="flex flex-col gap-2">
        {scenario.objetivosaprendizaje ? (
          <details className="bg-base-100 rounded-lg" open>
            <summary className="cursor-pointer px-3 py-2 font-semibold text-sm flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-info" />
              Objetivos de aprendizaje
            </summary>
            <div className="px-3 pb-3 text-sm whitespace-pre-line opacity-90">
              {scenario.objetivosaprendizaje}
            </div>
          </details>
        ) : null}

        {scenario.instrucciones ? (
          <details className="bg-base-100 rounded-lg" open>
            <summary className="cursor-pointer px-3 py-2 font-semibold text-sm flex items-center gap-2">
              <ListChecks className="w-4 h-4 text-success" />
              Instrucciones del docente
            </summary>
            <div className="px-3 pb-3 text-sm whitespace-pre-line opacity-90">
              {scenario.instrucciones}
            </div>
          </details>
        ) : null}
      </div>
    </div>
  );
};

export default ProblemPanel;
