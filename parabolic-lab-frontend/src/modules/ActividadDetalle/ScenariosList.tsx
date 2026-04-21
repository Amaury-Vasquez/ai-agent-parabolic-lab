"use client";
import { useActividad } from "@/queries/useActividad";
import { useEscenariosBySalon } from "@/queries/useEscenario";
import ScenarioCard from "./ScenarioCard";

interface ScenariosListProps {
  idactividad: string;
}

const ScenariosList = ({ idactividad }: ScenariosListProps) => {
  const { data: actividad } = useActividad(idactividad);
  const { data: escenarios, isLoading } = useEscenariosBySalon(
    actividad?.idsalon ?? ""
  );

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <h2 className="text-lg md:text-2xl font-bold ml-4 md:ml-6">
          Escenarios
        </h2>
        <div className="flex justify-center p-8">
          <span className="loading loading-spinner loading-md" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg md:text-2xl font-bold ml-4 md:ml-6">
        Escenarios
      </h2>
      {escenarios && escenarios.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:gap-6">
          {escenarios.map((scenario) => (
            <ScenarioCard key={scenario.idescenario} scenario={scenario} />
          ))}
        </div>
      ) : (
        <div className="bg-base-200 rounded-lg p-4 text-center md:p-6">
          <p className="opacity-70">
            No hay escenarios disponibles para esta actividad.
          </p>
        </div>
      )}
    </div>
  );
};

export default ScenariosList;