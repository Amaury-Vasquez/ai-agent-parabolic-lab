import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";
import {
  ADMIN_USUARIOS_QUERY_KEY,
  fetchAdminUsuarios,
} from "@/fetchers/admin";
import AdminUsuarios from "@/modules/AdminUsuarios";
import { buildMetadata } from "@/utils/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Usuarios",
  description: "Gestiona los docentes y estudiantes registrados en tu institución.",
  noindex: true,
});

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
