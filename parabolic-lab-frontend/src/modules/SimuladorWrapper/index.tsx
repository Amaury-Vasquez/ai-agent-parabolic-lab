"use client";
import { Button } from "amvasdev-ui";
import { useQueryClient } from "@tanstack/react-query";
import { Check, CloudOff, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useCookies } from "react-cookie";
import ReporteIntentoModal from "@/components/ReporteIntentoModal";
import Toast, { ToastContainer } from "@/components/Toast";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";
import { getLogrosDesbloqueados, type LogroDefinicion } from "@/constants/logros";
import { createInteraccion, updateInteraccion } from "@/fetchers/interacciones";
import {
  fetchProgresoAlumno,
  MIS_INTERACCIONES_QUERY_KEY,
  PROGRESO_ALUMNO_QUERY_KEY,
} from "@/fetchers/interaccionesAlumno";
import { Scenario } from "@/models/scenario";
import CompletionModal from "@/modules/SimuladorTiroParabolico/CompletionModal";
import SimuladorTiroParabolico from "@/modules/SimuladorTiroParabolico";
import type {
  ScoreState,
  ShotOutcome,
} from "@/modules/SimuladorTiroParabolico/types";
import {
  CampoResolucion,
  DatosInteraccion,
  Disparo,
  EMPTY_RESOLUCION,
  getCamposFaltantes,
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
  const queryClient = useQueryClient();

  const interaccionId = useRef<string | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  const [disparos, setDisparos] = useState<Disparo[]>([]);
  const [resolucion, setResolucion] =
    useState<ResolucionAlumno>(EMPTY_RESOLUCION);
  const [score, setScore] = useState<ScoreState>(INITIAL_SCORE);
  const [bestAutoScore, setBestAutoScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [createError, setCreateError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isFinishing, setIsFinishing] = useState(false);
  const [reporteModalOpen, setReporteModalOpen] = useState(false);
  const [reporteInteraccionId, setReporteInteraccionId] = useState<string | null>(null);

  const [completionOpen, setCompletionOpen] = useState(false);
  const [completionHit, setCompletionHit] = useState(false);
  // Logros desbloqueados al terminar este escenario (toasts descartables)
  const [nuevosLogros, setNuevosLogros] = useState<LogroDefinicion[]>([]);
  const [erroresResolucion, setErroresResolucion] = useState<
    Set<CampoResolucion>
  >(new Set());

  const disparosRef = useRef(disparos);
  const resolucionRef = useRef(resolucion);
  const scoreRef = useRef(score);
  const bestAutoScoreRef = useRef(bestAutoScore);
  const dirtyRef = useRef(false);
  const finishedRef = useRef(false);
  const completionShownRef = useRef(false);
  const saveTimerRef = useRef<number | null>(null);
  const finishReasonRef = useRef<"manual" | "tiempo">("manual");

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
    bestAutoScoreRef.current = bestAutoScore;
  }, [bestAutoScore]);

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
    puntuacionFinal: bestAutoScoreRef.current,
    autoScoreMejor: bestAutoScoreRef.current,
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
        puntuacion: bestAutoScoreRef.current,
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
  }, [disparos, resolucion, score, bestAutoScore]);

  const handleDisparo = (d: Disparo) => {
    dirtyRef.current = true;
    setDisparos((prev) => [...prev, d]);
  };

  const handleResolucionChange = (r: ResolucionAlumno) => {
    dirtyRef.current = true;
    setResolucion(r);
    // Si ya se mostraron errores, recalcular para limpiar los campos resueltos.
    setErroresResolucion((prev) =>
      prev.size > 0 ? getCamposFaltantes(r) : prev,
    );
  };

  const handleScoreChange = (s: ScoreState) => {
    if (
      s.shots === scoreRef.current.shots &&
      s.points === scoreRef.current.points
    )
      return;
    setScore(s);
    if (
      scenario?.intentospermitidos &&
      s.shots >= scenario.intentospermitidos &&
      !completionShownRef.current &&
      !finishedRef.current
    ) {
      completionShownRef.current = true;
      setCompletionHit(false);
      setCompletionOpen(true);
    }
  };

  const handleAutoScoreChange = (best: number) => {
    if (best > bestAutoScoreRef.current) {
      dirtyRef.current = true;
      setBestAutoScore(best);
    }
  };

  const handleShotOutcome = (outcome: ShotOutcome) => {
    if (outcome.hit && !completionShownRef.current && !finishedRef.current) {
      completionShownRef.current = true;
      setCompletionHit(true);
      setCompletionOpen(true);
    }
  };

  const finish = async (motivo: "manual" | "tiempo") => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    finishReasonRef.current = motivo;
    setIsFinishing(true);
    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    if (inFlightSaveRef.current) {
      try {
        await inFlightSaveRef.current;
      } catch {
        // si el autosave previo falla, igual intentamos el save final
      }
      inFlightSaveRef.current = null;
    }

    // Logros ya desbloqueados ANTES de registrar este escenario como
    // completado, para detectar los nuevos después del guardado final.
    let logrosPrevios: Set<string> | null = null;
    try {
      const progresoPrevio = await fetchProgresoAlumno(token);
      logrosPrevios = new Set(
        getLogrosDesbloqueados(progresoPrevio).map((l) => l.id),
      );
    } catch {
      // sin baseline no podemos diferenciar logros nuevos; omitimos el toast
    }

    const ok = await saveSnapshot(true);
    if (!ok) {
      setIsFinishing(false);
      finishedRef.current = false;
      return;
    }
    await queryClient.invalidateQueries({
      queryKey: PROGRESO_ALUMNO_QUERY_KEY,
    });
    await queryClient.invalidateQueries({
      queryKey: MIS_INTERACCIONES_QUERY_KEY,
    });

    if (logrosPrevios) {
      try {
        const progresoActual = await fetchProgresoAlumno(token);
        const desbloqueados = getLogrosDesbloqueados(progresoActual).filter(
          (l) => !logrosPrevios.has(l.id),
        );
        if (desbloqueados.length > 0) setNuevosLogros(desbloqueados);
      } catch {
        // el escenario terminó bien; el toast de logros es solo informativo
      }
    }

    setReporteInteraccionId(interaccionId.current);
    setReporteModalOpen(true);
    setIsFinishing(false);
  };

  const handleCerrarLogro = (id: string) => {
    setNuevosLogros((prev) => prev.filter((l) => l.id !== id));
  };

  const handleCerrarReporte = () => {
    setReporteModalOpen(false);
    const fallbackBase = idactividad
      ? `/alumno/actividad/${idactividad}`
      : `/alumno`;
    // Preservar la señal de "tiempo agotado" para que la página destino
    // muestre el aviso correspondiente (comportamiento heredado de main).
    const destino =
      finishReasonRef.current === "tiempo"
        ? `${fallbackBase}?tiempo=agotado`
        : fallbackBase;
    router.push(returnUrl ?? destino);
  };

  // Valida la solución antes de un cierre manual. Devuelve true si está completa.
  // Si faltan campos, los marca en rojo y desplaza la vista al panel de solución.
  const validarParaTerminar = (): boolean => {
    const faltantes = getCamposFaltantes(resolucionRef.current);
    setErroresResolucion(faltantes);
    if (faltantes.size > 0) {
      setCompletionOpen(false);
      completionShownRef.current = false;
      if (typeof document !== "undefined") {
        document
          .getElementById("panel-mi-solucion")
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return false;
    }
    return true;
  };

  const handleTerminar = () => {
    if (!validarParaTerminar()) return;
    finish("manual");
  };
  // El cierre por tiempo agotado no se bloquea: se guarda lo que haya.
  const handleTiempoAgotado = () => finish("tiempo");

  const handleCompletionContinue = () => {
    if (!validarParaTerminar()) return;
    finish("manual");
  };
  const handleKeepPracticing = () => {
    setCompletionOpen(false);
  };

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
    <>
      <div className="flex flex-col gap-4 p-4 md:p-8">
        <SimuladorTiroParabolico
          scenario={scenario ?? undefined}
          resolucion={resolucion}
          onResolucionChange={handleResolucionChange}
          erroresResolucion={erroresResolucion}
          onDisparo={handleDisparo}
          onScoreChange={handleScoreChange}
          onAutoScoreChange={handleAutoScoreChange}
          onShotOutcome={handleShotOutcome}
          onTiempoAgotado={handleTiempoAgotado}
          startTime={startTimeRef.current}
        />
        {erroresResolucion.size > 0 ? (
          <div className="alert alert-warning">
            <span>
              Antes de terminar, completa tu procedimiento y todas las
              respuestas en &quot;Mi solución&quot;.
            </span>
          </div>
        ) : null}
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
        <CompletionModal
          open={completionOpen}
          hit={completionHit}
          autoScore={bestAutoScore}
          intentosUsados={score.shots}
          intentosPermitidos={scenario?.intentospermitidos ?? null}
          tiempoTotalSegundos={Math.floor(
            (Date.now() - startTimeRef.current) / 1000
          )}
          isSaving={isFinishing}
          onContinue={handleCompletionContinue}
          onKeepPracticing={completionHit ? handleKeepPracticing : undefined}
        />
      </div>
      <ReporteIntentoModal
        isOpen={reporteModalOpen}
        onClose={handleCerrarReporte}
        idinteraccion={reporteInteraccionId}
      />

      {/* Toasts de logros desbloqueados al terminar el escenario */}
      {nuevosLogros.length > 0 ? (
        <ToastContainer>
          {nuevosLogros.map((logro) => (
            <Toast
              key={logro.id}
              icon="🏆"
              title="¡Logro desbloqueado!"
              description={logro.titulo}
              onClose={() => handleCerrarLogro(logro.id)}
            />
          ))}
        </ToastContainer>
      ) : null}
    </>
  );
};

export default SimuladorWrapper;
