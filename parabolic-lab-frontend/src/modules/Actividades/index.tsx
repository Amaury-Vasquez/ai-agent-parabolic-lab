"use client";
import CustomLink from "@/components/CustomLink";
import { useMySalones } from "@/queries/useMySalones";

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
          <span>No se pudieron cargar tus actividades. Intenta de nuevo más tarde.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Mis actividades</h1>
        <p className="mt-1 text-sm md:text-base opacity-70">
          Todas las actividades asignadas en tus salones
        </p>
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
                    <div
                      key={escenario.idescenario}
                      className="flex items-center justify-between gap-4 bg-base-200 rounded-lg p-4"
                    >
                      <span className="font-medium">{escenario.nombre}</span>
                      <CustomLink
                        href={`/alumno/escenario/${escenario.idescenario}`}
                        variant="primary"
                        size="sm"
                        className="whitespace-nowrap"
                      >
                        Ir a simulación
                      </CustomLink>
                    </div>
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
