import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";
import {
  ADMIN_ALUMNOS_ACTIVIDAD_QUERY_KEY,
  fetchAdminAlumnosActividad,
} from "@/fetchers/admin";
import AdminActividad from "@/modules/AdminActividad";

export default async function AdminActividadPage() {
  const queryClient = new QueryClient();
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  if (token) {
    await queryClient.prefetchQuery({
      queryKey: ADMIN_ALUMNOS_ACTIVIDAD_QUERY_KEY,
      queryFn: () => fetchAdminAlumnosActividad(token),
    });
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AdminActividad />
    </HydrationBoundary>
  );
}
