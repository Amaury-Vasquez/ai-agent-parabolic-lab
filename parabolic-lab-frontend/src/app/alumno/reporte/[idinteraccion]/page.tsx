import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";
import { fetchReporteIntento, REPORTE_INTENTO_QUERY_KEY } from "@/fetchers/reportes";
import ReporteIntentoPage from "@/modules/ReporteIntentoPage";

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
