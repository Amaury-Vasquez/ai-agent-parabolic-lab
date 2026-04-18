import ScenarioEditor from "@/modules/ScenarioEditor";

interface PageProps {
  params: Promise<{
    classroomId: string;
    scenarioId: string;
  }>;
}

export default async function EditarEscenarioPage({ params }: PageProps) {
  const { classroomId, scenarioId } = await params;

  // TODO: Fetch scenario data from API
  // const scenario = await getScenario(scenarioId);

  return (
    <ScenarioEditor
      classroomId={classroomId}
      scenarioId={scenarioId}
      // initialData={scenario}
    />
  );
}
