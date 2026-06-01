import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";
import { fetchMisEscenarios, MIS_ESCENARIOS_QUERY_KEY } from "@/fetchers/escenarios";
import {
  fetchProgresoAlumno,
  PROGRESO_ALUMNO_QUERY_KEY,
} from "@/fetchers/interaccionesAlumno";
import ProgresoAlumno from "@/modules/ProgresoAlumno";
import { buildMetadata } from "@/utils/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Mi progreso",
  description:
    "Sigue tu avance en los escenarios de tiro parabólico y revisa tus estadísticas de aprendizaje.",
  noindex: true,
});

export default async function ProgresoAlumnoPage() {
  const queryClient = new QueryClient();
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  if (token) {
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: PROGRESO_ALUMNO_QUERY_KEY,
        queryFn: () => fetchProgresoAlumno(token),
      }),
      queryClient.prefetchQuery({
        queryKey: MIS_ESCENARIOS_QUERY_KEY,
        queryFn: () => fetchMisEscenarios(token),
      }),
    ]);
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProgresoAlumno />
    </HydrationBoundary>
  );
}
