"use client";
import { Button } from "amvasdev-ui";
import { Check, CloudOff, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useCookies } from "react-cookie";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";
import { createInteraccion, updateInteraccion } from "@/fetchers/interacciones";
import { Scenario } from "@/models/scenario";
import SimuladorTiroParabolico from "@/modules/SimuladorTiroParabolico";
import type { ScoreState } from "@/modules/SimuladorTiroParabolico/types";
import {
  DatosInteraccion,
  Disparo,
  EMPTY_RESOLUCION,
  ResolucionAlumno,
} from "@/types/datosInteraccion";

interface SimuladorWrapperProps {
  idactividad?: string;
  idescenario: string;
  scenario: Scenario | null;
  returnUrl?: string;
}

const INITIAL_SCORE: ScoreState = {
  shots: 0,
  hits: 0,
  streak: 0,
  bestStreak: 0,
  points: 0,
};

const SimuladorWrapper = ({
  idactividad,
  idescenario,
  scenario,
  returnUrl,
}: SimuladorWrapperProps) => {
  const [cookies] = useCookies([ACCESS_TOKEN_COOKIE]);
  const token = cookies[ACCESS_TOKEN_COOKIE];
  const router = useRouter();

  const interaccionId = useRef<string | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  const [disparos, setDisparos] = useState<Disparo[]>([]);
  const [resolucion, setResolucion] = useState<ResolucionAlumno>(EMPTY_RESOLUCION);
  const [score, setScore] = useState<ScoreState>(INITIAL_SCORE);
  const [loading, setLoading] = useState(true);
  const [createError, setCreateError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isFinishing, setIsFinishing] = useState(false);

  const disparosRef = useRef(disparos);
  const resolucionRef = useRef(resolucion);
  const scoreRef = useRef(score);
  const dirtyRef = useRef(false);
  const finishedRef = useRef(false);
  const saveTimerRef = useRef<number | null>(null);

  useEffect(() => {
    disparosRef.current = disparos;
  }, [disparos]);
  useEffect(() => {
    resolucionRef.current = resolucion;
  }, [resolucion]);
  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    if (!token) return;

    const iniciarInteraccion = async () => {
      try {
        const interaccion = await createInteraccion(token, {
          idescenario,
        });
        interaccionId.current = interaccion.idinteraccion;
        startTimeRef.current = Date.now();
      } catch (error) {
        console.error("Error al iniciar interacción:", error);
        setCreateError(
          "No se pudo iniciar la sesión. Recarga la página o avisa a tu docente."
        );
      } finally {
        setLoading(false);
      }
    };

    iniciarInteraccion();
  }, [token, idescenario]);

  const buildDatosInteraccion = (): DatosInteraccion => ({
    disparos: disparosRef.current,
    resolucion: resolucionRef.current,
    puntuacionFinal: scoreRef.current.points,
    intentosUsados: scoreRef.current.shots,
    tiempoTotalSegundos: Math.floor(
      (Date.now() - startTimeRef.current) / 1000
    ),
  });

  const saveSnapshot = async (final: boolean): Promise<boolean> => {
    if (!interaccionId.current || !token) return false;
    setIsSaving(true);
    setSaveError(null);
    try {
      const datos = buildDatosInteraccion();
      await updateInteraccion(token, interaccionId.current, {
        datosinteraccion: datos as unknown as Record<string, unknown>,
        puntuacion: datos.puntuacionFinal,
        tiempototal: datos.tiempoTotalSegundos,
        ...(final ? { completado: true } : {}),
      });
      setLastSavedAt(new Date());
      dirtyRef.current = false;
      return true;
    } catch (error) {
      console.error("Error al guardar progreso:", error);
      setSaveError("No se pudo guardar el progreso.");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const inFlightSaveRef = useRef<Promise<boolean> | null>(null);

  const scheduleAutosave = () => {
    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    saveTimerRef.current = window.setTimeout(() => {
      if (!finishedRef.current) {
        inFlightSaveRef.current = saveSnapshot(false);
      }
    }, 600);
  };

  useEffect(() => {
    if (!dirtyRef.current || finishedRef.current) return;
    scheduleAutosave();
    return () => {
      if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    };
  }, [disparos, resolucion, score]);

  const handleDisparo = (d: Disparo) => {
    dirtyRef.current = true;
    setDisparos((prev) => [...prev, d]);
  };

  const handleResolucionChange = (r: ResolucionAlumno) => {
    dirtyRef.current = true;
    setResolucion(r);
  };

  const handleScoreChange = (s: ScoreState) => {
    if (
      s.shots === scoreRef.current.shots &&
      s.points === scoreRef.current.points
    )
      return;
    setScore(s);
  };

  const finish = async (motivo: "manual" | "tiempo") => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setIsFinishing(true);
    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    // Si un autosave está en vuelo, esperarlo antes de disparar el save final
    // (dos PATCH concurrentes al mismo recurso pueden ser cancelados por el browser).
    if (inFlightSaveRef.current) {
      try {
        await inFlightSaveRef.current;
      } catch {
        // si el autosave previo falla, igual intentamos el save final
      }
      inFlightSaveRef.current = null;
    }
    const ok = await saveSnapshot(true);
    const fallbackBase = idactividad
      ? `/alumno/actividad/${idactividad}`
      : `/alumno/escenarios`;
    if (!ok) {
      setIsFinishing(false);
      finishedRef.current = false;
      return;
    }
    router.push(
      returnUrl ??
        (motivo === "tiempo" ? `${fallbackBase}?tiempo=agotado` : fallbackBase),
    );
  };

  const handleTerminar = () => finish("manual");
  const handleTiempoAgotado = () => finish("tiempo");

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (createError) {
    return (
      <div className="p-4 md:p-8">
        <div className="alert alert-error">
          <span>{createError}</span>
        </div>
      </div>
    );
  }

  const saveIndicator = isSaving ? (
    <span className="flex items-center gap-1 text-xs opacity-70">
      <Loader2 className="w-3 h-3 animate-spin" />
      Guardando...
    </span>
  ) : saveError ? (
    <span className="flex items-center gap-1 text-xs text-error">
      <CloudOff className="w-3 h-3" />
      {saveError}
    </span>
  ) : lastSavedAt ? (
    <span className="flex items-center gap-1 text-xs opacity-70">
      <Check className="w-3 h-3 text-success" />
      Guardado{" "}
      {lastSavedAt.toLocaleTimeString("es-MX", {
        hour: "2-digit",
        minute: "2-digit",
      })}
    </span>
  ) : null;

  return (
    <div className="flex flex-col gap-4 p-4 md:p-8">
      <SimuladorTiroParabolico
        scenario={scenario ?? undefined}
        resolucion={resolucion}
        onResolucionChange={handleResolucionChange}
        onDisparo={handleDisparo}
        onScoreChange={handleScoreChange}
        onTiempoAgotado={handleTiempoAgotado}
        startTime={startTimeRef.current}
      />
      <div className="flex flex-col-reverse sm:flex-row items-end sm:items-center justify-between gap-2">
        <div>{saveIndicator}</div>
        <Button
          variant="primary"
          onClick={handleTerminar}
          disabled={isFinishing}
          className="w-full sm:w-auto"
        >
          {isFinishing ? "Terminando..." : "Terminar actividad"}
        </Button>
      </div>
    </div>
  );
};

export default SimuladorWrapper;
