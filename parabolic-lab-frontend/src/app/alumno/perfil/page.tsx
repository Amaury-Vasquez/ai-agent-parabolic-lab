import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";
import {
  fetchInstitucion,
  fetchMe,
  INSTITUCION_QUERY_KEY,
  ME_QUERY_KEY,
} from "@/fetchers/auth";
import {
  fetchMisInteracciones,
  MIS_INTERACCIONES_QUERY_KEY,
} from "@/fetchers/interaccionesAlumno";
import PerfilAlumno from "@/modules/PerfilAlumno";

export default async function PerfilAlumnoPage() {
  const queryClient = new QueryClient();
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  if (token) {
    const me = await queryClient.fetchQuery({
      queryKey: ME_QUERY_KEY,
      queryFn: () => fetchMe(token),
    });

    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: INSTITUCION_QUERY_KEY(me.idinstitucion),
        queryFn: () => fetchInstitucion(token, me.idinstitucion),
      }),
      queryClient.prefetchQuery({
        queryKey: MIS_INTERACCIONES_QUERY_KEY,
        queryFn: () => fetchMisInteracciones(token),
      }),
    ]);
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PerfilAlumno />
    </HydrationBoundary>
  );
}
