import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";
import {
  ADMIN_USUARIOS_QUERY_KEY,
  fetchAdminUsuarios,
} from "@/fetchers/admin";
import AdminUsuarios from "@/modules/AdminUsuarios";

export default async function AdminUsuariosPage() {
  const queryClient = new QueryClient();
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  if (token) {
    await queryClient.prefetchQuery({
      queryKey: ADMIN_USUARIOS_QUERY_KEY,
      queryFn: () => fetchAdminUsuarios(token),
    });
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AdminUsuarios />
    </HydrationBoundary>
  );
}
