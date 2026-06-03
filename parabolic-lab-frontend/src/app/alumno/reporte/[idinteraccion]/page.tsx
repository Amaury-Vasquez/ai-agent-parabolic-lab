import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";
import { fetchReporteIntento, REPORTE_INTENTO_QUERY_KEY } from "@/fetchers/reportes";
import ReporteIntentoPage from "@/modules/ReporteIntentoPage";
import { buildMetadata } from "@/utils/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Reporte del intento",
  description:
    "Revisa el análisis detallado de tu intento: ángulo, velocidad, alcance y comparación con la solución correcta.",
  noindex: true,
});

export default async function ReportePage({
  params,
}: {
  params: Promise<{ idinteraccion: string }>;
}) {
  const { idinteraccion } = await params;
  const queryClient = new QueryClient();
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  if (token) {
    await queryClient.prefetchQuery({
      queryKey: REPORTE_INTENTO_QUERY_KEY(idinteraccion),
      queryFn: () => fetchReporteIntento(token, idinteraccion),
    });
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ReporteIntentoPage />
    </HydrationBoundary>
  );
}
