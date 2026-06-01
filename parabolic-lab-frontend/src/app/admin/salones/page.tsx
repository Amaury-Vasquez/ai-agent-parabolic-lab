import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";
import {
  ADMIN_SALONES_QUERY_KEY,
  fetchAdminSalones,
} from "@/fetchers/admin";
import AdminSalones from "@/modules/AdminSalones";
import { buildMetadata } from "@/utils/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Salones",
  description:
    "Administra todos los salones de tiro parabólico de tu institución en ParabolicLab.",
  noindex: true,
});

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
