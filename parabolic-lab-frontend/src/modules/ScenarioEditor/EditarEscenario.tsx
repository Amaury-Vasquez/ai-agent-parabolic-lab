"use client";

import { useEscenario } from "@/queries/useEscenario";
import ScenarioEditor from "./index";

interface EditarEscenarioProps {
  classroomId: string;
  scenarioId: string;
}

const EditarEscenario = ({
  classroomId,
  scenarioId,
}: EditarEscenarioProps) => {
  const { data: escenario, isLoading } = useEscenario(scenarioId);

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  return (
    <ScenarioEditor
      classroomId={classroomId}
      scenarioId={scenarioId}
      initialData={escenario}
    />
  );
};

export default EditarEscenario;

