"use client";

import { Button } from "amvasdev-ui";
import clsx from "clsx";
import { CheckCircle2, Loader2, Trophy, XCircle } from "lucide-react";

interface CompletionModalProps {
  open: boolean;
  hit: boolean;
  autoScore: number;
  intentosUsados: number;
  intentosPermitidos: number | null;
  tiempoTotalSegundos: number;
  isSaving: boolean;
  onContinue: () => void;
  onKeepPracticing?: () => void;
}

const fmtTime = (totalSeconds: number) => {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}m ${s.toString().padStart(2, "0")}s`;
};

const scoreLabel = (score: number) => {
  if (score >= 90) return "Excelente";
  if (score >= 70) return "Muy bien";
  if (score >= 50) return "Casi";
  if (score >= 25) return "Acércate más";
  return "Sigue intentando";
};

const CompletionModal = ({
  open,
  hit,
  autoScore,
  intentosUsados,
  intentosPermitidos,
  tiempoTotalSegundos,
  isSaving,
  onContinue,
  onKeepPracticing,
}: CompletionModalProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-base-100 rounded-2xl shadow-2xl max-w-md w-full p-6 flex flex-col gap-4">
        <div className="flex flex-col items-center gap-2 text-center">
          <div
            className={clsx(
              "rounded-full p-3",
              hit ? "bg-success/20" : "bg-warning/20"
            )}
          >
            {hit ? (
              <Trophy className="w-10 h-10 text-success" />
            ) : (
              <XCircle className="w-10 h-10 text-warning" />
            )}
          </div>
          <h2 className="text-2xl font-bold">
            {hit ? "¡Escenario completado!" : "Tiempo de revisar"}
          </h2>
          <p className="text-sm opacity-70">
            {hit
              ? "Lograste impactar el blanco. Tu progreso ya se guardó."
              : "Usaste todos tus intentos. Aún puedes terminar y revisar tu solución."}
          </p>
        </div>

        <div className="bg-base-200 rounded-lg p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm opacity-70">Auto-puntuación</span>
            <div className="text-right">
              <div className="text-2xl font-bold tabular-nums">
                {Math.round(autoScore)}
                <span className="text-sm opacity-60">/100</span>
              </div>
              <div className="text-xs opacity-60">{scoreLabel(autoScore)}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="bg-base-100 rounded p-2">
              <div className="text-[10px] opacity-60 uppercase">Intentos</div>
              <div className="font-mono font-bold">
                {intentosUsados}
                {intentosPermitidos !== null ? `/${intentosPermitidos}` : ""}
              </div>
            </div>
            <div className="bg-base-100 rounded p-2">
              <div className="text-[10px] opacity-60 uppercase">Tiempo</div>
              <div className="font-mono font-bold">
                {fmtTime(tiempoTotalSegundos)}
              </div>
            </div>
          </div>
          <div className="flex items-start gap-2 text-xs opacity-70">
            <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" />
            <p>
              Tu docente revisará tu procedimiento y respuestas escritas para
              asignar una calificación manual adicional.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 justify-end">
          {onKeepPracticing && hit ? (
            <Button variant="ghost" onClick={onKeepPracticing} disabled={isSaving}>
              Seguir practicando
            </Button>
          ) : null}
          <Button variant="primary" onClick={onContinue} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Guardando...
              </>
            ) : (
              "Terminar y continuar"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CompletionModal;
