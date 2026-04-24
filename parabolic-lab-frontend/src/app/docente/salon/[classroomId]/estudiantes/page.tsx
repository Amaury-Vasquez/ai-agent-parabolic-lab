import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { cookies } from "next/headers";
import GestionEstudiantes from "@/modules/GestionEstudiantes";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";
import {
  fetchEstudiantesBySalon,
  SALON_ESTUDIANTES_QUERY_KEY,
} from "@/queries/useEstudiantesBySalon";

interface EstudiantesPageProps {
  params: Promise<{
    classroomId: string;
  }>;
}

export default async function EstudiantesPage({
  params,
}: EstudiantesPageProps) {
  const { classroomId } = await params;
  const queryClient = new QueryClient();
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  if (token) {
    await queryClient.prefetchQuery({
      queryKey: SALON_ESTUDIANTES_QUERY_KEY(classroomId),
      queryFn: () => fetchEstudiantesBySalon(token, classroomId),
    });
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <GestionEstudiantes salonId={classroomId} />
    </HydrationBoundary>
  );
}
