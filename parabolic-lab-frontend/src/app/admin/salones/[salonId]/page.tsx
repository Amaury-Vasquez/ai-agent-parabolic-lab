import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";
import {
  ADMIN_SALON_DETALLE_QUERY_KEY,
  fetchAdminSalonDetalle,
} from "@/fetchers/admin";
import AdminSalonDetalle from "@/modules/AdminSalonDetalle";
import { buildMetadata } from "@/utils/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Detalle de salón",
  description:
    "Consulta el docente y los estudiantes inscritos en un salón de tu institución en ParabolicLab.",
  noindex: true,
});

interface AdminSalonPageProps {
  params: Promise<{ salonId: string }>;
}

export default async function AdminSalonPage({ params }: AdminSalonPageProps) {
  const { salonId } = await params;
  const queryClient = new QueryClient();
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  if (token) {
    await queryClient.prefetchQuery({
      queryKey: ADMIN_SALON_DETALLE_QUERY_KEY(salonId),
      queryFn: () => fetchAdminSalonDetalle(token, salonId),
    });
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AdminSalonDetalle salonId={salonId} />
    </HydrationBoundary>
  );
}
