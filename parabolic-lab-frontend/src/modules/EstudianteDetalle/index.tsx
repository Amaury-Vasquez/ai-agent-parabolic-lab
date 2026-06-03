"use client";
import { Badge } from "amvasdev-ui";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Target,
  Trophy,
} from "lucide-react";
import { useState } from "react";
import CustomLink from "@/components/CustomLink";
import InteraccionDetalleModal from "@/components/InteraccionDetalleModal";
import { useDesempenoAlumno } from "@/queries/useDesempenoAlumno";
import type { InteraccionConEscenario } from "@/types/desempeno";

interface EstudianteDetalleProps {
  classroomId: string;
  alumnoId: string;
}

const toNumber = (v: number | string | null | undefined): number | null => {
  if (v === null || v === undefined || v === "") return null;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isNaN(n) ? null : n;
};

const formatMin = (min: number | null | undefined): string => {
  if (!min || min < 0) return "0 min";
  if (min < 1) return `${Math.round(min * 60)} s`;
  return `${min.toFixed(1)} min`;
};

const formatPuntos = (
  v: number | string | null | undefined,
  digits = 0,
): string => {
  const n = toNumber(v);
  return n !== null ? n.toFixed(digits) : "—";
};

const formatFechaCorta = (iso: string | null): string => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("es-MX", { day: "numeric", month: "short" });
};

const EstudianteDetalle = ({
  classroomId,
  alumnoId,
}: EstudianteDetalleProps) => {
  const { data, isLoading, isError } = useDesempenoAlumno(
    classroomId,
    alumnoId,
  );
  const [selected, setSelected] = useState<InteraccionConEscenario | null>(
    null,
  );

  if (isLoading) {
    return (
      <div className="p-4 md:p-8 flex justify-center py-12">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-4 md:p-8">
        <div className="alert alert-error">
          <span>No se pudo cargar el desempeño del alumno.</span>
        </div>
      </div>
    );
  }

  const nombreCompleto = [
    data.nombre,
    data.apellidopaterno,
    data.apellidomaterno,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="p-4 md:p-8 flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <CustomLink
          href={`/docente/salon/${classroomId}`}
          variant="ghost"
          className="btn-square"
        >
          <ArrowLeft size={20} />
        </CustomLink>
        <div className="min-w-0">
          <h1 className="text-2xl md:text-3xl font-bold truncate">
            {nombreCompleto}
          </h1>
          <p className="text-sm opacity-70">{data.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={<Trophy className="w-5 h-5 text-primary" />}
          label="Mejor puntuación"
          value={formatPuntos(data.mejor_puntuacion, 0)}
        />
        <StatCard
          icon={<Target className="w-5 h-5 text-info" />}
          label="Promedio"
          value={formatPuntos(data.promedio_puntuacion, 1)}
        />
        <StatCard
          icon={<CheckCircle2 className="w-5 h-5 text-success" />}
          label="Escenarios completados"
          value={`${data.escenarios_completados}/${data.total_interacciones}`}
        />
        <StatCard
          icon={<Clock className="w-5 h-5 text-warning" />}
          label="Tiempo total"
          value={formatMin(data.tiempo_total_minutos)}
        />
      </div>

      <section>
        <h2 className="text-lg font-bold mb-3">Historial de escenarios</h2>
        {data.interacciones.length === 0 ? (
          <p className="text-sm opacity-60 text-center py-8 bg-base-200 rounded">
            Este alumno aún no tiene interacciones registradas.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {data.interacciones.map((interaccion) => (
              <button
                key={interaccion.idinteraccion}
                onClick={() => setSelected(interaccion)}
                className="bg-base-200 hover:bg-base-300 rounded-lg p-3 text-left transition-colors flex flex-col sm:flex-row sm:items-center gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold truncate">
                      {interaccion.escenario_nombre}
                    </span>
                    <Badge variant="info" size="sm">
                      {interaccion.escenario_dificultad}
                    </Badge>
                    {interaccion.completado ? (
                      <Badge variant="success" size="sm">
                        Completado
                      </Badge>
                    ) : null}
                  </div>
                  <div className="text-xs opacity-60 mt-1">
                    {formatFechaCorta(interaccion.fechafin ?? interaccion.fechainicio)}
                  </div>
                </div>
                <div className="flex gap-4 text-sm shrink-0">
                  <Metric
                    icon={<Trophy className="w-3 h-3" />}
                    value={formatPuntos(interaccion.puntuacion, 0)}
                  />
                  <Metric
                    icon={<Target className="w-3 h-3" />}
                    value={`${interaccion.intentosrealizados ?? 0}`}
                  />
                  <Metric
                    icon={<Clock className="w-3 h-3" />}
                    value={formatMin(
                      interaccion.tiempototal !== null
                        ? interaccion.tiempototal / 60
                        : 0,
                    )}
                  />
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      <InteraccionDetalleModal
        isOpen={selected !== null}
        onClose={() => setSelected(null)}
        detalle={
          selected
            ? {
              titulo: selected.escenario_nombre,
              subtitulo: `${nombreCompleto} • ${selected.escenario_dificultad}`,
              fechafin: selected.fechafin,
              tiempototal: selected.tiempototal,
              puntuacion: selected.puntuacion,
              intentosrealizados: selected.intentosrealizados,
              completado: selected.completado,
              datosinteraccion: selected.datosinteraccion ?? undefined,
            }
            : null
        }
      />
    </div>
  );
};

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}
const StatCard = ({ icon, label, value }: StatCardProps) => (
  <div className="bg-base-200 rounded-lg p-3 flex items-center gap-3">
    <div className="shrink-0">{icon}</div>
    <div className="min-w-0">
      <div className="text-xs opacity-60">{label}</div>
      <div className="font-bold text-lg truncate">{value}</div>
    </div>
  </div>
);

const Metric = ({
  icon,
  value,
}: {
  icon: React.ReactNode;
  value: string;
}) => (
  <span className="flex items-center gap-1 opacity-80">
    {icon}
    <span className="tabular-nums">{value}</span>
  </span>
);

export default EstudianteDetalle;
