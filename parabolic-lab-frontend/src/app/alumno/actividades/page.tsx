import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";
import {
  fetchMisInteracciones,
  MIS_INTERACCIONES_QUERY_KEY,
} from "@/fetchers/interaccionesAlumno";
import { fetchMySalones, MY_SALONES_QUERY_KEY } from "@/fetchers/salones";
import Actividades from "@/modules/Actividades";

export default async function ActividadesPage() {
  const queryClient = new QueryClient();
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  if (token) {
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: MY_SALONES_QUERY_KEY,
        queryFn: () => fetchMySalones(token),
      }),
      queryClient.prefetchQuery({
        queryKey: MIS_INTERACCIONES_QUERY_KEY,
        queryFn: () => fetchMisInteracciones(token),
      }),
    ]);
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Actividades />
    </HydrationBoundary>
  );
}
