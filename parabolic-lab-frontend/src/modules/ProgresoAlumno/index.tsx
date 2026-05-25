"use client";
import { Badge, Button } from "amvasdev-ui";
import { FileText } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import ReporteIntentoModal from "@/components/ReporteIntentoModal";
import { InteraccionEscenario } from "@/models/interaccion_escenario";
import { useMisEscenarios } from "@/queries/useMisEscenarios";
import { useProgresoAlumno } from "@/queries/useProgresoAlumno";

const formatDate = (date: Date | string | null | undefined): string => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatScore = (
  value: number | string | null | undefined,
): string => {
  if (value === null || value === undefined || value === "") return "—";
  const n = typeof value === "number" ? value : Number(value);
  return Number.isNaN(n) ? "—" : n.toFixed(1);
};

interface StatCardProps {
  label: string;
  value: string | number;
}

const StatCard = ({ label, value }: StatCardProps) => (
  <div className="card bg-base-100 shadow-md border border-solid border-base-300">
    <div className="card-body gap-1 p-5">
      <p className="text-sm opacity-60">{label}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  </div>
);

interface InteraccionRowProps {
  interaccion: InteraccionEscenario;
  nombreEscenario: string;
  onVerReporte: (id: string) => void;
}

const InteraccionRow = ({ interaccion, nombreEscenario, onVerReporte }: InteraccionRowProps) => (
  <tr>
    <td>{nombreEscenario}</td>
    <td>{formatDate(interaccion.fechainicio)}</td>
    <td>{formatScore(interaccion.puntuacion)}</td>
    <td>
      {interaccion.completado ? (
        <Badge variant="primary" soft>
          Completado
        </Badge>
      ) : (
        <Badge variant="neutral">En progreso</Badge>
      )}
    </td>
    <td>
      {interaccion.completado ? (
        <Button
          size="xs"
          variant="ghost"
          onClick={() => onVerReporte(interaccion.idinteraccion)}
        >
          <FileText className="w-3 h-3" />
          Ver reporte
        </Button>
      ) : null}
    </td>
  </tr>
);

const ProgresoAlumno = () => {
  const { data: progreso, isLoading } = useProgresoAlumno();
  const { data: escenarios } = useMisEscenarios();
  const [reporteId, setReporteId] = useState<string | null>(null);

  const nombrePorId = new Map(
    (escenarios ?? []).map((e) => [e.idescenario, e.nombre])
  );

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (!progreso) return null;

  const tiempoFormateado =
    progreso.tiempo_total_minutos >= 60
      ? `${Math.floor(progreso.tiempo_total_minutos / 60)}h ${Math.round(progreso.tiempo_total_minutos % 60)}min`
      : `${Math.round(progreso.tiempo_total_minutos)} min`;

  return (
    <div className="p-4 md:p-8 flex flex-col gap-6">
      <h1 className="text-2xl md:text-3xl font-bold">Mi Progreso</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <StatCard label="Escenarios totales" value={progreso.total_escenarios} />
        <StatCard label="Completados" value={progreso.escenarios_completados} />
        <StatCard
          label="Puntuación promedio"
          value={formatScore(progreso.puntuacion_promedio)}
        />
        <StatCard
          label="Mejor puntuación"
          value={formatScore(progreso.mejor_puntuacion)}
        />
        <StatCard label="Tiempo total" value={tiempoFormateado} />
      </div>

      <div className="card bg-base-100 shadow-md border border-solid border-base-300">
        <div className="card-body gap-4">
          <h2 className="text-xl font-semibold">Interacciones recientes</h2>
          {progreso.interacciones.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full">
                <thead>
                  <tr>
                    <th>Escenario</th>
                    <th>Fecha inicio</th>
                    <th>Puntuación</th>
                    <th>Estado</th>
                    <th>Reporte</th>
                  </tr>
                </thead>
                <tbody>
                  {progreso.interacciones.map((interaccion) => (
                    <InteraccionRow
                      key={interaccion.idinteraccion}
                      interaccion={interaccion}
                      nombreEscenario={
                        nombrePorId.get(interaccion.idescenario) ??
                        interaccion.idescenario.slice(0, 8) + "…"
                      }
                      onVerReporte={setReporteId}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="opacity-60 text-center py-4">
              Aún no tienes interacciones registradas.
            </p>
          )}
        </div>
      </div>

      <ReporteIntentoModal
        isOpen={!!reporteId}
        onClose={() => setReporteId(null)}
        idinteraccion={reporteId}
      />
    </div>
  );
};

export default ProgresoAlumno;
