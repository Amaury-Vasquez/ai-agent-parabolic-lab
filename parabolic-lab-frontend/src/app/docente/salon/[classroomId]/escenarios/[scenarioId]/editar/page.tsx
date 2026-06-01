import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";
import { fetchEscenario, ESCENARIO_QUERY_KEY } from "@/fetchers/escenarios";
import EditarEscenario from "@/modules/ScenarioEditor/EditarEscenario";
import { buildMetadata } from "@/utils/metadata";

interface PageProps {
  params: Promise<{
    classroomId: string;
    scenarioId: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { scenarioId } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  let nombre: string | null = null;
  if (token) {
    try {
      const escenario = await fetchEscenario(token, scenarioId);
      nombre = escenario?.nombre ?? null;
    } catch {
      nombre = null;
    }
  }
  return buildMetadata({
    title: nombre ? `Editar escenario: ${nombre}` : "Editar escenario",
    description: nombre
      ? `Edita los parámetros, objetivos e instrucciones del escenario «${nombre}» en ParabolicLab.`
      : "Edita los parámetros, objetivos e instrucciones de un escenario de tiro parabólico en ParabolicLab.",
    noindex: true,
  });
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