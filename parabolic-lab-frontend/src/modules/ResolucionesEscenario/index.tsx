"use client";
import { Badge } from "amvasdev-ui";
import { ArrowLeft, Clock, Target, Trophy } from "lucide-react";
import { useState } from "react";
import CustomLink from "@/components/CustomLink";
import InteraccionDetalleModal from "@/components/InteraccionDetalleModal";
import { useResolucionesEscenario } from "@/queries/useResolucionesEscenario";
import type { ResolucionAlumno } from "@/types/desempeno";

interface ResolucionesEscenarioProps {
  classroomId: string;
  scenarioId: string;
}

const toNumber = (v: number | string | null | undefined): number | null => {
  if (v === null || v === undefined || v === "") return null;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isNaN(n) ? null : n;
};

const formatMin = (segundos: number | null | undefined): string => {
  if (!segundos || segundos < 0) return "0 min";
  const min = segundos / 60;
  if (min < 1) return `${Math.round(segundos)} s`;
  return `${min.toFixed(1)} min`;
};

const formatFecha = (iso: string | null): string => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("es-MX", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const ResolucionesEscenarioModule = ({
  classroomId,
  scenarioId,
}: ResolucionesEscenarioProps) => {
  const { data, isLoading, isError } = useResolucionesEscenario(
    classroomId,
    scenarioId,
  );
  const [selected, setSelected] = useState<ResolucionAlumno | null>(null);

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
          <span>No se pudieron cargar las resoluciones de este escenario.</span>
        </div>
      </div>
    );
  }

  const completados = data.resoluciones.filter((r) => r.completado).length;
  const puntuacionesNum = data.resoluciones
    .map((r) => toNumber(r.puntuacion))
    .filter((n): n is number => n !== null);
  const promedio =
    puntuacionesNum.length > 0
      ? puntuacionesNum.reduce((acc, n) => acc + n, 0) / puntuacionesNum.length
      : 0;

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
            {data.escenario_nombre}
          </h1>
          <div className="flex items-center gap-2 flex-wrap mt-1">
            <Badge variant="info">{data.escenario_dificultad}</Badge>
            <span className="text-sm opacity-70">Resoluciones de alumnos</span>
          </div>
        </div>
      </div>

      {data.escenario_descripcion ? (
        <p className="text-sm opacity-80 bg-base-200 rounded p-3">
          {data.escenario_descripcion}
        </p>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard
          label="Alumnos que han resuelto"
          value={`${data.resoluciones.length}`}
        />
        <StatCard
          label="Completaron"
          value={`${completados}/${data.resoluciones.length}`}
        />
        <StatCard
          label="Promedio"
          value={promedio > 0 ? promedio.toFixed(1) : "—"}
        />
      </div>

      <section>
        <h2 className="text-lg font-bold mb-3">Resoluciones</h2>
        {data.resoluciones.length === 0 ? (
          <p className="text-sm opacity-60 text-center py-8 bg-base-200 rounded">
            Aún no hay alumnos que hayan trabajado en este escenario.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {data.resoluciones.map((r) => {
              const nombre = [
                r.alumno_nombre,
                r.alumno_apellidopaterno,
                r.alumno_apellidomaterno,
              ]
                .filter(Boolean)
                .join(" ");
              return (
                <button
                  key={r.idinteraccion}
                  onClick={() => setSelected(r)}
                  className="bg-base-200 hover:bg-base-300 rounded-lg p-3 text-left transition-colors flex flex-col sm:flex-row sm:items-center gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold truncate">{nombre}</span>
                      {r.completado ? (
                        <Badge variant="success" size="sm">
                          Completado
                        </Badge>
                      ) : (
                        <Badge variant="warning" size="sm">
                          En curso
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs opacity-60 mt-1">
                      {formatFecha(r.fechafin ?? r.fechainicio)}
                    </div>
                  </div>
                  <div className="flex gap-4 text-sm shrink-0">
                    <Metric
                      icon={<Trophy className="w-3 h-3" />}
                      value={(() => {
                        const n = toNumber(r.puntuacion);
                        return n !== null ? n.toFixed(0) : "—";
                      })()}
                    />
                    <Metric
                      icon={<Target className="w-3 h-3" />}
                      value={`${r.intentosrealizados ?? 0}`}
                    />
                    <Metric
                      icon={<Clock className="w-3 h-3" />}
                      value={formatMin(r.tiempototal)}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      <InteraccionDetalleModal
        isOpen={selected !== null}
        onClose={() => setSelected(null)}
        detalle={
          selected
            ? {
              titulo: data.escenario_nombre,
              subtitulo: [
                selected.alumno_nombre,
                selected.alumno_apellidopaterno,
                selected.alumno_apellidomaterno,
              ]
                .filter(Boolean)
                .join(" "),
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

const StatCard = ({ label, value }: { label: string; value: string }) => (
  <div className="bg-base-200 rounded-lg p-3 flex flex-col">
    <span className="text-xs opacity-60">{label}</span>
    <span className="font-bold text-lg">{value}</span>
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

export default ResolucionesEscenarioModule;
