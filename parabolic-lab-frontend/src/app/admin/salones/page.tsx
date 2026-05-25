import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";
import {
  ADMIN_SALONES_QUERY_KEY,
  fetchAdminSalones,
} from "@/fetchers/admin";
import AdminSalones from "@/modules/AdminSalones";

export default async function AdminSalonesPage() {
  const queryClient = new QueryClient();
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  if (token) {
    await queryClient.prefetchQuery({
      queryKey: ADMIN_SALONES_QUERY_KEY,
      queryFn: () => fetchAdminSalones(token),
    });
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AdminSalones />
    </HydrationBoundary>
  );
}
