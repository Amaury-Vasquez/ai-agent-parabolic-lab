"use client";
import ActivitiesList from "@/components/ActivitiesList";
import { useMisActividades } from "@/queries/useMisActividades";

const Actividades = () => {
  const { data: actividades, isLoading, isError } = useMisActividades();

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">Mis actividades</h1>
        <p className="mt-1 text-sm md:text-base opacity-70">
          Todas las actividades asignadas en tus salones
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg" />
        </div>
      ) : isError ? (
        <div className="alert alert-error">
          <span>No se pudieron cargar tus actividades. Intenta de nuevo más tarde.</span>
        </div>
      ) : (
        <ActivitiesList
          activities={actividades ?? []}
          emptyMessage="Aún no tienes actividades asignadas. Tu docente te las asignará pronto."
        />
      )}
    </div>
  );
};

export default Actividades;
