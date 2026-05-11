"use client";
import { ArrowLeft } from "lucide-react";
import { useMemo } from "react";
import ActivitiesList from "@/components/ActivitiesList";
import CustomLink from "@/components/CustomLink";
import { useMisActividades } from "@/queries/useMisActividades";

interface ActividadesSalonProps {
  classroomId: string;
}

const ActividadesSalon = ({ classroomId }: ActividadesSalonProps) => {
  const { data: actividades, isLoading, isError } = useMisActividades();

  const actividadesSalon = useMemo(
    () => (actividades ?? []).filter((a) => a.idsalon === classroomId),
    [actividades, classroomId],
  );

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center gap-3 sm:gap-4 mb-6 md:mb-8">
        <CustomLink
          href={`/alumno/salon/${classroomId}`}
          variant="ghost"
          className="btn-square"
        >
          <ArrowLeft size={20} />
        </CustomLink>
        <div className="min-w-0">
          <h1 className="text-2xl md:text-3xl font-bold">Actividades del salón</h1>
          <p className="mt-1 text-sm md:text-base opacity-70">
            Actividades asignadas para este salón
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg" />
        </div>
      ) : isError ? (
        <div className="alert alert-error">
          <span>No se pudieron cargar las actividades del salón.</span>
        </div>
      ) : (
        <ActivitiesList
          activities={actividadesSalon}
          emptyMessage="No hay actividades asignadas para este salón"
        />
      )}
    </div>
  );
};

export default ActividadesSalon;
