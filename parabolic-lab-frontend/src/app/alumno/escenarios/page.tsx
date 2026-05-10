import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";
import EscenariosAlumno from "@/modules/EscenariosAlumno";
import {
  fetchMisEscenarios,
  MIS_ESCENARIOS_QUERY_KEY,
} from "@/fetchers/escenarios";

export default async function EscenariosAlumnoPage() {
  const queryClient = new QueryClient();
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  if (token) {
    await queryClient.prefetchQuery({
      queryKey: MIS_ESCENARIOS_QUERY_KEY,
      queryFn: () => fetchMisEscenarios(token),
    });
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <EscenariosAlumno />
    </HydrationBoundary>
  );
}
