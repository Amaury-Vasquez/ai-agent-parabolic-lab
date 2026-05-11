import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";
import {
  fetchMisActividades,
  MIS_ACTIVIDADES_QUERY_KEY,
} from "@/fetchers/actividades";
import Actividades from "@/modules/Actividades";

export default async function ActividadesPage() {
  const queryClient = new QueryClient();
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  if (token) {
    await queryClient.prefetchQuery({
      queryKey: MIS_ACTIVIDADES_QUERY_KEY,
      queryFn: () => fetchMisActividades(token),
    });
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Actividades />
    </HydrationBoundary>
  );
}
