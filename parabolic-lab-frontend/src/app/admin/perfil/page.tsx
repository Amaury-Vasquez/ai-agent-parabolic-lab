import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";
import {
  fetchInstitucion,
  fetchMe,
  INSTITUCION_QUERY_KEY,
  ME_QUERY_KEY,
} from "@/fetchers/auth";
import PerfilDocente from "@/modules/PerfilDocente";
import { buildMetadata } from "@/utils/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Mi perfil",
  description:
    "Consulta y actualiza la información de tu perfil de administrador y de tu institución.",
  noindex: true,
});

export default async function AdminPerfilPage() {
  const queryClient = new QueryClient();
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  if (token) {
    const me = await queryClient.fetchQuery({
      queryKey: ME_QUERY_KEY,
      queryFn: () => fetchMe(token),
    });

    await queryClient.prefetchQuery({
      queryKey: INSTITUCION_QUERY_KEY(me.idinstitucion),
      queryFn: () => fetchInstitucion(token, me.idinstitucion),
    });
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PerfilDocente />
    </HydrationBoundary>
  );
}
