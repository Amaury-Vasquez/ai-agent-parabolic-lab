import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";
import Reportes from "@/modules/Reportes";
import { fetchMySalones, MY_SALONES_QUERY_KEY } from "@/fetchers/salones";
import { buildMetadata } from "@/utils/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Reportes",
  description:
    "Analiza el desempeño de tus salones con reportes detallados de las actividades de tiro parabólico.",
  noindex: true,
});

export default async function ReportesPage() {
  const queryClient = new QueryClient();
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  if (token) {
    await queryClient.prefetchQuery({
      queryKey: MY_SALONES_QUERY_KEY,
      queryFn: () => fetchMySalones(token),
    });
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Reportes />
    </HydrationBoundary>
  );
}
