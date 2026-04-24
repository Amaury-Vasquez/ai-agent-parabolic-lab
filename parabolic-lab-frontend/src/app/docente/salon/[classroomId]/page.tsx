import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { cookies } from "next/headers";
import ClassroomDetail from "@/modules/ClassroomDetail";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";
import {
  fetchSalonProgreso,
  SALON_PROGRESO_QUERY_KEY,
} from "@/queries/useSalonProgreso";

interface ClassroomDetailPageProps {
  params: Promise<{
    classroomId: string;
  }>;
}

export default async function ClassroomDetailPage({
  params,
}: ClassroomDetailPageProps) {
  const { classroomId } = await params;
  const queryClient = new QueryClient();
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  if (token) {
    await queryClient.prefetchQuery({
      queryKey: SALON_PROGRESO_QUERY_KEY(classroomId),
      queryFn: () => fetchSalonProgreso(token, classroomId),
    });
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ClassroomDetail classroomId={classroomId} />
    </HydrationBoundary>
  );
}
