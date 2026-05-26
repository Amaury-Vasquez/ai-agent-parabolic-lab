import { cookies } from "next/headers";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";
import { fetchMySalones, MY_SALONES_QUERY_KEY } from "@/fetchers/salones";
import { fetchEscenariosBySalon, ESCENARIOS_SALON_QUERY_KEY } from "@/fetchers/escenarios";
import {
  fetchMisInteracciones,
  MIS_INTERACCIONES_QUERY_KEY,
} from "@/fetchers/interaccionesAlumno";
import SalonAlumno from "@/modules/SalonAlumno";

interface SalonPageProps {
  params: Promise<{ classroomId: string }>;
}

export default async function SalonAlumnoPage({ params }: SalonPageProps) {
  const { classroomId } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  const queryClient = new QueryClient();

  if (token) {
    try {
      const salones = await queryClient.fetchQuery({
        queryKey: MY_SALONES_QUERY_KEY,
        queryFn: () => fetchMySalones(token),
      });
      const salon = salones.find((s) => s.codigoacceso === classroomId);
      const tasks: Array<Promise<unknown>> = [
        queryClient.prefetchQuery({
          queryKey: MIS_INTERACCIONES_QUERY_KEY,
          queryFn: () => fetchMisInteracciones(token),
        }),
      ];
      if (salon) {
        tasks.push(
          queryClient.prefetchQuery({
            queryKey: ESCENARIOS_SALON_QUERY_KEY(salon.idsalon),
            queryFn: () => fetchEscenariosBySalon(token, salon.idsalon),
          })
        );
      }
      await Promise.all(tasks);
    } catch {
      // Si falla, el cliente manejará el error
    }
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SalonAlumno classroomId={classroomId} />
    </HydrationBoundary>
  );
}
