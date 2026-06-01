import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";
import {
  fetchProgresoAlumno,
  PROGRESO_ALUMNO_QUERY_KEY,
} from "@/fetchers/interaccionesAlumno";
import LogrosAlumno from "@/modules/LogrosAlumno";
import { buildMetadata } from "@/utils/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Logros",
  description:
    "Descubre los logros que has desbloqueado practicando tiro parabólico en ParabolicLab.",
  noindex: true,
});

export default async function LogrosAlumnoPage() {
  const queryClient = new QueryClient();
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  if (token) {
    await queryClient.prefetchQuery({
      queryKey: PROGRESO_ALUMNO_QUERY_KEY,
      queryFn: () => fetchProgresoAlumno(token),
    });
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <LogrosAlumno />
    </HydrationBoundary>
  );
}
