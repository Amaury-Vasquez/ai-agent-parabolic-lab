import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";
import {
  ADMIN_OVERVIEW_QUERY_KEY,
  fetchAdminOverview,
} from "@/fetchers/admin";
import AdminOverview from "@/modules/AdminOverview";

export default async function AdminPage() {
  const queryClient = new QueryClient();
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  if (token) {
    await queryClient.prefetchQuery({
      queryKey: ADMIN_OVERVIEW_QUERY_KEY,
      queryFn: () => fetchAdminOverview(token),
    });
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AdminOverview />
    </HydrationBoundary>
  );
}
