"use client";
import { Badge } from "amvasdev-ui";
import { CheckCircle2 } from "lucide-react";
import BackButton from "@/components/BackButton";
import CustomLink from "@/components/CustomLink";
import { useEscenarioCompletion } from "@/queries/useEscenarioCompletion";
import { useMySalones } from "@/queries/useMySalones";

interface EscenarioRowProps {
  escenario: { idescenario: string; nombre: string };
}

const EscenarioRow = ({ escenario }: EscenarioRowProps) => {
  const { completado, mejorPuntuacion } = useEscenarioCompletion(
    escenario.idescenario
  );
  return (
    <div className="flex items-center justify-between gap-4 bg-base-200 rounded-lg p-4">
      <div className="min-w-0 flex-1 flex items-center gap-2">
        {completado ? (
          <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
        ) : null}
        <span className="font-medium truncate">{escenario.nombre}</span>
        {completado && mejorPuntuacion !== null ? (
          <Badge variant="success">{Math.round(mejorPuntuacion)} pts</Badge>
        ) : null}
      </div>
      <CustomLink
        href={`/alumno/escenario/${escenario.idescenario}`}
        variant={completado ? "ghost" : "primary"}
        size="sm"
        className="whitespace-nowrap"
      >
        {completado ? "Repetir" : "Ir a simulación"}
      </CustomLink>
    </div>
  );
};

const Actividades = () => {
  const { data: salones, isLoading, isError } = useMySalones();

  const salonesConEscenarios = (salones ?? []).filter(
    (s) => s.escenarios.length > 0
  );

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 md:p-8">
        <div className="alert alert-error">
          <span>
            No se pudieron cargar tus actividades. Intenta de nuevo más tarde.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <BackButton />
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Mis actividades</h1>
          <p className="mt-1 text-sm md:text-base opacity-70">
            Todas las actividades asignadas en tus salones
          </p>
        </div>
      </div>

      {salonesConEscenarios.length === 0 ? (
        <p className="opacity-60 text-center py-8">
          Aún no tienes escenarios asignados en tus salones.
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          {salonesConEscenarios.map((salon) => (
            <div
              key={salon.idsalon}
              className="card bg-base-100 shadow-md border border-solid border-base-300"
            >
              <div className="card-body gap-4">
                <h2 className="text-xl font-semibold">{salon.nombresalon}</h2>
                <div className="flex flex-col gap-3">
                  {salon.escenarios.map((escenario) => (
                    <EscenarioRow
                      key={escenario.idescenario}
                      escenario={escenario}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Actividades;
