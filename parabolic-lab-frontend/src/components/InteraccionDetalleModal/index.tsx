"use client";
import { Badge, Modal } from "amvasdev-ui";
import { Calculator, Clock, ListChecks, Target, Trophy } from "lucide-react";
import type { Disparo, ResolucionAlumno } from "@/types/datosInteraccion";

interface InteraccionDetalle {
  titulo: string;
  subtitulo?: string | null;
  fechafin?: string | null;
  tiempototal?: number | null;
  puntuacion?: number | string | null;
  intentosrealizados?: number | null;
  completado?: boolean | null;
  datosinteraccion?: {
    disparos?: Disparo[];
    resolucion?: ResolucionAlumno;
    puntuacionFinal?: number;
    intentosUsados?: number;
    tiempoTotalSegundos?: number;
  } | null;
}

interface InteraccionDetalleModalProps {
  isOpen: boolean;
  onClose: () => void;
  detalle: InteraccionDetalle | null;
}

const formatTiempo = (segundos: number | null | undefined): string => {
  if (!segundos || segundos < 0) return "0:00";
  const m = Math.floor(segundos / 60);
  const s = segundos % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const formatFecha = (iso: string | null | undefined): string | null => {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString("es-MX", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const renderRespuesta = (
  label: string,
  unidad: string,
  valor: number | null | undefined,
) => (
  <div className="bg-base-100 rounded p-2 flex flex-col">
    <span className="text-[10px] uppercase opacity-60">{label}</span>
    <span className="font-mono font-semibold">
      {valor !== null && valor !== undefined ? `${valor} ${unidad}` : "—"}
    </span>
  </div>
);

const InteraccionDetalleModal = ({
  isOpen,
  onClose,
  detalle,
}: InteraccionDetalleModalProps) => {
  if (!isOpen || !detalle) return null;

  const datos = detalle.datosinteraccion ?? {};
  const disparos: Disparo[] = datos.disparos ?? [];
  const resolucion = datos.resolucion;
  const fechaText = formatFecha(detalle.fechafin);

  return (
    <Modal onClose={onClose} title={detalle.titulo}>
      <div className="flex flex-col gap-4 py-2 max-h-[70vh] overflow-y-auto">
        {detalle.subtitulo ? (
          <p className="text-sm opacity-70 -mt-2">{detalle.subtitulo}</p>
        ) : null}

        <div className="flex flex-wrap gap-2">
          {detalle.completado ? (
            <Badge variant="success">Completado</Badge>
          ) : (
            <Badge variant="warning">En curso</Badge>
          )}
          {fechaText ? (
            <Badge variant="info">{fechaText}</Badge>
          ) : null}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="bg-base-200 rounded p-2 flex flex-col">
            <span className="text-[10px] uppercase opacity-60 flex items-center gap-1">
              <Trophy className="w-3 h-3" /> Puntuación
            </span>
            <span className="font-semibold">
              {detalle.puntuacion !== null && detalle.puntuacion !== undefined
                ? Number(detalle.puntuacion).toFixed(0)
                : "—"}
            </span>
          </div>
          <div className="bg-base-200 rounded p-2 flex flex-col">
            <span className="text-[10px] uppercase opacity-60 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Tiempo
            </span>
            <span className="font-semibold">
              {formatTiempo(detalle.tiempototal)}
            </span>
          </div>
          <div className="bg-base-200 rounded p-2 flex flex-col">
            <span className="text-[10px] uppercase opacity-60 flex items-center gap-1">
              <Target className="w-3 h-3" /> Intentos
            </span>
            <span className="font-semibold">
              {detalle.intentosrealizados ?? disparos.length}
            </span>
          </div>
          <div className="bg-base-200 rounded p-2 flex flex-col">
            <span className="text-[10px] uppercase opacity-60 flex items-center gap-1">
              <ListChecks className="w-3 h-3" /> Aciertos
            </span>
            <span className="font-semibold">
              {disparos.filter((d) => d.hit).length}/{disparos.length}
            </span>
          </div>
        </div>

        {resolucion ? (
          <div className="flex flex-col gap-3">
            <div>
              <h3 className="text-sm font-bold flex items-center gap-1 mb-2">
                <Calculator className="w-4 h-4 text-primary" /> Procedimiento
              </h3>
              <pre className="bg-base-200 rounded p-3 text-xs whitespace-pre-wrap font-mono">
                {resolucion.procedimiento?.trim() || "(sin procedimiento)"}
              </pre>
            </div>

            <div>
              <h3 className="text-sm font-bold mb-2">Respuestas del alumno</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {renderRespuesta("Ángulo", "°", resolucion.respuestas?.angulo)}
                {renderRespuesta(
                  "Velocidad",
                  "m/s",
                  resolucion.respuestas?.velocidad,
                )}
                {renderRespuesta(
                  "Altura máx.",
                  "m",
                  resolucion.respuestas?.alturaMaxima,
                )}
                {renderRespuesta(
                  "Alcance",
                  "m",
                  resolucion.respuestas?.alcance,
                )}
                {renderRespuesta(
                  "Tiempo vuelo",
                  "s",
                  resolucion.respuestas?.tiempoVuelo,
                )}
              </div>
            </div>

            {resolucion.notas ? (
              <div>
                <h3 className="text-sm font-bold mb-2">Notas</h3>
                <p className="bg-base-200 rounded p-3 text-sm whitespace-pre-wrap">
                  {resolucion.notas}
                </p>
              </div>
            ) : null}
          </div>
        ) : null}

        {disparos.length > 0 ? (
          <div>
            <h3 className="text-sm font-bold mb-2">
              Disparos ({disparos.length})
            </h3>
            <div className="overflow-x-auto">
              <table className="table table-xs">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Ángulo</th>
                    <th>Vel.</th>
                    <th>Alt.</th>
                    <th>Resultado</th>
                    <th>Dist.</th>
                  </tr>
                </thead>
                <tbody>
                  {disparos.map((d) => (
                    <tr key={d.n}>
                      <td>{d.n}</td>
                      <td>{d.angle.toFixed(0)}°</td>
                      <td>{d.velocity.toFixed(0)}</td>
                      <td>{d.cannonHeight.toFixed(0)}</td>
                      <td>
                        {d.hit ? (
                          <span className="text-success font-semibold">
                            Acierto
                          </span>
                        ) : (
                          <span className="opacity-60">Falló</span>
                        )}
                      </td>
                      <td>{d.distance.toFixed(1)} m</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {!resolucion && disparos.length === 0 ? (
          <p className="text-sm opacity-60 text-center py-4">
            Esta interacción no tiene datos de resolución capturados.
          </p>
        ) : null}
      </div>
    </Modal>
  );
};

export default InteraccionDetalleModal;
