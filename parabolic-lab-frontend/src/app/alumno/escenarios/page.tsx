import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";
import {
  fetchMisEscenarios,
  MIS_ESCENARIOS_QUERY_KEY,
} from "@/fetchers/escenarios";
import {
  fetchMisInteracciones,
  MIS_INTERACCIONES_QUERY_KEY,
} from "@/fetchers/interaccionesAlumno";
import EscenariosAlumno from "@/modules/EscenariosAlumno";

export default async function EscenariosAlumnoPage() {
  const queryClient = new QueryClient();
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  if (token) {
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: MIS_ESCENARIOS_QUERY_KEY,
        queryFn: () => fetchMisEscenarios(token),
      }),
      queryClient.prefetchQuery({
        queryKey: MIS_INTERACCIONES_QUERY_KEY,
        queryFn: () => fetchMisInteracciones(token),
      }),
    ]);
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <EscenariosAlumno />
    </HydrationBoundary>
  );
}
