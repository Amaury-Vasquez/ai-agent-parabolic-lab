import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";
import {
  ADMIN_OVERVIEW_QUERY_KEY,
  fetchAdminOverview,
} from "@/fetchers/admin";
import AdminOverview from "@/modules/AdminOverview";
import { buildMetadata } from "@/utils/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Panel de administración",
  description:
    "Supervisa la actividad de tu institución en ParabolicLab: salones, usuarios y desempeño general.",
  noindex: true,
});

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
