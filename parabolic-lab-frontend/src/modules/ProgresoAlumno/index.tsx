"use client";
import { Badge } from "amvasdev-ui";
import { InteraccionEscenario } from "@/models/interaccion_escenario";
import { useProgresoAlumno } from "@/queries/useProgresoAlumno";

const formatDate = (date: Date | string | null | undefined): string => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatScore = (value: number | null | undefined): string =>
  value !== null && value !== undefined ? value.toFixed(1) : "—";

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
}

const InteraccionRow = ({ interaccion }: InteraccionRowProps) => (
  <tr>
    <td className="font-mono text-xs opacity-60">
      {interaccion.idescenario.slice(0, 8)}…
    </td>
    <td>{formatDate(interaccion.fechainicio)}</td>
    <td>{formatScore(interaccion.puntuacion)}</td>
    <td>
      {interaccion.completado ? (
        <Badge variant="primary" soft>
          Completado
        </Badge>
      ) : (
        <Badge variant="neutral">
          En progreso
        </Badge>
      )}
    </td>
  </tr>
);

const ProgresoAlumno = () => {
  const { data: progreso, isLoading } = useProgresoAlumno();

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

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
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
                  </tr>
                </thead>
                <tbody>
                  {progreso.interacciones.map((interaccion) => (
                    <InteraccionRow
                      key={interaccion.idinteraccion}
                      interaccion={interaccion}
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
    </div>
  );
};

export default ProgresoAlumno;
