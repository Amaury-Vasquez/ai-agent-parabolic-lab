import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import GestionEstudiantesGlobal from "@/modules/GestionEstudiantesGlobal";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";
import {
  fetchEstudiantesGlobales,
  getEstudiantesGlobalesQueryKey,
  fetchMySalones,
  MY_SALONES_QUERY_KEY,
} from "@/fetchers/salones";
import { buildMetadata } from "@/utils/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Estudiantes",
  description:
    "Consulta y administra a todos los estudiantes de tus salones y revisa su desempeño en ParabolicLab.",
  noindex: true,
});

export default async function EstudiantesPage() {
  const queryClient = new QueryClient();
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  if (token) {
    // Prefetch estudiantes globales (sin filtros inicialmente)
    await queryClient.prefetchQuery({
      queryKey: getEstudiantesGlobalesQueryKey("nombre", "asc", undefined),
      queryFn: () =>
        fetchEstudiantesGlobales(token, {
          sort_by: "nombre",
          order: "asc",
        }),
    });

    // Prefetch salones para el filtro
    await queryClient.prefetchQuery({
      queryKey: MY_SALONES_QUERY_KEY,
      queryFn: () => fetchMySalones(token),
    });
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <GestionEstudiantesGlobal />
    </HydrationBoundary>
  );
}
