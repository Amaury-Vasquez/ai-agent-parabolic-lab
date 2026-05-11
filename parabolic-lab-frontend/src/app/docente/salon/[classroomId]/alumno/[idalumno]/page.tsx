import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";
import {
  fetchDesempenoAlumno,
  SALON_ALUMNO_DESEMPENO_QUERY_KEY,
} from "@/fetchers/salones";
import EstudianteDetalle from "@/modules/EstudianteDetalle";

interface EstudianteDetallePageProps {
  params: Promise<{
    classroomId: string;
    idalumno: string;
  }>;
}

export default async function EstudianteDetallePage({
  params,
}: EstudianteDetallePageProps) {
  const { classroomId, idalumno } = await params;
  const queryClient = new QueryClient();
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  if (token) {
    await queryClient.prefetchQuery({
      queryKey: SALON_ALUMNO_DESEMPENO_QUERY_KEY(classroomId, idalumno),
      queryFn: () => fetchDesempenoAlumno(token, classroomId, idalumno),
    });
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <EstudianteDetalle classroomId={classroomId} alumnoId={idalumno} />
    </HydrationBoundary>
  );
}
