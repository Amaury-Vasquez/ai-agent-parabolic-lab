import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";
import {
  fetchResolucionesEscenario,
  SALON_ESCENARIO_RESOLUCIONES_QUERY_KEY,
} from "@/fetchers/salones";
import ResolucionesEscenario from "@/modules/ResolucionesEscenario";
import { buildMetadata } from "@/utils/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Respuestas del escenario",
  description:
    "Consulta y evalúa las respuestas de tus estudiantes a este escenario de tiro parabólico.",
  noindex: true,
});

interface RespuestasPageProps {
  params: Promise<{
    classroomId: string;
    scenarioId: string;
  }>;
}

export default async function RespuestasPage({ params }: RespuestasPageProps) {
  const { classroomId, scenarioId } = await params;
  const queryClient = new QueryClient();
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  if (token) {
    await queryClient.prefetchQuery({
      queryKey: SALON_ESCENARIO_RESOLUCIONES_QUERY_KEY(classroomId, scenarioId),
      queryFn: () => fetchResolucionesEscenario(token, classroomId, scenarioId),
    });
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ResolucionesEscenario
        classroomId={classroomId}
        scenarioId={scenarioId}
      />
    </HydrationBoundary>
  );
}
