"use client";

import { useEscenario } from "@/queries/useEscenario";
import ScenarioEditor from "./index";

interface EditarEscenarioProps {
  scenarioId: string;
}

const EditarEscenario = ({ scenarioId }: EditarEscenarioProps) => {
  const { data: escenario, isLoading } = useEscenario(scenarioId);

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  return <ScenarioEditor scenarioId={scenarioId} initialData={escenario} />;
};

export default EditarEscenario;
