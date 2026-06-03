import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";
import {
  fetchMisActividades,
  MIS_ACTIVIDADES_QUERY_KEY,
} from "@/fetchers/actividades";
import ActividadesSalon from "@/modules/ActividadesSalon";
import { buildMetadata } from "@/utils/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Actividades del salón",
  description:
    "Consulta las actividades de tiro parabólico asignadas en este salón.",
  noindex: true,
});

interface ClassroomActividadesPageProps {
  params: Promise<{
    classroomId: string;
  }>;
}

export default async function ClassroomActividadesPage({
  params,
}: ClassroomActividadesPageProps) {
  const { classroomId } = await params;
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
      <ActividadesSalon classroomId={classroomId} />
    </HydrationBoundary>
  );
}
