import { cookies } from "next/headers";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";
import { fetchActividad, ACTIVIDAD_QUERY_KEY } from "@/queries/useActividad";
import { fetchEscenariosBySalon, ESCENARIOS_SALON_QUERY_KEY } from "@/queries/useEscenario";
import ActividadDetalle from "@/modules/ActividadDetalle";

interface ActividadPageProps {
  params: Promise<{ idactividad: string }>;
}

export default async function ActividadPage({ params }: ActividadPageProps) {
  const { idactividad } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  const queryClient = new QueryClient();

  if (token) {
    try {
      const actividad = await queryClient.fetchQuery({
        queryKey: ACTIVIDAD_QUERY_KEY(idactividad),
        queryFn: () => fetchActividad(token, idactividad),
      });

      if (actividad?.idsalon) {
        await queryClient.prefetchQuery({
          queryKey: ESCENARIOS_SALON_QUERY_KEY(actividad.idsalon),
          queryFn: () => fetchEscenariosBySalon(token, actividad.idsalon),
        });
      }
    } catch {
      // Si falla silenciosamente el cliente manejará el error
    }
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ActividadDetalle idactividad={idactividad} />
    </HydrationBoundary>
  );
}