import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";
import {
  ADMIN_ALUMNOS_ACTIVIDAD_QUERY_KEY,
  fetchAdminAlumnosActividad,
} from "@/fetchers/admin";
import AdminActividad from "@/modules/AdminActividad";
import { buildMetadata } from "@/utils/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Actividad de estudiantes",
  description:
    "Consulta la actividad reciente de los estudiantes en las actividades de tiro parabólico de tu institución.",
  noindex: true,
});

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
