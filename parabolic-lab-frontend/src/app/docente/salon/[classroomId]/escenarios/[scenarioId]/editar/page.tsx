import EditarEscenario from "@/modules/ScenarioEditor/EditarEscenario";

interface PageProps {
  params: Promise<{
    classroomId: string;
    scenarioId: string;
  }>;
}

export default async function EditarEscenarioPage({ params }: PageProps) {
  const { classroomId, scenarioId } = await params;
  return <EditarEscenario classroomId={classroomId} scenarioId={scenarioId} />;
}