import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";
import PerfilDocente from "@/modules/PerfilDocente";
import { fetchMe, ME_QUERY_KEY, fetchDocente, DOCENTE_QUERY_KEY } from "@/fetchers/auth";

export default async function PerfilPage() {
  const queryClient = new QueryClient();
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  if (token) {
    try {
      await queryClient.prefetchQuery({
        queryKey: ME_QUERY_KEY,
        queryFn: () => fetchMe(token),
      });

      // Prefetch docente profile for docentes
      await queryClient.prefetchQuery({
        queryKey: DOCENTE_QUERY_KEY,
        queryFn: () => fetchDocente(token),
      });
    } catch {
      // Silently fail, let the client handle errors
    }
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PerfilDocente />
    </HydrationBoundary>
  );
}
