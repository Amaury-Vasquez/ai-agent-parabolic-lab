import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";
import PerfilAlumno from "@/modules/PerfilAlumno";
import { fetchMe, ME_QUERY_KEY } from "@/fetchers/auth";

export default async function PerfilAlumnoPage() {
  const queryClient = new QueryClient();
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  if (token) {
    await queryClient.prefetchQuery({
      queryKey: ME_QUERY_KEY,
      queryFn: () => fetchMe(token),
    });
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PerfilAlumno />
    </HydrationBoundary>
  );
}