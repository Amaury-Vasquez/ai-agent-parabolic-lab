import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";
import { fetchMySalones, MY_SALONES_QUERY_KEY } from "@/fetchers/salones";
import NuevoEscenario from "@/modules/Biblioteca/NuevoEscenario";
import { buildMetadata } from "@/utils/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Nuevo escenario",
  description:
    "Crea un nuevo escenario de tiro parabólico definiendo parámetros físicos, objetivos de aprendizaje e instrucciones para tus estudiantes.",
  noindex: true,
});

export default async function NuevoEscenarioPage() {
  const queryClient = new QueryClient();
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  if (token) {
    await queryClient.prefetchQuery({
      queryKey: MY_SALONES_QUERY_KEY,
      queryFn: () => fetchMySalones(token),
    });
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <NuevoEscenario />
    </HydrationBoundary>
  );
}
