import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import ClassroomDetail from "@/modules/ClassroomDetail";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";
import {
  fetchSalonProgreso,
  fetchMySalones,
  SALON_PROGRESO_QUERY_KEY,
  MY_SALONES_QUERY_KEY,
} from "@/fetchers/salones";
import { buildMetadata } from "@/utils/metadata";

interface ClassroomDetailPageProps {
  params: Promise<{
    classroomId: string;
  }>;
}

export async function generateMetadata({
  params,
}: ClassroomDetailPageProps): Promise<Metadata> {
  const { classroomId } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  let nombre: string | null = null;
  if (token) {
    try {
      const salones = await fetchMySalones(token);
      nombre =
        salones.find((s) => s.codigoacceso === classroomId)?.nombresalon ??
        null;
    } catch {
      nombre = null;
    }
  }
  return buildMetadata({
    title: nombre ? `Salón ${nombre}` : "Detalle del salón",
    description: nombre
      ? `Revisa el progreso y los escenarios del salón «${nombre}» en ParabolicLab.`
      : "Revisa el progreso y los escenarios de tu salón en ParabolicLab.",
    noindex: true,
  });
}

export default async function ClassroomDetailPage({
  params,
}: ClassroomDetailPageProps) {
  const { classroomId } = await params;
  const queryClient = new QueryClient();
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  if (token) {
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: SALON_PROGRESO_QUERY_KEY(classroomId),
        queryFn: () => fetchSalonProgreso(token, classroomId),
      }),
      queryClient.prefetchQuery({
        queryKey: MY_SALONES_QUERY_KEY,
        queryFn: () => fetchMySalones(token),
      }),
    ]);
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ClassroomDetail classroomId={classroomId} />
    </HydrationBoundary>
  );
}
