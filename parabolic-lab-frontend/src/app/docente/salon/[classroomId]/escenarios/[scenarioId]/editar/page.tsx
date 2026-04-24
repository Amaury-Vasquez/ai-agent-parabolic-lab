import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";
import { fetchEscenario, ESCENARIO_QUERY_KEY } from "@/queries/useEscenario";
import EditarEscenario from "@/modules/ScenarioEditor/EditarEscenario";

interface PageProps {
  params: Promise<{
    classroomId: string;
    scenarioId: string;
  }>;
}

export default async function EditarEscenarioPage({ params }: PageProps) {
  const { classroomId, scenarioId } = await params;
  const queryClient = new QueryClient();
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  if (token) {
    await queryClient.prefetchQuery({
      queryKey: ESCENARIO_QUERY_KEY(scenarioId),
      queryFn: () => fetchEscenario(token, scenarioId),
    });
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <EditarEscenario classroomId={classroomId} scenarioId={scenarioId} />
    </HydrationBoundary>
  );
}