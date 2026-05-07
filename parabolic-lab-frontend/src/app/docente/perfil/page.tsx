import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";
import {
  DOCENTE_QUERY_KEY,
  fetchDocente,
  fetchInstitucion,
  fetchMe,
  ME_QUERY_KEY,
} from "@/fetchers/auth";
import PerfilDocente from "@/modules/PerfilDocente";
import { INSTITUCION_QUERY_KEY } from "@/fetchers/auth";

export default async function PerfilPage() {
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
        queryKey: DOCENTE_QUERY_KEY,
        queryFn: () => fetchDocente(token),
      }),
      queryClient.prefetchQuery({
        queryKey: INSTITUCION_QUERY_KEY(me.idinstitucion),
        queryFn: () => fetchInstitucion(token, me.idinstitucion),
      }),
    ]);
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PerfilDocente />
    </HydrationBoundary>
  );
}
