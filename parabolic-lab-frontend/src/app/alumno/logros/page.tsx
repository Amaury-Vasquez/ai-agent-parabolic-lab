import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";
import {
  fetchProgresoAlumno,
  PROGRESO_ALUMNO_QUERY_KEY,
} from "@/fetchers/interaccionesAlumno";
import LogrosAlumno from "@/modules/LogrosAlumno";

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
